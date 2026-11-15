import { defineConfig } from '@playwright/test';
import { AFTER, DURING } from './tests/e2e/helpers';

/** Cloudflare's published test keys: these always pass, with no real check. */
const env = {
	APPLICANT_REPO: 'fake',
	TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
	PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA'
};

// `pnpm test:e2e` builds first, then two servers preview that build: one inside the application
// window and one after it closes (CLOSED_URL in the helpers).
export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.spec.ts',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
	webServer: [
		{
			command: 'pnpm preview --port 4173 --strictPort',
			port: 4173,
			env: { ...env, FAKE_NOW: DURING }
		},
		{
			command: 'pnpm preview --port 4174 --strictPort',
			port: 4174,
			env: { ...env, FAKE_NOW: AFTER }
		}
	]
});
