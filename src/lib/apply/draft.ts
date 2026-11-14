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

/** True when nothing has been typed or picked, so there is nothing worth saving. */
export function isBlank(values: FormValues): boolean {
	return Object.values(values).every((v) => v.trim() === '');
}
