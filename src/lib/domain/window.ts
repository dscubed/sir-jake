import type { RecruitmentConfig } from '#lib/config/types.ts';

/** Where `now` falls relative to the application window (FR8). */
export type WindowStatus = 'upcoming' | 'open' | 'closed';

type WindowDates = Pick<RecruitmentConfig, 'opensAt' | 'closesAt'>;

/** Parses an ISO 8601 config date. Returns `null` for "TBD" or anything else that isn't a date. */
export function parseConfigDate(value: string): Date | null {
	const time = Date.parse(value);
	return Number.isNaN(time) ? null : new Date(time);
}

/**
 * Works out whether applications are upcoming, open or closed.
 * The window is half-open: open from `opensAt` (inclusive) until `closesAt` (exclusive).
 * An unconfirmed ("TBD") opening date counts as upcoming, so the form never opens by accident.
 * An unconfirmed closing date leaves the window open once it has opened.
 */
export function windowStatus(dates: WindowDates, now: Date): WindowStatus {
	const opensAt = parseConfigDate(dates.opensAt);
	if (opensAt === null || now < opensAt) return 'upcoming';

	const closesAt = parseConfigDate(dates.closesAt);
	if (closesAt !== null && now >= closesAt) return 'closed';

	return 'open';
}

const melbourneFormat = new Intl.DateTimeFormat('en-AU', {
	timeZone: 'Australia/Melbourne',
	weekday: 'short',
	day: 'numeric',
	month: 'short',
	hour: 'numeric',
	minute: '2-digit'
});

/** Formats a config date in Melbourne time, e.g. "Sat, 20 Feb, 9:00 am". Unconfirmed dates stay "TBD". */
export function formatMelbourne(value: string): string {
	const date = parseConfigDate(value);
	return date === null ? 'TBD' : melbourneFormat.format(date);
}
