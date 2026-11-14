import type { CaptchaVerifier } from './ports.ts';

export const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Name of the form field the Turnstile widget posts its token in. */
export const TURNSTILE_FIELD = 'cf-turnstile-response';

/** Name of the hidden field that people never see, so only bots fill it in. */
export const HONEYPOT_FIELD = 'website';

/** Cloudflare rejects longer tokens, so there's no point sending them. */
const MAX_TOKEN_LENGTH = 2048;

export interface TurnstileOptions {
	secretKey: string;
	/** Give up on Cloudflare after this long and treat the check as failed. */
	timeoutMs?: number;
	fetch?: typeof fetch;
}

/** Verifies a Cloudflare Turnstile token on the server. */
export class TurnstileVerifier implements CaptchaVerifier {
	private readonly secretKey: string;
	private readonly timeoutMs: number;
	private readonly fetch: typeof fetch;

	constructor({ secretKey, timeoutMs = 5000, fetch: fetchImpl = fetch }: TurnstileOptions) {
		if (!secretKey) throw new Error('TurnstileVerifier needs a secret key');
		this.secretKey = secretKey;
		this.timeoutMs = timeoutMs;
		this.fetch = fetchImpl;
	}

	async verify(token: string, ip: string): Promise<boolean> {
		if (!token || token.length > MAX_TOKEN_LENGTH) return false;

		const body = new URLSearchParams({ secret: this.secretKey, response: token });
		if (ip) body.set('remoteip', ip);

		try {
			const response = await this.fetch(SITEVERIFY_URL, {
				method: 'POST',
				body,
				signal: AbortSignal.timeout(this.timeoutMs)
			});
			if (!response.ok) return false;
			const result: unknown = await response.json();
			return (
				typeof result === 'object' &&
				result !== null &&
				'success' in result &&
				result.success === true
			);
		} catch {
			// Network errors, timeouts and bad JSON all count as a failed check.
			return false;
		}
	}
}

/** Whether the hidden honeypot field was filled in, which only bots do. */
export function isHoneypotFilled(form: FormData): boolean {
	const value = form.get(HONEYPOT_FIELD);
	return typeof value === 'string' ? value.trim() !== '' : value !== null;
}
