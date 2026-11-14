import type { BlockObjectResponse, PageObjectResponse } from '@notionhq/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { recruitment } from '../../src/lib/config/recruitment';
import type { Application } from '../../src/lib/domain/application';
import { makeResume } from '../fixtures/pdf';
import { PROP } from '../../src/lib/server/notion/properties';
import {
	createNotionClient,
	NotionApplicantRepository
} from '../../src/lib/server/notion/repository';

const token = process.env.NOTION_TOKEN;
const dataSourceId = process.env.NOTION_TEST_DATA_SOURCE_ID;
if (!token || !dataSourceId) {
	throw new Error(
		'Set NOTION_TOKEN and NOTION_TEST_DATA_SOURCE_ID in .env to run pnpm test:notion'
	);
}

const client = createNotionClient(token);
const repo = new NotionApplicantRepository({ client, dataSourceId, config: recruitment });

/** A unique address per run, so runs never see each other's pages. */
const runEmail = (label: string) =>
	`it-${label}-${crypto.randomUUID().slice(0, 8)}@integration-test.invalid`;

const createdPages: string[] = [];

// Set KEEP_NOTION_PAGES=1 to leave the pages in TEST so you can open them in Notion.
afterAll(async () => {
	if (process.env.KEEP_NOTION_PAGES) {
		console.info(`Kept ${createdPages.length} page(s) in TEST: ${createdPages.join(', ')}`);
		return;
	}
	await Promise.allSettled(
		createdPages.map((page_id) => client.pages.update({ page_id, in_trash: true }))
	);
});

describe('existsByEmail', () => {
	const seeded = runEmail('seeded');

	beforeAll(async () => {
		const page = await client.pages.create({
			parent: { type: 'data_source_id', data_source_id: dataSourceId },
			properties: {
				[PROP.name]: { title: [{ text: { content: 'Integration test (existsByEmail)' } }] },
				[PROP.email]: { email: seeded }
			}
		});
		createdPages.push(page.id);
	});

	it('returns true for an email that has a page', async () => {
		expect(await repo.existsByEmail(seeded)).toBe(true);
	});

	it('returns false for an email with no page', async () => {
		expect(await repo.existsByEmail(runEmail('new'))).toBe(false);
	});

	it('wraps Notion errors in UpstreamError', async () => {
		const broken = new NotionApplicantRepository({
			client: createNotionClient('invalid-token'),
			dataSourceId,
			config: recruitment
		});
		await expect(broken.existsByEmail(seeded)).rejects.toMatchObject({
			name: 'UpstreamError',
			operation: 'existsByEmail'
		});
	});
});

describe('uploadResume', () => {
	it('uploads a 3.9 MB PDF and returns an upload that is ready to attach', async () => {
		const resume = makeResume(3.9 * 1024 * 1024, 'integration-test-resume.pdf');
		expect(resume.sizeBytes).toBeGreaterThan(3.89 * 1024 * 1024);

		const id = await repo.uploadResume(resume);

		const upload = await client.fileUploads.retrieve({ file_upload_id: id });
		expect(upload.status).toBe('uploaded');
		expect(upload.filename).toBe('integration-test-resume.pdf');
		expect(upload.content_type).toBe('application/pdf');
		expect(upload.content_length).toBe(resume.sizeBytes);
	});
});

describe('create', () => {
	const [first, second] = recruitment.roles;
	const email = runEmail('create');
	const longAnswer = 'word '.repeat(450).trim();
	let pageId: string;

	const app: Application = {
		submissionId: crypto.randomUUID(),
		fullName: 'Integration Test Applicant',
		email,
		degree: 'Bachelor of Science (Data Science)',
		graduation: recruitment.graduationOptions[3],
		availableGroup: true,
		availableIndividual: false,
		firstPreference: first.id,
		secondPreference: second.id,
		responses: {
			general: 'General answer **not bold** [not a link](https://example.com).',
			firstPreference: longAnswer,
			secondPreference: 'Second preference answer.'
		},
		resume: makeResume(50 * 1024, 'integration-test-resume.pdf'),
		submittedAt: new Date('2027-02-20T01:30:00Z')
	};

	beforeAll(async () => {
		expect(await repo.existsByEmail(email)).toBe(false);
		const uploadId = await repo.uploadResume(app.resume);
		pageId = await repo.create(app, uploadId);
		createdPages.push(pageId);
	});

	it('makes the email count as a duplicate', async () => {
		expect(await repo.existsByEmail(email)).toBe(true);
	});

	it('sets every property', async () => {
		const page = (await client.pages.retrieve({ page_id: pageId })) as PageObjectResponse;
		const p = page.properties;
		const text = (prop: (typeof p)[string]) =>
			prop.type === 'title'
				? prop.title.map((t) => t.plain_text).join('')
				: prop.type === 'rich_text'
					? prop.rich_text.map((t) => t.plain_text).join('')
					: undefined;
		const option = (prop: (typeof p)[string]) =>
			prop.type === 'select'
				? prop.select?.name
				: prop.type === 'status'
					? prop.status?.name
					: undefined;

		expect(text(p[PROP.name])).toBe(app.fullName);
		expect(p[PROP.email]).toMatchObject({ email });
		expect(text(p[PROP.degree])).toBe(app.degree);
		expect(option(p[PROP.graduation])).toBe(app.graduation);
		expect(p[PROP.availableGroup]).toMatchObject({ checkbox: true });
		expect(p[PROP.availableIndividual]).toMatchObject({ checkbox: false });
		expect(option(p[PROP.firstPreference])).toBe(first.name);
		expect(option(p[PROP.secondPreference])).toBe(second.name);
		expect(option(p[PROP.stage])).toBe('Applied');
		expect(text(p[PROP.submissionId])).toBe(app.submissionId);

		const submitted = p[PROP.submittedAt];
		expect(submitted.type === 'date' && new Date(submitted.date!.start).toISOString()).toBe(
			app.submittedAt.toISOString()
		);

		const resume = p[PROP.resume];
		expect(resume.type === 'files' && resume.files.map((f) => f.name)).toEqual([
			'integration-test-resume.pdf'
		]);
	});

	it('lays out the body with the responses and empty interview notes', async () => {
		const { results } = await client.blocks.children.list({ block_id: pageId, page_size: 100 });
		const blocks = (results as BlockObjectResponse[]).map((b) => {
			const rich =
				b.type === 'heading_2'
					? b.heading_2.rich_text
					: b.type === 'heading_3'
						? b.heading_3.rich_text
						: b.type === 'paragraph'
							? b.paragraph.rich_text
							: [];
			return [b.type, rich.map((t) => t.plain_text).join('')];
		});

		expect(blocks).toEqual([
			['heading_2', 'Application responses'],
			['heading_3', `General: ${recruitment.generalQuestion.label}`],
			['paragraph', app.responses.general],
			['heading_3', `First preference (${first.name}): ${first.question.label}`],
			['paragraph', longAnswer],
			['heading_3', `Second preference (${second.name}): ${second.question.label}`],
			['paragraph', app.responses.secondPreference],
			['divider', ''],
			['heading_2', 'Group interview notes'],
			['paragraph', ''],
			['heading_2', 'Individual interview notes'],
			['paragraph', '']
		]);
	});

	it('keeps applicant text unformatted', async () => {
		const { results } = await client.blocks.children.list({ block_id: pageId, page_size: 100 });
		const general = (results as BlockObjectResponse[])[2];
		expect(general.type).toBe('paragraph');
		if (general.type !== 'paragraph') return;
		for (const t of general.paragraph.rich_text) {
			expect(t.href).toBeNull();
			expect(t.annotations).toMatchObject({ bold: false, italic: false, code: false });
		}
	});
});
