import type { Role } from '#lib/config/types.ts';

export type RoleId = Role['id'];

/** The `name` of every field the application form posts. */
export type ApplicationField =
	| 'fullName'
	| 'email'
	| 'degree'
	| 'graduation'
	| 'availableGroup'
	| 'availableIndividual'
	| 'firstPreference'
	| 'secondPreference'
	| 'answerGeneral'
	| 'answerFirst'
	| 'answerSecond'
	| 'resume';

/** Error messages per form field, shown beside the matching input. */
export type FieldErrors = Partial<Record<ApplicationField, string[]>>;

export interface ResumeFile {
	filename: string;
	sizeBytes: number;
	/** The PDF contents, already checked to start with `%PDF-`. */
	bytes: Uint8Array;
}

export interface Responses {
	general: string;
	/** Answer to the first-preference role's question. */
	firstPreference: string;
	/** Answer to the second-preference role's question. */
	secondPreference: string;
}

/** A validated application, ready to be written to Notion. */
export interface Application {
	/** Server-generated UUID that links the Notion page to the server logs. */
	submissionId: string;
	fullName: string;
	/** Trimmed and lowercased. Used as the uniqueness key. */
	email: string;
	degree: string;
	/** One of the config's `graduationOptions`. */
	graduation: string;
	/** Group interview sessions the applicant can attend, from the config. At least one. */
	availableGroup: string[];
	/** Individual interview days the applicant can do, from the config. At least one. */
	availableIndividual: string[];
	firstPreference: RoleId;
	/** Always different from `firstPreference`. */
	secondPreference: RoleId;
	responses: Responses;
	resume: ResumeFile;
	/** Server clock time when the submission was accepted. */
	submittedAt: Date;
}

/**
 * The outcome of one submission
 */
export type SubmitResult =
	| { ok: true; pageId: string; submittedAt: Date }
	/** Outside the application window. */
	| { ok: false; reason: 'closed' }
	/** Honeypot filled in, or the CAPTCHA check failed. */
	| { ok: false; reason: 'captcha' }
	| { ok: false; reason: 'invalid'; fieldErrors: FieldErrors }
	/** An application with this email already exists. */
	| { ok: false; reason: 'duplicate' }
	/** Notion failed after retries. The applicant can safely try again. */
	| { ok: false; reason: 'upstream' };

export type SubmitFailureReason = Extract<SubmitResult, { ok: false }>['reason'];
