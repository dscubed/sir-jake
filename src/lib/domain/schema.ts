import { z } from 'zod';
import { recruitment } from '#lib/config/recruitment.ts';
import type { ApplicationField, FieldErrors } from '#lib/domain/application.ts';
import { countWords } from '#lib/domain/words.ts';

const { wordLimit, maxResumeBytes } = recruitment;
const maxResumeMb = maxResumeBytes / (1024 * 1024);
const maxAnswerChars = 2000;

const roleIds = recruitment.roles.map((r) => r.id) as [string, ...string[]];

const required = (max: number, tooLong: string) =>
	z.string({ error: 'Required' }).trim().min(1, 'Required').max(max, tooLong);

const answer = z
	.string({ error: 'Required' })
	.trim()
	.refine((t) => countWords(t) >= 1, { message: 'Required', abort: true })
	.refine((t) => countWords(t) <= wordLimit, {
		message: `Keep your answer to ${wordLimit} words or fewer`,
		abort: true
	})
	.refine(
		(t) => t.length <= maxAnswerChars,
		`Keep your answer to ${maxAnswerChars} characters or fewer`
	);

const yesNo = z.enum(['yes', 'no'], { error: 'Choose yes or no' }).transform((v) => v === 'yes');

const role = z.enum(roleIds, { error: 'Choose a role' });

const resume = z
	.instanceof(File, { error: 'Attach your resume' })
	.refine((f) => f.size > 0, { message: 'Attach your resume', abort: true })
	.refine((f) => f.type === 'application/pdf' && f.name.toLowerCase().endsWith('.pdf'), {
		message: 'Your resume must be a PDF',
		abort: true
	})
	.refine((f) => f.size <= maxResumeBytes, `Your resume must be ${maxResumeMb} MB or smaller`);

/**
 * Validates and normalises the application form.
 * Used in the browser as well as on the server
 * so this module must not import anything server-only.
 */
export const applicationSchema = z
	.object({
		fullName: required(100, 'Keep your name to 100 characters or fewer'),
		email: z
			.string({ error: 'Required' })
			.trim()
			.toLowerCase()
			.min(1, 'Required')
			.max(254, 'Keep your email to 254 characters or fewer')
			.pipe(z.email('Enter a valid email address')),
		degree: required(150, 'Keep your degree to 150 characters or fewer'),
		graduation: z.enum(recruitment.graduationOptions as [string, ...string[]], {
			error: 'Choose your expected graduation'
		}),
		availableGroup: yesNo,
		availableIndividual: yesNo,
		firstPreference: role,
		secondPreference: role,
		answerGeneral: answer,
		answerFirst: answer,
		answerSecond: answer,
		resume
	} satisfies Record<ApplicationField, z.ZodType>)
	.refine((d) => d.firstPreference !== d.secondPreference, {
		path: ['secondPreference'],
		message: 'Choose two different roles'
	});

export type ApplicationInput = z.output<typeof applicationSchema>;

export type ParseResult =
	{ success: true; data: ApplicationInput } | { success: false; fieldErrors: FieldErrors };

/** Parses a posted form. Missing fields are reported as "Required", never thrown. */
export function parseApplicationForm(form: FormData): ParseResult {
	const raw: Record<string, FormDataEntryValue | undefined> = {};
	for (const key of Object.keys(applicationSchema.shape) as ApplicationField[]) {
		raw[key] = form.get(key) ?? undefined;
	}
	const result = applicationSchema.safeParse(raw);
	if (result.success) return { success: true, data: result.data };
	return { success: false, fieldErrors: z.flattenError(result.error).fieldErrors as FieldErrors };
}
