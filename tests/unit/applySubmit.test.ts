import { describe, expect, it } from 'vitest';
import type { ActionResult } from '$app/forms';
import { isBlank, parseDraft } from '../../src/lib/apply/draft';
import { emptyValues } from '../../src/lib/apply/fields';
import { formatSubmittedAt, outcomeFromResult, outcomeMessages } from '../../src/lib/apply/outcome';

describe('parseDraft', () => {
	it('restores known text fields', () => {
		expect(parseDraft(JSON.stringify({ fullName: 'Ada', firstPreference: 'events' }))).toEqual({
			fullName: 'Ada',
			firstPreference: 'events'
		});
	});

	it('ignores unknown keys and non-string values', () => {
		expect(parseDraft(JSON.stringify({ fullName: 'Ada', group: ['Day 1'], hacked: 'x' }))).toEqual({
			fullName: 'Ada'
		});
	});

	it('returns null for missing, corrupt or empty drafts', () => {
		expect(parseDraft(null)).toBeNull();
		expect(parseDraft('{not json')).toBeNull();
		expect(parseDraft('[1,2]')).toBeNull();
		expect(parseDraft('{}')).toBeNull();
	});
});

describe('isBlank', () => {
	it('is true only when every field is empty or whitespace', () => {
		expect(isBlank(emptyValues())).toBe(true);
		expect(isBlank({ ...emptyValues(), degree: '  ' })).toBe(true);
		expect(isBlank({ ...emptyValues(), degree: 'BSc' })).toBe(false);
	});
});

describe('outcomeFromResult (design §8)', () => {
	const location = '/apply';
	const failure = (status: number, data: Record<string, unknown>): ActionResult => ({
		type: 'failure',
		status,
		data,
		location
	});

	it('reads a success with its submission time', () => {
		const result: ActionResult = {
			type: 'success',
			status: 200,
			data: { ok: true, submittedAt: '2027-02-20T09:00:00+11:00' },
			location
		};
		const outcome = outcomeFromResult(result);
		expect(outcome.kind).toBe('success');
		if (outcome.kind === 'success') {
			expect(outcome.submittedAt.toISOString()).toBe('2027-02-19T22:00:00.000Z');
		}
	});

	it('maps each failure reason', () => {
		expect(outcomeFromResult(failure(403, { reason: 'closed' }))).toEqual({ kind: 'closed' });
		expect(outcomeFromResult(failure(409, { reason: 'duplicate' }))).toEqual({
			kind: 'retry',
			reason: 'duplicate',
			message: outcomeMessages.duplicate
		});
		expect(outcomeFromResult(failure(400, { reason: 'captcha' }))).toMatchObject({
			reason: 'captcha'
		});
		expect(outcomeFromResult(failure(502, { reason: 'upstream' }))).toMatchObject({
			reason: 'upstream'
		});
	});

	it('keeps the first server message per field', () => {
		const outcome = outcomeFromResult(
			failure(400, {
				reason: 'invalid',
				fieldErrors: { email: ['Enter a valid email address', 'x'] }
			})
		);
		expect(outcome).toEqual({
			kind: 'invalid',
			fieldErrors: { email: 'Enter a valid email address' }
		});
	});

	it('treats crashes, missing actions and odd data as a temporary failure', () => {
		expect(
			outcomeFromResult({
				type: 'error',
				status: 405,
				error: { message: 'No form action', status: 405 }
			})
		).toMatchObject({
			reason: 'upstream'
		});
		expect(outcomeFromResult({ type: 'success', status: 200, data: {}, location })).toMatchObject({
			reason: 'upstream'
		});
		expect(outcomeFromResult(failure(400, { reason: 'mystery' }))).toMatchObject({
			reason: 'upstream'
		});
	});
});

describe('formatSubmittedAt', () => {
	it('uses Melbourne time', () => {
		expect(formatSubmittedAt(new Date('2027-02-19T22:00:00Z'))).toMatch(
			/^20 February 2027(,| at) 9:00\sam$/
		);
	});
});
