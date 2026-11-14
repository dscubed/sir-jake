import { dev } from '$app/env';
import { recruitment } from '#lib/config/recruitment.ts';
import {
	applicationWindow,
	displayStatus,
	windowState,
	type DisplayStatus
} from '#lib/domain/window.ts';

const applyWindow = applicationWindow(recruitment);

const statuses: readonly DisplayStatus[] = ['upcoming', 'open', 'closed'];

function statusNow(): DisplayStatus {
	// In development, `?window=closed` (or upcoming/open) previews each state of the landing page.
	if (dev) {
		const override = new URLSearchParams(location.search).get('window');
		if (statuses.includes(override as DisplayStatus)) return override as DisplayStatus;
	}
	return displayStatus(windowState(new Date(), applyWindow));
}

/**
 * The application window status, kept current in the browser.
 *
 * The landing page is prerendered, so the status baked into its HTML is the one at build time.
 * `initial` (from the layout's load) keeps hydration consistent; after mounting, the status is
 * recomputed from the browser clock and refreshed every minute, so the page flips at `opensAt`.
 */
export function liveWindowStatus(initial: () => DisplayStatus): {
	readonly current: DisplayStatus;
} {
	let live = $state<DisplayStatus | null>(null);

	$effect(() => {
		live = statusNow();
		const timer = setInterval(() => (live = statusNow()), 60_000);
		return () => clearInterval(timer);
	});

	return {
		get current() {
			return live ?? initial();
		}
	};
}
