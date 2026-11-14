import {
	DRAFT_DEBOUNCE_MS,
	DRAFT_KEY,
	isBlank,
	parseDraft,
	parseDraftSubmissionId
} from './draft.ts';
import type { FormValues } from './fields.ts';

/** The applicant's own clock and time zone: it's their draft, on their device. */
const timeFormat = new Intl.DateTimeFormat('en-AU', { hour: 'numeric', minute: '2-digit' });

/**
 * Saves the applicant's answers to this browser while they type (step 3.5, NFR3).
 *
 * Every storage call is wrapped in try/catch: private browsing, full storage or blocked site data
 * must never stop someone applying. The resume is never saved, because browsers can't restore
 * a file input.
 */
export class DraftStore {
	/** When the draft was last written (ms since epoch), for "Draft saved at 3:41 pm". */
	savedAt = $state<number | null>(null);

	/**
	 * One ID per draft, posted as the hidden `submissionId` field on every attempt and kept with the
	 * draft, so a retry after a timeout is recognised by the server instead of rejected as a
	 * duplicate. A new ID starts with each new draft.
	 *
	 * Empty until `load()` runs in the browser, so the server render and hydration agree. Without
	 * JavaScript the field stays empty and the server assigns its own ID.
	 */
	submissionId = $state('');

	#timer: ReturnType<typeof setTimeout> | undefined;

	/** Reads the saved draft (browser only) and settles this draft's submission ID. */
	load(): Partial<FormValues> | null {
		let raw: string | null = null;
		try {
			raw = localStorage.getItem(DRAFT_KEY);
		} catch {
			// Storage unavailable: start a fresh draft.
		}
		this.submissionId = parseDraftSubmissionId(raw) ?? crypto.randomUUID();
		return parseDraft(raw);
	}

	/** Debounced: only the last call within 500 ms is written. */
	schedule(values: FormValues) {
		clearTimeout(this.#timer);
		const snapshot = JSON.stringify({ ...values, submissionId: this.submissionId });
		const blank = isBlank(values);
		this.#timer = setTimeout(() => {
			try {
				if (blank) {
					localStorage.removeItem(DRAFT_KEY);
					this.savedAt = null;
				} else {
					localStorage.setItem(DRAFT_KEY, snapshot);
					this.savedAt = Date.now();
				}
			} catch {
				// Storage unavailable: the form still works, it just won't survive a refresh.
			}
		}, DRAFT_DEBOUNCE_MS);
	}

	/** Removes the draft and starts a new submission ID. Called after success and by "Clear form". */
	clear() {
		clearTimeout(this.#timer);
		this.savedAt = null;
		this.submissionId = crypto.randomUUID();
		try {
			localStorage.removeItem(DRAFT_KEY);
		} catch {
			// Nothing to clear.
		}
	}

	/** Stops a pending save, e.g. when the page is left. */
	cancel() {
		clearTimeout(this.#timer);
	}

	get note(): string {
		if (this.savedAt === null) return 'Drafts save automatically';
		return `Draft saved at ${timeFormat.format(this.savedAt)}`;
	}
}
