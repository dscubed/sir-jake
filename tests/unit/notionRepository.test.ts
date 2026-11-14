import type { Client } from '@notionhq/client';
import { describe, expect, it, vi } from 'vitest';
import { recruitment } from '../../src/lib/config/recruitment';
import type { Application } from '../../src/lib/domain/application';
import { children, properties } from '../../src/lib/server/notion/pageBuilder';
import {
	CONFIRM_CREATE_DELAYS_MS,
	NotionApplicantRepository
} from '../../src/lib/server/notion/repository';
import { UpstreamError } from '../../src/lib/server/ports';
import {
	badGateway,
	networkError,
	rateLimited,
	serverError,
	timeout,
	validationError
} from '../fixtures/notionErrors';
import { makeResume } from '../fixtures/pdf';

const sleep = vi.fn().mockResolvedValue(undefined);

function repoWith(
	fileUploads: Partial<Client['fileUploads']>,
	pages: Partial<Client['pages']> = {},
	dataSources: Partial<Client['dataSources']> = {}
) {
	const client = { fileUploads, pages, dataSources } as unknown as Client;
	return new NotionApplicantRepository({
		client,
		dataSourceId: 'ds',
		config: recruitment,
		retry: { sleep }
	});
}

/** A query result holding one page in the shape Notion returns, or none. */
const found = (id?: string, submissionId = 'sub-1') => ({
	results: id
		? [
				{
					object: 'page',
					id,
					url: `https://notion.so/${id}`,
					properties: {
						'Submission ID': { type: 'rich_text', rich_text: [{ plain_text: submissionId }] },
						'Submitted at': { type: 'date', date: { start: '2027-02-20T12:30:00+11:00' } }
					}
				}
			]
		: []
});

describe('NotionApplicantRepository.uploadResume', () => {
	it('creates a single-part PDF upload, sends the bytes and returns the id', async () => {
		const create = vi.fn().mockResolvedValue({ id: 'up-1', status: 'pending' });
		const send = vi.fn().mockResolvedValue({ id: 'up-1', status: 'uploaded' });
		const resume = makeResume(0, 'ada.pdf');

		expect(await repoWith({ create, send }).uploadResume(resume)).toBe('up-1');
		expect(create).toHaveBeenCalledWith({
			mode: 'single_part',
			filename: 'ada.pdf',
			content_type: 'application/pdf'
		});
		const { file } = send.mock.calls[0][0];
		expect(send.mock.calls[0][0].file_upload_id).toBe('up-1');
		expect(file.filename).toBe('ada.pdf');
		expect(file.data.type).toBe('application/pdf');
		expect(new Uint8Array(await file.data.arrayBuffer())).toEqual(resume.bytes);
	});

	it('throws UpstreamError when the upload does not finish as uploaded', async () => {
		const create = vi.fn().mockResolvedValue({ id: 'up-1', status: 'pending' });
		const send = vi.fn().mockResolvedValue({ id: 'up-1', status: 'failed' });

		const error = await repoWith({ create, send })
			.uploadResume(makeResume())
			.catch((e: unknown) => e);
		expect(error).toBeInstanceOf(UpstreamError);
		expect((error as UpstreamError).operation).toBe('uploadResume');
	});

	it('wraps a failed create in UpstreamError and never sends', async () => {
		const create = vi.fn().mockRejectedValue(new Error('network down'));
		const send = vi.fn();

		await expect(repoWith({ create, send }).uploadResume(makeResume())).rejects.toBeInstanceOf(
			UpstreamError
		);
		expect(send).not.toHaveBeenCalled();
	});
});

describe('NotionApplicantRepository.create', () => {
	const app: Application = {
		submissionId: 'sub-1',
		fullName: 'Ada Lovelace',
		email: 'ada@student.unimelb.edu.au',
		degree: 'BSc',
		graduation: recruitment.graduationOptions[0],
		availableGroup: true,
		availableIndividual: true,
		firstPreference: recruitment.roles[0].id,
		secondPreference: recruitment.roles[1].id,
		responses: { general: 'a', firstPreference: 'b', secondPreference: 'c' },
		resume: makeResume(),
		submittedAt: new Date('2027-02-20T01:30:00Z')
	};

	it('creates the page in the data source with the built properties and body', async () => {
		const create = vi.fn().mockResolvedValue({ id: 'page-1' });

		expect(await repoWith({}, { create }).create(app, 'up-1')).toBe('page-1');
		expect(create).toHaveBeenCalledWith({
			parent: { type: 'data_source_id', data_source_id: 'ds' },
			properties: properties(app, 'up-1', recruitment),
			children: children(app, recruitment)
		});
	});

	it('wraps a Notion error in UpstreamError', async () => {
		const create = vi.fn().mockRejectedValue(new Error('502'));

		const error = await repoWith({}, { create })
			.create(app, 'up-1')
			.catch((e: unknown) => e);
		expect(error).toBeInstanceOf(UpstreamError);
		expect((error as UpstreamError).operation).toBe('create');
	});
});

describe('retry policy', () => {
	const app: Application = {
		submissionId: 'sub-1',
		fullName: 'Ada Lovelace',
		email: 'ada@student.unimelb.edu.au',
		degree: 'BSc',
		graduation: recruitment.graduationOptions[0],
		availableGroup: true,
		availableIndividual: true,
		firstPreference: recruitment.roles[0].id,
		secondPreference: recruitment.roles[1].id,
		responses: { general: 'a', firstPreference: 'b', secondPreference: 'c' },
		resume: makeResume(),
		submittedAt: new Date('2027-02-20T01:30:00Z')
	};

	describe('findByEmail', () => {
		it('returns the page id, submission id and submission time', async () => {
			const query = vi.fn().mockResolvedValue(found('p1', 'sub-9'));
			expect(await repoWith({}, {}, { query }).findByEmail(app.email)).toEqual({
				pageId: 'p1',
				submissionId: 'sub-9',
				submittedAt: new Date('2027-02-20T12:30:00+11:00')
			});
		});

		it('returns undefined when there is no page', async () => {
			const query = vi.fn().mockResolvedValue(found());
			expect(await repoWith({}, {}, { query }).findByEmail(app.email)).toBeUndefined();
		});

		it('retries a 502 and then succeeds', async () => {
			const query = vi.fn().mockRejectedValueOnce(badGateway()).mockResolvedValue(found('p1'));
			expect((await repoWith({}, {}, { query }).findByEmail(app.email))?.pageId).toBe('p1');
			expect(query).toHaveBeenCalledTimes(2);
		});

		it('gives up with UpstreamError after 2 retries', async () => {
			const query = vi.fn().mockRejectedValue(timeout());
			await expect(repoWith({}, {}, { query }).findByEmail(app.email)).rejects.toMatchObject({
				name: 'UpstreamError',
				operation: 'findByEmail'
			});
			expect(query).toHaveBeenCalledTimes(3);
		});
	});

	describe('uploadResume', () => {
		it('starts a fresh upload after a network error', async () => {
			const create = vi
				.fn()
				.mockRejectedValueOnce(networkError())
				.mockResolvedValue({ id: 'up-2', status: 'pending' });
			const send = vi.fn().mockResolvedValue({ id: 'up-2', status: 'uploaded' });
			expect(await repoWith({ create, send }).uploadResume(makeResume())).toBe('up-2');
			expect(create).toHaveBeenCalledTimes(2);
		});

		it('retries a 429 on send, honouring Retry-After', async () => {
			sleep.mockClear();
			const create = vi.fn().mockResolvedValue({ id: 'up-1', status: 'pending' });
			const send = vi
				.fn()
				.mockRejectedValueOnce(rateLimited(1))
				.mockResolvedValue({ id: 'up-1', status: 'uploaded' });
			expect(await repoWith({ create, send }).uploadResume(makeResume())).toBe('up-1');
			expect(sleep).toHaveBeenCalledWith(1000);
		});
	});

	describe('create', () => {
		it('retries after a 429 and succeeds', async () => {
			const create = vi.fn().mockRejectedValueOnce(rateLimited(1)).mockResolvedValue({ id: 'p1' });
			const query = vi.fn();
			expect(await repoWith({}, { create }, { query }).create(app, 'up-1')).toBe('p1');
			expect(create).toHaveBeenCalledTimes(2);
			expect(query).not.toHaveBeenCalled();
		});

		it('after a 5xx, returns the page if it was created anyway', async () => {
			const create = vi.fn().mockRejectedValue(serverError());
			const query = vi.fn().mockResolvedValue(found('p-existing'));
			expect(await repoWith({}, { create }, { query }).create(app, 'up-1')).toBe('p-existing');
			expect(create).toHaveBeenCalledTimes(1);
			expect(query.mock.calls[0][0].filter).toEqual({
				property: 'Email',
				email: { equals: app.email }
			});
		});

		it('after a 5xx, throws UpstreamError if the page does not exist', async () => {
			const create = vi.fn().mockRejectedValue(serverError());
			const query = vi.fn().mockResolvedValue(found());
			await expect(repoWith({}, { create }, { query }).create(app, 'up-1')).rejects.toMatchObject({
				name: 'UpstreamError',
				operation: 'create'
			});
			expect(create).toHaveBeenCalledTimes(1);
		});

		it('after a timeout, checks for the page instead of retrying', async () => {
			const create = vi.fn().mockRejectedValue(timeout());
			const query = vi.fn().mockResolvedValue(found('p-existing'));
			expect(await repoWith({}, { create }, { query }).create(app, 'up-1')).toBe('p-existing');
			expect(create).toHaveBeenCalledTimes(1);
		});

		it('keeps checking until the new page shows up in the query', async () => {
			sleep.mockClear();
			const create = vi.fn().mockRejectedValue(serverError());
			const query = vi
				.fn()
				.mockResolvedValueOnce(found())
				.mockResolvedValueOnce(found())
				.mockResolvedValue(found('p-late'));
			expect(await repoWith({}, { create }, { query }).create(app, 'up-1')).toBe('p-late');
			expect(query).toHaveBeenCalledTimes(3);
			expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([...CONFIRM_CREATE_DELAYS_MS]);
		});

		it('stops checking at the first match', async () => {
			const create = vi.fn().mockRejectedValue(timeout());
			const query = vi.fn().mockResolvedValueOnce(found()).mockResolvedValue(found('p-1'));
			expect(await repoWith({}, { create }, { query }).create(app, 'up-1')).toBe('p-1');
			expect(query).toHaveBeenCalledTimes(2);
		});

		it('skips a failed check and carries on with the next', async () => {
			const create = vi.fn().mockRejectedValue(serverError());
			const query = vi.fn().mockRejectedValueOnce(badGateway()).mockResolvedValue(found('p-1'));
			expect(await repoWith({}, { create }, { query }).create(app, 'up-1')).toBe('p-1');
			expect(query).toHaveBeenCalledTimes(2);
		});

		it('ignores a page made by a different submission', async () => {
			const create = vi.fn().mockRejectedValue(serverError());
			const query = vi.fn().mockResolvedValue(found('p-other', 'someone-else'));
			await expect(repoWith({}, { create }, { query }).create(app, 'up-1')).rejects.toMatchObject({
				name: 'UpstreamError',
				operation: 'create'
			});
		});

		it('gives up after every check comes back empty', async () => {
			const create = vi.fn().mockRejectedValue(serverError());
			const query = vi.fn().mockResolvedValue(found());
			await expect(repoWith({}, { create }, { query }).create(app, 'up-1')).rejects.toMatchObject({
				name: 'UpstreamError',
				operation: 'create'
			});
			expect(query).toHaveBeenCalledTimes(CONFIRM_CREATE_DELAYS_MS.length);
		});

		it('throws UpstreamError if the follow-up check also fails', async () => {
			const create = vi.fn().mockRejectedValue(serverError());
			const query = vi.fn().mockRejectedValue(serverError());
			await expect(repoWith({}, { create }, { query }).create(app, 'up-1')).rejects.toMatchObject({
				name: 'UpstreamError',
				operation: 'create'
			});
		});

		it('does not retry or check after a permanent error', async () => {
			const create = vi.fn().mockRejectedValue(validationError());
			const query = vi.fn();
			await expect(repoWith({}, { create }, { query }).create(app, 'up-1')).rejects.toMatchObject({
				name: 'UpstreamError',
				operation: 'create'
			});
			expect(create).toHaveBeenCalledTimes(1);
			expect(query).not.toHaveBeenCalled();
		});

		it('does not check for the page after 429s run out, since Notion processed none of them', async () => {
			const create = vi.fn().mockRejectedValue(rateLimited(1));
			const query = vi.fn();
			await expect(repoWith({}, { create }, { query }).create(app, 'up-1')).rejects.toMatchObject({
				name: 'UpstreamError'
			});
			expect(create).toHaveBeenCalledTimes(3);
			expect(query).not.toHaveBeenCalled();
		});
	});
});
