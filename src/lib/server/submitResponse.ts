import type { FieldErrors, SubmitResult } from '#lib/domain/application.ts';

export type ApplyActionData =
	| { ok: true; submittedAt: string }
	| { ok: false; reason: 'closed' | 'captcha' | 'duplicate' | 'upstream' }
	| { ok: false; reason: 'invalid'; fieldErrors: FieldErrors };

const STATUS = {
	closed: 403,
	captcha: 400,
	invalid: 400,
	duplicate: 409,
	upstream: 502
} as const;

/**
 * The HTTP status and the data the form action sends back for each outcome. Nothing from the
 * application itself is echoed back: no page ID, and never the uploaded file.
 */
export function toActionResponse(result: SubmitResult): { status: number; data: ApplyActionData } {
	if (result.ok) {
		return { status: 200, data: { ok: true, submittedAt: result.submittedAt.toISOString() } };
	}
	if (result.reason === 'invalid') {
		return {
			status: STATUS.invalid,
			data: { ok: false, reason: 'invalid', fieldErrors: result.fieldErrors }
		};
	}
	return { status: STATUS[result.reason], data: { ok: false, reason: result.reason } };
}
