import { describe, expect, it, vi } from 'vitest';
import {
	classify,
	retryAfterMs,
	withRetry,
	type RetryPolicy
} from '../../src/lib/server/notion/retry';
import {
	badGateway,
	networkError,
	rateLimited,
	serverError,
	timeout,
	validationError
} from '../fixtures/notionErrors';

const policy = (overrides: Omit<Partial<RetryPolicy>, 'sleep'> = {}) => ({
	retries: 2,
	baseDelayMs: 100,
	maxDelayMs: 5000,
	...overrides,
	sleep: vi.fn<RetryPolicy['sleep']>().mockResolvedValue(undefined)
});

describe('classify', () => {
	it.each([
		['a 429', rateLimited(), 'rejected'],
		['a 500', serverError(), 'unknown'],
		['a 502', badGateway(), 'unknown'],
		['a timeout', timeout(), 'unknown'],
		['a network error', networkError(), 'unknown'],
		['a 400', validationError(), 'permanent'],
		['any other error', new Error('bug'), 'permanent']
	])('treats %s as %s', (_, error, kind) => {
		expect(classify(error)).toBe(kind);
	});
});

describe('retryAfterMs', () => {
	it('reads Retry-After in seconds', () => {
		expect(retryAfterMs(rateLimited(2))).toBe(2000);
	});
	it('is undefined without the header or for non-HTTP errors', () => {
		expect(retryAfterMs(rateLimited())).toBeUndefined();
		expect(retryAfterMs(timeout())).toBeUndefined();
	});
});

describe('withRetry', () => {
	it('returns the first success without sleeping', async () => {
		const p = policy();
		expect(await withRetry(async () => 'ok', ['rejected'], p)).toBe('ok');
		expect(p.sleep).not.toHaveBeenCalled();
	});

	it('honours Retry-After, then succeeds', async () => {
		const p = policy();
		const attempt = vi.fn().mockRejectedValueOnce(rateLimited(1)).mockResolvedValue('ok');
		expect(await withRetry(attempt, ['rejected'], p)).toBe('ok');
		expect(p.sleep).toHaveBeenCalledWith(1000);
	});

	it('backs off exponentially without Retry-After', async () => {
		const p = policy();
		const attempt = vi
			.fn()
			.mockRejectedValueOnce(serverError())
			.mockRejectedValueOnce(serverError())
			.mockResolvedValue('ok');
		expect(await withRetry(attempt, ['unknown'], p)).toBe('ok');
		expect(p.sleep.mock.calls).toEqual([[100], [200]]);
	});

	it('stops after the configured number of retries', async () => {
		const attempt = vi.fn().mockRejectedValue(serverError());
		await expect(withRetry(attempt, ['unknown'], policy())).rejects.toMatchObject({ status: 500 });
		expect(attempt).toHaveBeenCalledTimes(3);
	});

	it('does not retry kinds it was not asked to', async () => {
		const attempt = vi.fn().mockRejectedValue(serverError());
		await expect(withRetry(attempt, ['rejected'], policy())).rejects.toMatchObject({ status: 500 });
		expect(attempt).toHaveBeenCalledTimes(1);
	});

	it('never retries a permanent error', async () => {
		const attempt = vi.fn().mockRejectedValue(validationError());
		await expect(withRetry(attempt, ['rejected', 'unknown'], policy())).rejects.toMatchObject({
			status: 400
		});
		expect(attempt).toHaveBeenCalledTimes(1);
	});

	it('gives up rather than wait longer than maxDelayMs', async () => {
		const p = policy({ maxDelayMs: 5000 });
		const attempt = vi.fn().mockRejectedValue(rateLimited(30));
		await expect(withRetry(attempt, ['rejected'], p)).rejects.toMatchObject({ status: 429 });
		expect(attempt).toHaveBeenCalledTimes(1);
		expect(p.sleep).not.toHaveBeenCalled();
	});
});
