import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { recruitment } from '../../src/lib/config/recruitment';
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

afterAll(async () => {
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
