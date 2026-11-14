import { recruitment } from '#lib/config/recruitment.ts';
import { windowStatus } from '#lib/domain/window.ts';
import type { LayoutLoad } from './$types';

/** Window status at render time. For the prerendered landing page that is build time; the page refreshes it in the browser. */
export const load: LayoutLoad = () => ({
	windowStatus: windowStatus(recruitment, new Date())
});
