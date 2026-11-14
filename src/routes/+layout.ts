import { recruitment } from '#lib/config/recruitment.ts';
import { applicationWindow, displayStatus, windowState } from '#lib/domain/window.ts';
import type { LayoutLoad } from './$types';

const applyWindow = applicationWindow(recruitment);

/**
 * Window status for the nav and landing buttons at render time. For the prerendered landing page
 * that is build time; the page refreshes it in the browser.
 */
export const load: LayoutLoad = () => ({
	windowStatus: displayStatus(windowState(new Date(), applyWindow))
});
