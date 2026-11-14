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

/** The data-source endpoints this repository uses need at least this API version. */
export const NOTION_VERSION = '2025-09-03';

const PDF_TYPE = 'application/pdf';

export function createNotionClient(token: string): Client {
	return new Client({ auth: token, notionVersion: NOTION_VERSION });
}

export interface NotionRepositoryOptions {
	client: Client;
	/** The Applications data source (not the database) ID. */
	dataSourceId: string;
	config: RecruitmentConfig;
}

export class NotionApplicantRepository implements ApplicantRepository {
	private readonly client: Client;
	private readonly dataSourceId: string;
	readonly config: RecruitmentConfig;

	constructor({ client, dataSourceId, config }: NotionRepositoryOptions) {
		this.client = client;
		this.dataSourceId = dataSourceId;
		this.config = config;
	}

	async existsByEmail(email: string): Promise<boolean> {
		try {
			const response = await this.client.dataSources.query({
				data_source_id: this.dataSourceId,
				filter: { property: PROP.email, email: { equals: email } },
				page_size: 1,
				result_type: 'page'
			});
			return response.results.length > 0;
		} catch (cause) {
			throw new UpstreamError('existsByEmail', { cause });
		}
	}

	async uploadResume(file: ResumeFile): Promise<FileUploadId> {
		try {
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
		} catch (cause) {
			throw new UpstreamError('uploadResume', { cause });
		}
	}

	async create(app: Application, resume: FileUploadId): Promise<PageId> {
		try {
			const page = await this.client.pages.create({
				parent: { type: 'data_source_id', data_source_id: this.dataSourceId },
				properties: properties(app, resume, this.config),
				children: children(app, this.config)
			});
			return page.id;
		} catch (cause) {
			throw new UpstreamError('create', { cause });
		}
	}
}
