import { describe, expect, it } from 'vitest';
import { TurnstileVerifier } from '../../src/lib/server/turnstile';
import { TURNSTILE_TEST } from '../fixtures/turnstile';

describe('TurnstileVerifier against Cloudflare', () => {
	it('passes with the always-pass test secret key', async () => {
		const verifier = new TurnstileVerifier({ secretKey: TURNSTILE_TEST.secretPass });
		expect(await verifier.verify(TURNSTILE_TEST.dummyToken, '')).toBe(true);
	});

	it('fails with the always-fail test secret key', async () => {
		const verifier = new TurnstileVerifier({ secretKey: TURNSTILE_TEST.secretFail });
		expect(await verifier.verify(TURNSTILE_TEST.dummyToken, '')).toBe(false);
	});
});
