import { describe, expect, it } from 'vitest';
import { isSubmissionId } from '../../src/lib/domain/submissionId';

describe('isSubmissionId', () => {
	it('accepts what crypto.randomUUID() produces', () => {
		for (let i = 0; i < 20; i++) expect(isSubmissionId(crypto.randomUUID())).toBe(true);
	});

	it.each([
		['an empty string', ''],
		['upper case', crypto.randomUUID().toUpperCase()],
		['a non-v4 UUID', '6f1c2a9e-0000-1000-8000-000000000001'],
		['surrounding whitespace', ` ${crypto.randomUUID()}`],
		['arbitrary text', 'hello'],
		['a number', 42],
		['null', null]
	])('rejects %s', (_, value) => {
		expect(isSubmissionId(value)).toBe(false);
	});
});
