import { APIErrorCode, isHTTPResponseError, RequestTimeoutError } from '@notionhq/client';

/**
 * How a failed Notion request should be treated.
 * - `rejected`: Notion turned the request away without processing it (rate limited or overloaded).
 *   Safe to retry any request, including page creation.
 * - `unknown`: a timeout, network error or 5xx. Notion may or may not have processed it.
 * - `permanent`: any other error, such as a bad token or an invalid payload. Retrying won't help.
 */
export type FailureKind = 'rejected' | 'unknown' | 'permanent';

export function classify(error: unknown): FailureKind {
	if (isHTTPResponseError(error)) {
		if (error.code === APIErrorCode.RateLimited || error.code === APIErrorCode.ServiceOverload) {
			return 'rejected';
		}
		if (error.status === 429 || error.status === 529) return 'rejected';
		return error.status >= 500 ? 'unknown' : 'permanent';
	}
	if (RequestTimeoutError.isRequestTimeoutError(error)) return 'unknown';
	// fetch throws a TypeError when the connection fails before any response arrives.
	if (error instanceof TypeError) return 'unknown';
	return 'permanent';
}

/** The `Retry-After` delay in milliseconds, if Notion sent one. */
export function retryAfterMs(error: unknown): number | undefined {
	if (!isHTTPResponseError(error)) return undefined;
	const value = header(error.headers, 'retry-after');
	if (value === undefined) return undefined;
	const seconds = Number(value);
	if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
	const date = Date.parse(value);
	return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

function header(headers: unknown, name: string): string | undefined {
	if (!headers || typeof headers !== 'object') return undefined;
	if ('get' in headers && typeof headers.get === 'function') {
		return (headers.get(name) as string | null) ?? undefined;
	}
	const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
	return typeof entry?.[1] === 'string' ? entry[1] : undefined;
}

export interface RetryPolicy {
	/** Retries after the first attempt. */
	retries: number;
	/** Delay before the first retry when Notion sends no `Retry-After`. Doubles each time. */
	baseDelayMs: number;
	/** Give up instead of waiting longer than this, so a submission never hangs. */
	maxDelayMs: number;
	sleep: (ms: number) => Promise<void>;
}

export const defaultRetryPolicy: RetryPolicy = {
	retries: 2,
	baseDelayMs: 500,
	maxDelayMs: 5000,
	sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms))
};

/**
 * Runs `attempt`, retrying failures whose kind is in `retryOn`. Throws the last error once the
 * retries run out, the error isn't retryable, or Notion asks for a longer wait than `maxDelayMs`.
 */
export async function withRetry<T>(
	attempt: () => Promise<T>,
	retryOn: readonly FailureKind[],
	policy: RetryPolicy
): Promise<T> {
	for (let n = 0; ; n++) {
		try {
			return await attempt();
		} catch (error) {
			if (n >= policy.retries || !retryOn.includes(classify(error))) throw error;
			const delay = retryAfterMs(error) ?? policy.baseDelayMs * 2 ** n;
			if (delay > policy.maxDelayMs) throw error;
			await policy.sleep(delay);
		}
	}
}
