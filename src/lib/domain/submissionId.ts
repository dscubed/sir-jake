/**
 * Name of the hidden form field holding the draft's submission ID. The browser creates the ID once
 * per draft and sends the same one on every attempt, so the server can recognise a retry of an
 * application that already went through.
 */
export const SUBMISSION_ID_FIELD = 'submissionId';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Whether a value is a lowercase random (v4) UUID, the format `crypto.randomUUID()` produces. */
export function isSubmissionId(value: unknown): value is string {
	return typeof value === 'string' && UUID_V4.test(value);
}
