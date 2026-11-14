import { recruitment } from '#lib/config/recruitment.ts';
import { displayStatus } from '#lib/domain/window.ts';
import type { LayoutLoad } from './$types';

/**
 * Window status for the nav and landing buttons at render time. For the prerendered landing page
 * that is build time; the page refreshes it in the browser.
 */
export const load: LayoutLoad = () => ({
	windowStatus: displayStatus(recruitment, new Date())
});
