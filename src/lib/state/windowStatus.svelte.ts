import { dev } from '$app/env';
import { recruitment } from '#lib/config/recruitment.ts';
import { displayStatus, type WindowStatus } from '#lib/domain/window.ts';

const statuses: readonly WindowStatus[] = ['upcoming', 'open', 'closed'];

function statusNow(): WindowStatus {
	// In development, `?window=closed` (or upcoming/open) previews each state of the landing page.
	if (dev) {
		const override = new URLSearchParams(location.search).get('window');
		if (statuses.includes(override as WindowStatus)) return override as WindowStatus;
	}
	return displayStatus(recruitment, new Date());
}

/**
 * The application window status, kept current in the browser.
 *
 * The landing page is prerendered, so the status baked into its HTML is the one at build time.
 * `initial` (from the layout's load) keeps hydration consistent; after mounting, the status is
 * recomputed from the browser clock and refreshed every minute, so the page flips at `opensAt`.
 */
export function liveWindowStatus(initial: () => WindowStatus): { readonly current: WindowStatus } {
	let live = $state<WindowStatus | null>(null);

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
