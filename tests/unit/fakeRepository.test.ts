import { describe, expect, it } from 'vitest';
import type { Application } from '../../src/lib/domain/application';
import { FakeApplicantRepository } from '../../src/lib/server/fakeRepository';
import { UpstreamError } from '../../src/lib/server/ports';

const resume = { filename: 'resume.pdf', sizeBytes: 2048, bytes: new Uint8Array(2048) };

const app = (email = 'ada@student.unimelb.edu.au'): Application => ({
	submissionId: '00000000-0000-4000-8000-000000000000',
	fullName: 'Ada Lovelace',
	email,
	degree: 'Bachelor of Science',
	graduation: '2028 Sem 2',
	availableGroup: true,
	availableIndividual: false,
	firstPreference: 'events',
	secondPreference: 'graphics',
	responses: { general: 'one two three', firstPreference: 'four', secondPreference: 'five six' },
	resume,
	submittedAt: new Date('2027-02-20T09:00:00+11:00')
});

const silent = () => {};

async function submit(repo: FakeApplicantRepository, a = app()) {
	if (await repo.findByEmail(a.email)) return 'duplicate';
	const uploadId = await repo.uploadResume(a.resume);
	return repo.create(a, uploadId);
}

describe('FakeApplicantRepository', () => {
	it('stores a created application by email', async () => {
		const repo = new FakeApplicantRepository({ log: silent });
		const pageId = await submit(repo);

		expect(pageId).toMatch(/^fake-page-/);
		expect(repo.applications.get('ada@student.unimelb.edu.au')?.pageId).toBe(pageId);
		expect(repo.uploads.size).toBe(1);
		expect(repo.calls).toEqual(['findByEmail', 'uploadResume', 'create']);
	});

	it('finds an application by email once it has been created', async () => {
		const repo = new FakeApplicantRepository({ log: silent });
		expect(await repo.findByEmail('ada@student.unimelb.edu.au')).toBeUndefined();
		const pageId = await submit(repo);
		expect(await repo.findByEmail('ada@student.unimelb.edu.au')).toEqual({
			pageId,
			submissionId: app().submissionId,
			submittedAt: app().submittedAt
		});
		expect(await repo.findByEmail('grace@student.unimelb.edu.au')).toBeUndefined();
	});

	it('gives each page and upload a different id', async () => {
		const repo = new FakeApplicantRepository({ log: silent });
		const first = await submit(repo, app('a@x.edu'));
		const second = await submit(repo, app('b@x.edu'));
		expect(first).not.toBe(second);
		expect(new Set(repo.uploads.keys()).size).toBe(2);
	});

	it("with duplicate, finds another applicant's page for every email", async () => {
		const repo = new FakeApplicantRepository({ duplicate: true, log: silent });
		expect(await submit(repo)).toBe('duplicate');
		expect(repo.calls).toEqual(['findByEmail']);
		expect(repo.uploads.size).toBe(0);
	});

	it.each([
		['upstreamOnCheck', 'findByEmail', ['findByEmail']],
		['upstreamOnUpload', 'uploadResume', ['findByEmail', 'uploadResume']],
		['upstreamOnCreate', 'create', ['findByEmail', 'uploadResume', 'create']]
	] as const)('with %s, throws UpstreamError from %s', async (option, operation, calls) => {
		const repo = new FakeApplicantRepository({ [option]: true, log: silent });
		const error = await submit(repo).catch((e: unknown) => e);

		expect(error).toBeInstanceOf(UpstreamError);
		expect((error as UpstreamError).operation).toBe(operation);
		expect(repo.calls).toEqual(calls);
		expect(repo.applications.size).toBe(0);
	});

	it('rejects a create with an unknown upload id', async () => {
		const repo = new FakeApplicantRepository({ log: silent });
		await expect(repo.create(app(), 'not-an-upload')).rejects.toThrow('Unknown resume upload');
	});

	it('rejects a second create for the same email', async () => {
		const repo = new FakeApplicantRepository({ log: silent });
		await submit(repo);
		const uploadId = await repo.uploadResume(resume);
		await expect(repo.create(app(), uploadId)).rejects.toThrow('already exists');
	});

	it('logs a readable summary of each created application', async () => {
		const lines: string[] = [];
		const repo = new FakeApplicantRepository({ log: (m) => lines.push(m) });
		const pageId = await submit(repo);

		expect(lines).toHaveLength(1);
		const summary = lines[0];
		expect(summary).toContain(`created ${pageId}`);
		expect(summary).toContain('Ada Lovelace <ada@student.unimelb.edu.au>');
		expect(summary).toContain('1. events  2. graphics');
		expect(summary).toContain('group yes, individual no');
		expect(summary).toContain('general 3 words, first 1 words, second 2 words');
		expect(summary).toContain('resume.pdf (2 KB)');
	});
});
