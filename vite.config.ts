import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Deployed to Vercel Hobby (design D2). See https://svelte.dev/docs/kit/adapter-vercel
			adapter: adapter()
		})
	],
	test: {
		expect: { requireAssertions: true },
		passWithNoTests: true,
		projects: [
			{
				// `pnpm test`: fast unit tests with fakes, run in CI.
				extends: './vite.config.ts',
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'tests/unit/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				// `pnpm test:notion`: runs against the TEST Notion database using the local .env.
				// Not run in CI.
				extends: './vite.config.ts',
				test: {
					name: 'notion',
					environment: 'node',
					include: ['tests/integration/**/*.{test,spec}.{js,ts}'],
					env: loadEnv('test', process.cwd(), ''),
					testTimeout: 30_000,
					hookTimeout: 30_000
				}
			}
		]
	}
});
