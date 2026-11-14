import { isSubmissionId } from '#lib/domain/submissionId.ts';
import { emptyValues, type FormValues } from './fields.ts';

/** `localStorage` key for the in-progress application (step 3.5). One cycle, one key. */
export const DRAFT_KEY = 'dscubed-2027s1-draft';

/** How long typing must pause before the draft is written. */
export const DRAFT_DEBOUNCE_MS = 500;

/**
 * Reads a stored draft defensively: anything that isn't a known text field holding a string is
 * dropped, so an old or tampered draft can never break the form.
 */
export function parseDraft(raw: string | null): Partial<FormValues> | null {
	if (!raw) return null;
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return null;
	}
	if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;

	const known = Object.keys(emptyValues()) as (keyof FormValues)[];
	const draft: Partial<FormValues> = {};
	for (const key of known) {
		const value = (data as Record<string, unknown>)[key];
		if (typeof value === 'string') draft[key] = value;
	}
	return Object.keys(draft).length ? draft : null;
}

/**
 * The submission ID saved with a draft, if it's a valid one. Reusing it on every attempt lets the
 * server recognise a retry of an application that already went through.
 */
export function parseDraftSubmissionId(raw: string | null): string | null {
	if (!raw) return null;
	try {
		const id = (JSON.parse(raw) as Record<string, unknown> | null)?.submissionId;
		return isSubmissionId(id) ? id : null;
	} catch {
		return null;
	}
}

/** True when nothing has been typed or picked, so there is nothing worth saving. */
export function isBlank(values: FormValues): boolean {
	return Object.values(values).every((v) => v.trim() === '');
}
