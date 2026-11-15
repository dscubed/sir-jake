import type { Application, ResumeFile } from '#lib/domain/application.ts';
import { countWords } from '#lib/domain/words.ts';
import {
	UpstreamError,
	type ApplicantRepository,
	type ExistingApplication,
	type FileUploadId,
	type PageId
} from './ports.ts';

export interface FakeRepositoryOptions {
	/** `findByEmail` always finds an application made by someone else (a different submission). */
	duplicate?: boolean;
	/** `findByEmail` throws `UpstreamError`. */
	upstreamOnCheck?: boolean;
	/** `uploadResume` throws `UpstreamError`. */
	upstreamOnUpload?: boolean;
	/** `create` throws `UpstreamError`. */
	upstreamOnCreate?: boolean;
	/** Where the summary of each created application goes. Defaults to `console.info`. */
	log?: (message: string) => void;
}

export type FakeRepositoryCall = 'findByEmail' | 'uploadResume' | 'create';

/**
 * In-memory `ApplicantRepository` for unit tests and for running the app locally without Notion.
 */
export class FakeApplicantRepository implements ApplicantRepository {
	/** Created applications, keyed by email. */
	readonly applications = new Map<string, { pageId: PageId; app: Application }>();
	/** Uploaded resumes, keyed by upload ID. */
	readonly uploads = new Map<FileUploadId, ResumeFile>();
	/** Every method call in order, including ones that threw. */
	readonly calls: FakeRepositoryCall[] = [];

	private readonly options: FakeRepositoryOptions;
	private nextId = 1;

	constructor(options: FakeRepositoryOptions = {}) {
		this.options = options;
	}

	async findByEmail(email: string): Promise<ExistingApplication | undefined> {
		this.calls.push('findByEmail');
		if (this.options.upstreamOnCheck) throw new UpstreamError('findByEmail');
		const stored = this.applications.get(email);
		if (stored) {
			return {
				pageId: stored.pageId,
				submissionId: stored.app.submissionId,
				submittedAt: stored.app.submittedAt
			};
		}
		if (this.options.duplicate) {
			return { pageId: 'fake-page-other', submissionId: 'someone-else', submittedAt: undefined };
		}
		return undefined;
	}

	async uploadResume(file: ResumeFile): Promise<FileUploadId> {
		this.calls.push('uploadResume');
		if (this.options.upstreamOnUpload) throw new UpstreamError('uploadResume');
		const id = `fake-upload-${this.nextId++}`;
		this.uploads.set(id, file);
		return id;
	}

	async create(app: Application, resume: FileUploadId): Promise<PageId> {
		this.calls.push('create');
		if (this.options.upstreamOnCreate) throw new UpstreamError('create');
		if (!this.uploads.has(resume)) throw new Error(`Unknown resume upload: ${resume}`);
		if (this.applications.has(app.email)) {
			throw new Error(`An application for ${app.email} already exists; check findByEmail first`);
		}

		const pageId = `fake-page-${this.nextId++}`;
		this.applications.set(app.email, { pageId, app });
		(this.options.log ?? console.info)(summarise(pageId, app));
		return pageId;
	}
}

function summarise(pageId: PageId, app: Application): string {
	const kb = Math.round(app.resume.sizeBytes / 1024);
	const words = (text: string) => `${countWords(text)} words`;
	return [
		`[fake repository] created ${pageId} (submission ${app.submissionId})`,
		`  ${app.fullName} <${app.email}>, ${app.degree}, graduating ${app.graduation}`,
		`  Roles: 1. ${app.firstPreference}  2. ${app.secondPreference}`,
		`  Interviews: group ${app.availableGroup.join(', ')}; individual ${app.availableIndividual.join(', ')}`,
		`  Answers: general ${words(app.responses.general)}, first ${words(app.responses.firstPreference)}, second ${words(app.responses.secondPreference)}`,
		`  Resume: ${app.resume.filename} (${kb} KB)`,
		`  Submitted at ${app.submittedAt.toISOString()}`
	].join('\n');
}
