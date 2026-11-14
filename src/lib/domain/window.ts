import type { RecruitmentConfig } from '#lib/config/types.ts';

export interface ApplicationWindow {
	opensAt: Date;
	closesAt: Date;
}

/**
 * - `unscheduled`: the dates aren't set yet (still "TBD" or not valid dates).
 * - `before`, `open`, `after`: where `now` falls relative to the window. The window includes
 *   `opensAt` and excludes `closesAt`.
 */
export type WindowState = 'unscheduled' | 'before' | 'open' | 'after';

/** The application window from the config, or `undefined` while either date is unset or invalid. */
export function applicationWindow(
	config: Pick<RecruitmentConfig, 'opensAt' | 'closesAt'>
): ApplicationWindow | undefined {
	const opensAt = new Date(config.opensAt);
	const closesAt = new Date(config.closesAt);
	if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime())) return undefined;
	if (closesAt <= opensAt) return undefined;
	return { opensAt, closesAt };
}

export function windowState(now: Date, window: ApplicationWindow | undefined): WindowState {
	if (!window) return 'unscheduled';
	if (now < window.opensAt) return 'before';
	if (now >= window.closesAt) return 'after';
	return 'open';
}

/** What the landing page and nav show: the buttons go to the form, or to Discord. */
export type DisplayStatus = 'upcoming' | 'open' | 'closed';

/**
 * The status the pages display. While the dates are unscheduled ("TBD") the site links to the
 * form, so the pages work together during development and testing.
 *
 * Display only: whether a submission is accepted is always decided by `windowState` on the server.
 */
export function displayStatus(state: WindowState): DisplayStatus {
	if (state === 'before') return 'upcoming';
	if (state === 'after') return 'closed';
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

/** Formats a config date in Melbourne time, e.g. "Sat, 20 Feb, 9:00 am". Unset dates stay "TBD". */
export function formatMelbourne(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'TBD' : melbourneFormat.format(date);
}
