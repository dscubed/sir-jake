import type { RecruitmentConfig } from '#lib/config/types.ts';
import type {
	Application,
	ResumeFile,
	SubmitFailureReason,
	SubmitResult
} from '#lib/domain/application.ts';
import { parseApplicationForm, type ApplicationInput } from '#lib/domain/schema.ts';
import { applicationWindow, windowState, type ApplicationWindow } from '#lib/domain/window.ts';
import {
	UpstreamError,
	type ApplicantRepository,
	type CaptchaVerifier,
	type Clock
} from './ports.ts';
import { isHoneypotFilled, TURNSTILE_FIELD } from './turnstile.ts';

export type SubmitOutcome = 'ok' | SubmitFailureReason;

/** One line per submission. Never contains names, emails, answers or file contents. */
export interface SubmissionLog {
	submissionId: string;
	outcome: SubmitOutcome;
	durationMs: number;
	/** Which repository call failed, for `upstream` outcomes. */
	step?: UpstreamError['operation'];
}

export interface ApplicationServiceOptions {
	repo: ApplicantRepository;
	captcha: CaptchaVerifier;
	clock: Clock;
	config: RecruitmentConfig;
	/** Defaults to one JSON line on stdout, which Vercel keeps in its function logs. */
	log?: (entry: SubmissionLog) => void;
}

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

export function hasPdfSignature(bytes: Uint8Array): boolean {
	return PDF_SIGNATURE.every((byte, i) => bytes[i] === byte);
}

const defaultLog = (entry: SubmissionLog) => console.info(JSON.stringify(entry));

export class ApplicationService {
	private readonly repo: ApplicantRepository;
	private readonly captcha: CaptchaVerifier;
	private readonly clock: Clock;
	private readonly window: ApplicationWindow | undefined;
	private readonly log: (entry: SubmissionLog) => void;

	constructor({ repo, captcha, clock, config, log = defaultLog }: ApplicationServiceOptions) {
		this.repo = repo;
		this.captcha = captcha;
		this.clock = clock;
		this.window = applicationWindow(config);
		this.log = log;
	}

	/**
	 * Runs the checks from cheapest to most expensive, and writes to Notion only once every check
	 * has passed. Always returns a result and never throws.
	 */
	async submit(form: FormData, ip: string): Promise<SubmitResult> {
		const started = performance.now();
		const submissionId = crypto.randomUUID();
		let step: UpstreamError['operation'] | undefined;

		const finish = (result: SubmitResult): SubmitResult => {
			this.log({
				submissionId,
				outcome: result.ok ? 'ok' : result.reason,
				durationMs: Math.round(performance.now() - started),
				...(step && !result.ok && result.reason === 'upstream' ? { step } : {})
			});
			return result;
		};

		try {
			const now = this.clock.now();
			if (windowState(now, this.window) !== 'open') return finish({ ok: false, reason: 'closed' });

			if (isHoneypotFilled(form)) return finish({ ok: false, reason: 'captcha' });
			const token = form.get(TURNSTILE_FIELD);
			if (typeof token !== 'string' || !(await this.captcha.verify(token, ip))) {
				return finish({ ok: false, reason: 'captcha' });
			}

			const parsed = parseApplicationForm(form);
			if (!parsed.success) {
				return finish({ ok: false, reason: 'invalid', fieldErrors: parsed.fieldErrors });
			}

			const resume = await readResume(parsed.data.resume);
			if (!hasPdfSignature(resume.bytes)) {
				return finish({
					ok: false,
					reason: 'invalid',
					fieldErrors: { resume: ['Your resume must be a PDF'] }
				});
			}

			const app = toApplication(parsed.data, resume, submissionId, now);

			step = 'existsByEmail';
			if (await this.repo.existsByEmail(app.email)) {
				return finish({ ok: false, reason: 'duplicate' });
			}
			step = 'uploadResume';
			const uploadId = await this.repo.uploadResume(resume);
			step = 'create';
			const pageId = await this.repo.create(app, uploadId);

			return finish({ ok: true, pageId, submittedAt: now });
		} catch (error) {
			if (!(error instanceof UpstreamError)) {
				// A bug rather than a Notion failure. Log the error type only, never its message,
				// since a message could contain applicant data.
				console.error(
					JSON.stringify({ submissionId, unexpectedError: (error as Error)?.name ?? 'unknown' })
				);
			}
			return finish({ ok: false, reason: 'upstream' });
		}
	}
}

async function readResume(file: File): Promise<ResumeFile> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	return { filename: file.name, sizeBytes: bytes.length, bytes };
}

function toApplication(
	input: ApplicationInput,
	resume: ResumeFile,
	submissionId: string,
	submittedAt: Date
): Application {
	return {
		submissionId,
		fullName: input.fullName,
		email: input.email,
		degree: input.degree,
		graduation: input.graduation,
		availableGroup: input.availableGroup,
		availableIndividual: input.availableIndividual,
		firstPreference: input.firstPreference,
		secondPreference: input.secondPreference,
		responses: {
			general: input.answerGeneral,
			firstPreference: input.answerFirst,
			secondPreference: input.answerSecond
		},
		resume,
		submittedAt
	};
}
