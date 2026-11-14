import { describe, expect, it } from 'vitest';
import type { SubmitResult } from '../../src/lib/domain/application';
import { toActionResponse } from '../../src/lib/server/submitResponse';

describe('toActionResponse', () => {
	it('returns 200 with only the submission time on success', () => {
		const result: SubmitResult = {
			ok: true,
			pageId: 'secret-page-id',
			submittedAt: new Date('2027-03-01T01:00:00Z')
		};
		const response = toActionResponse(result);
		expect(response).toEqual({
			status: 200,
			data: { ok: true, submittedAt: '2027-03-01T01:00:00.000Z' }
		});
		expect(JSON.stringify(response)).not.toContain('secret-page-id');
	});

	it.each([
		['closed', 403],
		['captcha', 400],
		['duplicate', 409],
		['upstream', 502]
	] as const)('maps %s to %i', (reason, status) => {
		expect(toActionResponse({ ok: false, reason })).toEqual({
			status,
			data: { ok: false, reason }
		});
	});

	it('maps invalid to 400 with the field errors', () => {
		const fieldErrors = { email: ['Enter a valid email address'] };
		expect(toActionResponse({ ok: false, reason: 'invalid', fieldErrors })).toEqual({
			status: 400,
			data: { ok: false, reason: 'invalid', fieldErrors }
		});
	});
});
