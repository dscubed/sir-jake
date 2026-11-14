import { describe, expect, it } from 'vitest';
import { countWords } from '../../src/lib/domain/words';

describe('countWords', () => {
	it.each([
		['', 0],
		['   \n\t ', 0],
		['hello', 1],
		['hello world', 2],
		['  leading and trailing  ', 3],
		['tabs\tand\nnewlines  and   runs', 5],
		["don't count-hyphens twice", 3]
	])('%j has %i words', (text, expected) => {
		expect(countWords(text)).toBe(expected);
	});
});
