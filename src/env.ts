import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => (value ? value : undefined);

export const variables = defineEnvVars({
	APPLICANT_REPO: {
		description:
			'"fake" stores applications in memory; "notion" writes them to Notion. Defaults to "notion" in production and "fake" everywhere else.',
		schema: (value) => {
			if (!value) return undefined;
			if (value !== 'fake' && value !== 'notion') {
				throw new Error('APPLICANT_REPO must be "fake" or "notion"');
			}
			return value;
		}
	},
	NOTION_TOKEN: {
		description: 'Notion internal integration token. Needed when APPLICANT_REPO is "notion".',
		schema: optional
	},
	NOTION_DATA_SOURCE_ID: {
		description:
			'Data source ID of the real 2027 S1 Applications database. Used only in production.',
		schema: optional
	},
	NOTION_TEST_DATA_SOURCE_ID: {
		description:
			'Data source ID of the TEST Applications database. Used everywhere except production.',
		schema: optional
	},
	TURNSTILE_SECRET_KEY: {
		description: "Cloudflare Turnstile secret key. Use Cloudflare's test keys locally.",
		schema: (value) => {
			if (!value) throw new Error('TURNSTILE_SECRET_KEY is required');
			return value;
		}
	},
	PUBLIC_TURNSTILE_SITE_KEY: {
		public: true,
		description: 'Cloudflare Turnstile site key, sent to the browser for the widget.',
		schema: optional
	},
	FAKE_NOW: {
		description:
			'ISO time the server pretends it is, to test the open and closed states. Ignored in production.',
		schema: (value) => {
			if (!value) return undefined;
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) throw new Error('FAKE_NOW must be an ISO date and time');
			return date;
		}
	},
	VERCEL_ENV: {
		description: 'Set by Vercel: "production", "preview" or "development".',
		schema: optional
	}
});
