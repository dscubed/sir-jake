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
