/**
 * Cloudflare's published Turnstile test keys. They never protect anything and are safe to commit.
 * The test secret keys only accept the dummy token.
 */
export const TURNSTILE_TEST = {
	siteKeyPass: '1x00000000000000000000AA',
	siteKeyBlock: '2x00000000000000000000AB',
	secretPass: '1x0000000000000000000000000000000AA',
	secretFail: '2x0000000000000000000000000000000AA',
	dummyToken: 'XXXX.DUMMY.TOKEN.XXXX'
} as const;
