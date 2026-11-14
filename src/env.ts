import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Environment variables (design §10, step 0.4). Server-only values such as NOTION_TOKEN and
 * TURNSTILE_SECRET_KEY are added here by the steps that use them.
 */
export const variables = defineEnvVars({
	PUBLIC_TURNSTILE_SITE_KEY: {
		public: true,
		description:
			'Cloudflare Turnstile site key, sent to the browser. Optional in development, where Cloudflare’s always-pass test key is used.',
		schema: (value) => value || undefined
	}
});
