import type { Client } from '@notionhq/client';
import { describe, expect, it, vi } from 'vitest';
import { recruitment } from '../../src/lib/config/recruitment';
import type { Application } from '../../src/lib/domain/application';
import { children, properties } from '../../src/lib/server/notion/pageBuilder';
import { NotionApplicantRepository } from '../../src/lib/server/notion/repository';
import { UpstreamError } from '../../src/lib/server/ports';
import { makeResume } from '../fixtures/pdf';

function repoWith(
	fileUploads: Partial<Client['fileUploads']>,
	pages: Partial<Client['pages']> = {}
) {
	const client = { fileUploads, pages } as unknown as Client;
	return new NotionApplicantRepository({ client, dataSourceId: 'ds', config: recruitment });
}

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
