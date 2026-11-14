import { describe, expect, it } from 'vitest';
import { recruitment } from '../../src/lib/config/recruitment';
import { createContainer, type ServerEnv } from '../../src/lib/server/container';

const base: ServerEnv = { TURNSTILE_SECRET_KEY: 'secret' };
const notion = {
	NOTION_TOKEN: 'token',
	NOTION_DATA_SOURCE_ID: 'prod-ds',
	NOTION_TEST_DATA_SOURCE_ID: 'test-ds'
};

describe('createContainer', () => {
	it('uses the fake repository by default outside production', () => {
		expect(createContainer(base, recruitment).repoKind).toBe('fake');
		expect(createContainer({ ...base, VERCEL_ENV: 'preview' }, recruitment).repoKind).toBe('fake');
	});

	it('uses Notion by default in production', () => {
		const c = createContainer({ ...base, ...notion, VERCEL_ENV: 'production' }, recruitment);
		expect(c).toMatchObject({ repoKind: 'notion', database: 'production' });
	});

	it('uses the TEST database for Notion everywhere except production', () => {
		for (const VERCEL_ENV of [undefined, 'development', 'preview']) {
			const c = createContainer(
				{ ...base, ...notion, APPLICANT_REPO: 'notion', VERCEL_ENV },
				recruitment
			);
			expect(c.database).toBe('test');
		}
	});

	it('refuses the fake repository in production', () => {
		expect(() =>
			createContainer({ ...base, APPLICANT_REPO: 'fake', VERCEL_ENV: 'production' }, recruitment)
		).toThrow('not allowed in production');
	});

	it('names the missing variable when Notion is not configured', () => {
		expect(() =>
			createContainer({ ...base, APPLICANT_REPO: 'notion', NOTION_TOKEN: 'token' }, recruitment)
		).toThrow('NOTION_TEST_DATA_SOURCE_ID is required');
		expect(() =>
			createContainer(
				{
					...base,
					NOTION_TOKEN: 'token',
					NOTION_TEST_DATA_SOURCE_ID: 'x',
					VERCEL_ENV: 'production'
				},
				recruitment
			)
		).toThrow('NOTION_DATA_SOURCE_ID is required');
		expect(() =>
			createContainer(
				{ ...base, APPLICANT_REPO: 'notion', NOTION_TEST_DATA_SOURCE_ID: 'x' },
				recruitment
			)
		).toThrow('NOTION_TOKEN is required');
	});

	it('honours FAKE_NOW outside production only', () => {
		const fakeNow = new Date('2027-03-01T12:00:00+11:00');
		expect(createContainer({ ...base, FAKE_NOW: fakeNow }, recruitment).clock.now()).toEqual(
			fakeNow
		);

		const prod = createContainer(
			{ ...base, ...notion, FAKE_NOW: fakeNow, VERCEL_ENV: 'production' },
			recruitment
		);
		expect(prod.clock.now()).not.toEqual(fakeNow);
	});

	it('needs a Turnstile secret key', () => {
		expect(() => createContainer({ TURNSTILE_SECRET_KEY: '' }, recruitment)).toThrow('secret key');
	});
});
