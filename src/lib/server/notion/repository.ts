import { Client } from '@notionhq/client';
import type { RecruitmentConfig } from '#lib/config/types.ts';
import type { Application, ResumeFile } from '#lib/domain/application.ts';
import {
	UpstreamError,
	type ApplicantRepository,
	type FileUploadId,
	type PageId
} from '#lib/server/ports.ts';
import { children, properties } from './pageBuilder.ts';
import { PROP } from './properties.ts';
import { classify, defaultRetryPolicy, withRetry, type RetryPolicy } from './retry.ts';

/** The data-source endpoints this repository uses need at least this API version. */
export const NOTION_VERSION = '2025-09-03';

const PDF_TYPE = 'application/pdf';

/** Notion requests that take longer than this count as timed out. */
export const NOTION_TIMEOUT_MS = 10_000;

/**
 * The SDK's own retries are turned off: this repository applies one retry policy to every call,
 * including the POST requests the SDK won't retry after a server error.
 */
export function createNotionClient(token: string): Client {
	return new Client({
		auth: token,
		notionVersion: NOTION_VERSION,
		timeoutMs: NOTION_TIMEOUT_MS,
		retry: false
	});
}

export interface NotionRepositoryOptions {
	client: Client;
	/** The Applications data source (not the database) ID. */
	dataSourceId: string;
	config: RecruitmentConfig;
	retry?: Partial<RetryPolicy>;
}

export class NotionApplicantRepository implements ApplicantRepository {
	private readonly client: Client;
	private readonly dataSourceId: string;
	readonly config: RecruitmentConfig;
	private readonly retry: RetryPolicy;

	constructor({ client, dataSourceId, config, retry }: NotionRepositoryOptions) {
		this.client = client;
		this.dataSourceId = dataSourceId;
		this.config = config;
		this.retry = { ...defaultRetryPolicy, ...retry };
	}

	async existsByEmail(email: string): Promise<boolean> {
		try {
			return (await this.findPageId(email)) !== undefined;
		} catch (cause) {
			throw new UpstreamError('existsByEmail', { cause });
		}
	}

	/** Reads are safe to repeat, so any rejected or uncertain failure is retried. */
	private findPageId(email: string): Promise<PageId | undefined> {
		return withRetry(
			async () => {
				const response = await this.client.dataSources.query({
					data_source_id: this.dataSourceId,
					filter: { property: PROP.email, email: { equals: email } },
					page_size: 1,
					result_type: 'page'
				});
				return response.results[0]?.id;
			},
			['rejected', 'unknown'],
			this.retry
		);
	}

	/**
	 * Retrying starts a fresh upload. An upload left behind by a failed attempt is never attached
	 * to a page, so it is harmless.
	 */
	async uploadResume(file: ResumeFile): Promise<FileUploadId> {
		try {
			return await withRetry(() => this.uploadOnce(file), ['rejected', 'unknown'], this.retry);
		} catch (cause) {
			throw new UpstreamError('uploadResume', { cause });
		}
	}

	private async uploadOnce(file: ResumeFile): Promise<FileUploadId> {
		const upload = await this.client.fileUploads.create({
			mode: 'single_part',
			filename: file.filename,
			content_type: PDF_TYPE
		});
		const sent = await this.client.fileUploads.send({
			file_upload_id: upload.id,
			file: {
				filename: file.filename,
				data: new Blob([new Uint8Array(file.bytes)], { type: PDF_TYPE })
			}
		});
		if (sent.status !== 'uploaded') {
			throw new Error(`File upload finished with status "${sent.status}"`);
		}
		return sent.id;
	}

	/**
	 * Page creation is only retried when Notion rejected the request outright. After a timeout or
	 * a 5xx the page may already exist, so instead of retrying, this checks for it by email and
	 * returns it if it was created. That way a retry never creates a duplicate page.
	 */
	async create(app: Application, resume: FileUploadId): Promise<PageId> {
		try {
			return await withRetry(
				async () => {
					const page = await this.client.pages.create({
						parent: { type: 'data_source_id', data_source_id: this.dataSourceId },
						properties: properties(app, resume, this.config),
						children: children(app, this.config)
					});
					return page.id;
				},
				['rejected'],
				this.retry
			);
		} catch (cause) {
			if (classify(cause) !== 'unknown') throw new UpstreamError('create', { cause });
			const existing = await this.findCreatedPage(app.email);
			if (existing) return existing;
			throw new UpstreamError('create', { cause });
		}
	}

	private async findCreatedPage(email: string): Promise<PageId | undefined> {
		try {
			await this.retry.sleep(this.retry.baseDelayMs);
			return await this.findPageId(email);
		} catch {
			return undefined;
		}
	}
}
