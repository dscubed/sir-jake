import { APIErrorCode, APIResponseError, RequestTimeoutError } from '@notionhq/client';

export function apiError(status: number, code: APIErrorCode, headers: Record<string, string> = {}) {
	return new APIResponseError({
		code,
		status,
		message: `${status} ${code}`,
		headers: new Headers(headers),
		rawBodyText: '{}',
		additional_data: undefined,
		request_id: undefined
	});
}

export const rateLimited = (retryAfterSeconds?: number) =>
	apiError(
		429,
		APIErrorCode.RateLimited,
		retryAfterSeconds === undefined ? {} : { 'retry-after': String(retryAfterSeconds) }
	);
export const serverError = () => apiError(500, APIErrorCode.InternalServerError);
export const badGateway = () => apiError(502, APIErrorCode.ServiceUnavailable);
export const validationError = () => apiError(400, APIErrorCode.ValidationError);
export const timeout = () => new RequestTimeoutError();
export const networkError = () => new TypeError('fetch failed');
