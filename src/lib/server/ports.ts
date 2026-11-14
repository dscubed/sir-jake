import type { Application, ResumeFile } from '#lib/domain/application.ts';

/** ID of a Notion file upload whose status is `uploaded`, ready to attach to a page. */
export type FileUploadId = string;

/** ID of a created Notion page. */
export type PageId = string;

/**
 * Thrown by an `ApplicantRepository` when Notion still fails after the repository's own retries.
 * Callers should treat it as a temporary failure: nothing was created, and the applicant can retry.
 */
export class UpstreamError extends Error {
	/** Which repository call failed. Safe to log; never contains applicant data. */
	readonly operation: 'existsByEmail' | 'uploadResume' | 'create';

	constructor(operation: UpstreamError['operation'], options?: { cause?: unknown }) {
		super(`Notion ${operation} failed after retries`, options);
		this.name = 'UpstreamError';
		this.operation = operation;
	}
}

/** Where applications are stored. Implemented by the Notion repository and an in-memory fake. */
export interface ApplicantRepository {
	/**
	 * Whether an application with this email already exists.
	 * @param email Already trimmed and lowercased.
	 * @throws {UpstreamError} if Notion fails after retries.
	 */
	existsByEmail(email: string): Promise<boolean>;

	/**
	 * Uploads the resume so it can be attached to the page. An upload that is never attached is
	 * simply left unused.
	 * @returns The upload's ID, once its status is `uploaded`.
	 * @throws {UpstreamError} if Notion fails after retries.
	 */
	uploadResume(file: ResumeFile): Promise<FileUploadId>;

	/**
	 * Creates the applicant's page with its properties, responses and empty interview-notes
	 * sections, with `Stage` set to Applied.
	 *
	 * If the request times out or Notion returns a 5xx, the repository checks whether the page was
	 * created anyway and returns it if so, so a retry never creates a duplicate page.
	 * @param resume An ID returned by `uploadResume`.
	 * @returns The new page's ID.
	 * @throws {UpstreamError} if Notion fails after retries and the page does not exist.
	 */
	create(app: Application, resume: FileUploadId): Promise<PageId>;
}

/** Bot check for a submission. */
export interface CaptchaVerifier {
	/**
	 * @param token The `cf-turnstile-response` value posted by the form.
	 * @param ip The client's IP address, passed on to the provider.
	 * @returns `true` only if the provider confirms the token. Network and provider errors return
	 *   `false`; this method never throws.
	 */
	verify(token: string, ip: string): Promise<boolean>;
}

/** Source of the current time, so tests can simulate the application window opening and closing. */
export interface Clock {
	now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };
