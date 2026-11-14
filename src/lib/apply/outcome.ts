import type { ActionResult } from '$app/forms';
import type {
	ApplicationField,
	FieldErrors,
	SubmitFailureReason
} from '#lib/domain/application.ts';
import type { FormErrors } from './fields.ts';

/**
 * What the `/apply` form action returns (design §8). Step 2.8 implements the server side;
 * this is the browser's reading of that contract.
 */
export type ApplyActionData =
	| { ok: true; submittedAt: Date | string }
	| { reason: Exclude<SubmitFailureReason, 'invalid'> }
	| { reason: 'invalid'; fieldErrors: FieldErrors };

/** What the page shows after a submission. */
export type Outcome =
	| { kind: 'success'; submittedAt: Date }
	| { kind: 'closed' }
	| { kind: 'invalid'; fieldErrors: FormErrors }
	| { kind: 'retry'; reason: 'captcha' | 'duplicate' | 'upstream'; message: string };

/** Banner copy for outcomes that keep the form on screen (design §8). */
export const outcomeMessages = {
	captcha:
		'We couldn’t confirm you’re not a bot. Please complete the verification check and submit again.',
	duplicate:
		'An application with this email already exists. Contact DSCubed if you need to change it.',
	upstream: 'Something went wrong, please try again. Your answers are still here.'
} as const;

const retry = (reason: keyof typeof outcomeMessages): Outcome => ({
	kind: 'retry',
	reason,
	message: outcomeMessages[reason]
});

/** Keeps the first message per field, which is all the form shows. */
function firstMessages(fieldErrors: FieldErrors): FormErrors {
	const errors: FormErrors = {};
	for (const [field, messages] of Object.entries(fieldErrors)) {
		if (messages?.length) errors[field as ApplicationField] = messages[0];
	}
	return errors;
}

/**
 * Turns the action's result into a UI outcome. Anything unexpected (a crash, a redirect, an
 * unknown reason) is treated as a temporary failure, so the applicant can safely try again.
 */
export function outcomeFromResult(result: ActionResult): Outcome {
	if (result.type === 'success') {
		const data = result.data as Partial<{ ok: boolean; submittedAt: Date | string }> | undefined;
		if (data?.ok && data.submittedAt) {
			const submittedAt = new Date(data.submittedAt);
			if (!Number.isNaN(submittedAt.getTime())) return { kind: 'success', submittedAt };
		}
		return retry('upstream');
	}

	if (result.type === 'failure') {
		const data = result.data as Partial<{ reason: string; fieldErrors: FieldErrors }> | undefined;
		switch (data?.reason) {
			case 'closed':
				return { kind: 'closed' };
			case 'invalid':
				return { kind: 'invalid', fieldErrors: firstMessages(data.fieldErrors ?? {}) };
			case 'captcha':
			case 'duplicate':
			case 'upstream':
				return retry(data.reason);
		}
	}

	return retry('upstream');
}

const submittedFormat = new Intl.DateTimeFormat('en-AU', {
	timeZone: 'Australia/Melbourne',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit'
});

/** "14 November 2026 at 7:42 pm", in Melbourne time like the Notion `Submitted at` property. */
export function formatSubmittedAt(date: Date): string {
	return submittedFormat.format(date);
}
