import { describe, expect, it, vi } from 'vitest';
import { recruitment } from '../../src/lib/config/recruitment';
import type { RecruitmentConfig } from '../../src/lib/config/types';
import {
	ApplicationService,
	hasPdfSignature,
	type SubmissionLog
} from '../../src/lib/server/applicationService';
import {
	FakeApplicantRepository,
	type FakeRepositoryOptions
} from '../../src/lib/server/fakeRepository';
import type { CaptchaVerifier } from '../../src/lib/server/ports';
import { makePdf } from '../fixtures/pdf';

const config: RecruitmentConfig = {
	...recruitment,
	opensAt: '2027-02-20T09:00:00+11:00',
	closesAt: '2027-03-06T23:59:00+11:00'
};
const DURING = new Date('2027-03-01T12:00:00+11:00');
const [roleA, roleB] = config.roles.map((r) => r.id);
const IP = '203.0.113.7';

function validForm(overrides: Record<string, string | File | null> = {}): FormData {
	const values: Record<string, string | File | null> = {
		fullName: '  Ada Lovelace ',
		email: ' Ada@Student.UniMelb.edu.au ',
		degree: 'Bachelor of Science',
		graduation: config.graduationOptions[2],
		availableGroup: 'yes',
		availableIndividual: 'no',
		firstPreference: roleA,
		secondPreference: roleB,
		answerGeneral: 'I love data.',
		answerFirst: 'First answer.',
		answerSecond: 'Second answer.',
		resume: new File([makePdf()], 'ada.pdf', { type: 'application/pdf' }),
		'cf-turnstile-response': 'token-ok',
		website: '',
		...overrides
	};
	const form = new FormData();
	for (const [key, value] of Object.entries(values)) if (value !== null) form.set(key, value);
	return form;
}

function setup({
	now = DURING,
	captchaPasses = true,
	repo: repoOptions = {},
	cfg = config
}: {
	now?: Date;
	captchaPasses?: boolean;
	repo?: FakeRepositoryOptions;
	cfg?: RecruitmentConfig;
} = {}) {
	const repo = new FakeApplicantRepository({ log: () => {}, ...repoOptions });
	const captcha = { verify: vi.fn<CaptchaVerifier['verify']>().mockResolvedValue(captchaPasses) };
	const logs: SubmissionLog[] = [];
	const service = new ApplicationService({
		repo,
		captcha,
		clock: { now: () => now },
		config: cfg,
		log: (entry) => logs.push(entry)
	});
	return { service, repo, captcha, logs };
}

describe('ApplicationService.submit', () => {
	it('creates the application and returns ok', async () => {
		const { service, repo, captcha, logs } = setup();

		const result = await service.submit(validForm(), IP);

		expect(result).toEqual({
			ok: true,
			pageId: expect.stringMatching(/^fake-page-/),
			submittedAt: DURING
		});
		expect(repo.calls).toEqual(['findByEmail', 'uploadResume', 'create']);
		expect(captcha.verify).toHaveBeenCalledWith('token-ok', IP);

		const stored = repo.applications.get('ada@student.unimelb.edu.au')?.app;
		expect(stored).toMatchObject({
			fullName: 'Ada Lovelace',
			email: 'ada@student.unimelb.edu.au',
			availableGroup: true,
			availableIndividual: false,
			firstPreference: roleA,
			secondPreference: roleB,
			responses: {
				general: 'I love data.',
				firstPreference: 'First answer.',
				secondPreference: 'Second answer.'
			},
			submittedAt: DURING
		});
		expect(stored?.submissionId).toBe(logs[0].submissionId);
		expect(hasPdfSignature(stored!.resume.bytes)).toBe(true);
		expect(stored?.resume.filename).toBe('ada.pdf');

		expect(logs).toEqual([
			{ submissionId: expect.any(String), outcome: 'ok', durationMs: expect.any(Number) }
		]);
	});

	it('gives each submission a different submission id', async () => {
		const { service, logs } = setup();
		await service.submit(validForm({ email: 'a@x.edu' }), IP);
		await service.submit(validForm({ email: 'b@x.edu' }), IP);
		expect(logs[0].submissionId).not.toBe(logs[1].submissionId);
	});

	describe('submission id from the form', () => {
		it('is used for the application and the log when valid', async () => {
			const { service, repo, logs } = setup();
			const id = crypto.randomUUID();
			await service.submit(validForm({ submissionId: id }), IP);
			expect(repo.applications.get('ada@student.unimelb.edu.au')?.app.submissionId).toBe(id);
			expect(logs[0].submissionId).toBe(id);
		});

		it('is replaced with a fresh one when it is not a valid id', async () => {
			const { service, logs } = setup();
			await service.submit(validForm({ submissionId: 'not-a-uuid' }), IP);
			expect(logs[0].submissionId).not.toBe('not-a-uuid');
			expect(logs[0].submissionId).toMatch(/^[0-9a-f-]{36}$/);
		});

		it("reports success when the applicant's earlier attempt already went through", async () => {
			const firstTry = new Date('2027-03-01T12:00:00+11:00');
			const { service, repo, logs } = setup({ now: firstTry });
			const id = crypto.randomUUID();
			const first = await service.submit(validForm({ submissionId: id }), IP);
			repo.calls.length = 0;

			const retry = await service.submit(validForm({ submissionId: id }), IP);

			expect(first.ok && retry.ok && retry.pageId).toBe(first.ok && first.pageId);
			expect(retry).toMatchObject({ ok: true, submittedAt: firstTry });
			expect(repo.calls).toEqual(['findByEmail']);
			expect(repo.applications.size).toBe(1);
			expect(logs[1]).toMatchObject({ outcome: 'ok', alreadyCreated: true });
		});

		it('still returns duplicate for the same email with a different id', async () => {
			const { service } = setup();
			await service.submit(validForm({ submissionId: crypto.randomUUID() }), IP);
			const other = await service.submit(validForm({ submissionId: crypto.randomUUID() }), IP);
			expect(other).toEqual({ ok: false, reason: 'duplicate' });
		});

		it('returns duplicate when the earlier attempt sent no id', async () => {
			const { service } = setup();
			await service.submit(validForm(), IP);
			const again = await service.submit(validForm({ submissionId: crypto.randomUUID() }), IP);
			expect(again).toEqual({ ok: false, reason: 'duplicate' });
		});
	});

	describe('closed', () => {
		it.each([
			['before opening', new Date('2027-02-20T08:59:59+11:00')],
			['at closing time', new Date('2027-03-06T23:59:00+11:00')],
			['after closing', new Date('2027-03-10T00:00:00+11:00')]
		])('%s, without checking anything else', async (_, now) => {
			const { service, repo, captcha } = setup({ now });
			expect(await service.submit(validForm(), IP)).toEqual({ ok: false, reason: 'closed' });
			expect(captcha.verify).not.toHaveBeenCalled();
			expect(repo.calls).toEqual([]);
		});

		it('while the dates are still TBD', async () => {
			const { service } = setup({ cfg: { ...config, opensAt: 'TBD', closesAt: 'TBD' } });
			expect(await service.submit(validForm(), IP)).toEqual({ ok: false, reason: 'closed' });
		});
	});

	describe('captcha', () => {
		it('fails when the honeypot is filled, without calling Cloudflare', async () => {
			const { service, captcha, repo } = setup();
			expect(await service.submit(validForm({ website: 'https://spam.example' }), IP)).toEqual({
				ok: false,
				reason: 'captcha'
			});
			expect(captcha.verify).not.toHaveBeenCalled();
			expect(repo.calls).toEqual([]);
		});

		it('fails when the token is missing', async () => {
			const { service, captcha } = setup();
			const result = await service.submit(validForm({ 'cf-turnstile-response': null }), IP);
			expect(result).toEqual({ ok: false, reason: 'captcha' });
			expect(captcha.verify).not.toHaveBeenCalled();
		});

		it('fails when Turnstile rejects the token', async () => {
			const { service, repo } = setup({ captchaPasses: false });
			expect(await service.submit(validForm(), IP)).toEqual({ ok: false, reason: 'captcha' });
			expect(repo.calls).toEqual([]);
		});
	});

	describe('invalid', () => {
		it('returns field errors without touching the repository', async () => {
			const { service, repo } = setup();
			const result = await service.submit(validForm({ secondPreference: roleA, fullName: '' }), IP);
			expect(result).toEqual({
				ok: false,
				reason: 'invalid',
				fieldErrors: {
					fullName: ['Required'],
					secondPreference: ['Choose two different roles']
				}
			});
			expect(repo.calls).toEqual([]);
		});

		it('rejects a file that claims to be a PDF but is not', async () => {
			const { service, repo } = setup();
			const fake = new File(['not a pdf at all'], 'resume.pdf', { type: 'application/pdf' });
			expect(await service.submit(validForm({ resume: fake }), IP)).toEqual({
				ok: false,
				reason: 'invalid',
				fieldErrors: { resume: ['Your resume must be a PDF'] }
			});
			expect(repo.calls).toEqual([]);
		});
	});

	it('returns duplicate without uploading anything', async () => {
		const { service, repo } = setup({ repo: { duplicate: true } });
		expect(await service.submit(validForm(), IP)).toEqual({ ok: false, reason: 'duplicate' });
		expect(repo.calls).toEqual(['findByEmail']);
		expect(repo.uploads.size).toBe(0);
	});

	it('treats a second application from the same email as a duplicate', async () => {
		const { service } = setup();
		await service.submit(validForm(), IP);
		const again = await service.submit(validForm({ email: 'ADA@student.unimelb.edu.au' }), IP);
		expect(again).toEqual({ ok: false, reason: 'duplicate' });
	});

	describe('upstream', () => {
		it.each([
			['upstreamOnCheck', 'findByEmail'],
			['upstreamOnUpload', 'uploadResume'],
			['upstreamOnCreate', 'create']
		] as const)('when %s, logging the failed step', async (option, step) => {
			const { service, repo, logs } = setup({ repo: { [option]: true } });
			expect(await service.submit(validForm(), IP)).toEqual({ ok: false, reason: 'upstream' });
			expect(repo.applications.size).toBe(0);
			expect(logs[0]).toMatchObject({ outcome: 'upstream', step });
		});

		it('never throws, even on an unexpected error', async () => {
			const { service, repo } = setup();
			vi.spyOn(repo, 'findByEmail').mockRejectedValue(new TypeError('bug'));
			const error = vi.spyOn(console, 'error').mockImplementation(() => {});
			expect(await service.submit(validForm(), IP)).toEqual({ ok: false, reason: 'upstream' });
			expect(error).toHaveBeenCalledTimes(1);
			error.mockRestore();
		});
	});

	it('never logs personal data', async () => {
		const { service, logs } = setup();
		await service.submit(validForm(), IP);
		await service.submit(validForm(), IP);
		await service.submit(validForm({ fullName: '' }), IP);
		const text = JSON.stringify(logs);
		for (const secret of ['Ada', 'ada@', 'Lovelace', 'I love data', IP]) {
			expect(text).not.toContain(secret);
		}
		expect(logs.map((l) => l.outcome)).toEqual(['ok', 'duplicate', 'invalid']);
	});
});

describe('hasPdfSignature', () => {
	it('accepts bytes starting with %PDF-', () => {
		expect(hasPdfSignature(makePdf())).toBe(true);
	});
	it.each([
		['empty bytes', new Uint8Array()],
		['too short', new TextEncoder().encode('%PD')],
		['a ZIP file', new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])]
	])('rejects %s', (_, bytes) => {
		expect(hasPdfSignature(bytes)).toBe(false);
	});
});
