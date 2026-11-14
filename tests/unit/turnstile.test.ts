import { describe, expect, it, vi } from 'vitest';
import {
	HONEYPOT_FIELD,
	isHoneypotFilled,
	SITEVERIFY_URL,
	TurnstileVerifier
} from '../../src/lib/server/turnstile';

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function verifierWith(fetchImpl: (...args: Parameters<typeof fetch>) => Promise<Response>) {
	const fake = vi.fn(fetchImpl);
	return { verifier: new TurnstileVerifier({ secretKey: 'secret', fetch: fake }), fake };
}

describe('TurnstileVerifier', () => {
	it('posts the secret, token and IP to siteverify', async () => {
		const { verifier, fake } = verifierWith(async () => json({ success: true }));

		expect(await verifier.verify('token-1', '203.0.113.7')).toBe(true);

		const [url, init] = fake.mock.calls[0];
		expect(url).toBe(SITEVERIFY_URL);
		expect(init?.method).toBe('POST');
		const body = init?.body as URLSearchParams;
		expect(Object.fromEntries(body)).toEqual({
			secret: 'secret',
			response: 'token-1',
			remoteip: '203.0.113.7'
		});
	});

	it('leaves out the IP when it is unknown', async () => {
		const { verifier, fake } = verifierWith(async () => json({ success: true }));
		await verifier.verify('token-1', '');
		expect((fake.mock.calls[0][1]?.body as URLSearchParams).has('remoteip')).toBe(false);
	});

	it.each([
		[
			'Cloudflare says no',
			async () => json({ success: false, 'error-codes': ['invalid-input-response'] })
		],
		['the response is not JSON', async () => new Response('<html>oops</html>')],
		['the success flag is not exactly true', async () => json({ success: 'true' })],
		['Cloudflare returns a 5xx', async () => json({ success: true }, 503)],
		['the network fails', async () => Promise.reject(new TypeError('fetch failed'))],
		[
			'the request times out',
			async () => Promise.reject(new DOMException('timed out', 'TimeoutError'))
		]
	])('fails the check when %s', async (_, impl) => {
		const { verifier } = verifierWith(impl);
		expect(await verifier.verify('token-1', '203.0.113.7')).toBe(false);
	});

	it.each([
		['an empty token', ''],
		['a token over 2,048 characters', 'x'.repeat(2049)]
	])('rejects %s without calling Cloudflare', async (_, token) => {
		const { verifier, fake } = verifierWith(async () => json({ success: true }));
		expect(await verifier.verify(token, '203.0.113.7')).toBe(false);
		expect(fake).not.toHaveBeenCalled();
	});

	it('refuses to start without a secret key', () => {
		expect(() => new TurnstileVerifier({ secretKey: '' })).toThrow('secret key');
	});
});

describe('isHoneypotFilled', () => {
	const form = (value?: string) => {
		const f = new FormData();
		if (value !== undefined) f.set(HONEYPOT_FIELD, value);
		return f;
	};

	it.each([
		['missing', undefined, false],
		['empty', '', false],
		['only whitespace', '   ', false],
		['filled in', 'https://spam.example', true]
	])('is %s → %s', (_, value, expected) => {
		expect(isHoneypotFilled(form(value))).toBe(expected);
	});
});
