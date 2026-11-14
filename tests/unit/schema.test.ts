import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { recruitment } from '../../src/lib/config/recruitment';
import { applicationSchema, parseApplicationForm } from '../../src/lib/domain/schema';

const [roleA, roleB] = recruitment.roles.map((r) => r.id);
const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ');
const pdf = (size = 10, name = 'resume.pdf', type = 'application/pdf') =>
	new File([new Uint8Array(size)], name, { type });

const valid = () => ({
	fullName: 'Ada Lovelace',
	email: 'ada@student.unimelb.edu.au',
	degree: 'Bachelor of Science',
	graduation: recruitment.graduationOptions[0],
	availableGroup: 'yes',
	availableIndividual: 'no',
	firstPreference: roleA,
	secondPreference: roleB,
	answerGeneral: 'Because I love data.',
	answerFirst: 'First answer.',
	answerSecond: 'Second answer.',
	resume: pdf() as File
});

type Input = ReturnType<typeof valid>;

function errorsFor(overrides: Partial<Record<keyof Input, unknown>>) {
	const result = applicationSchema.safeParse({ ...valid(), ...overrides });
	if (result.success) return undefined;
	return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

describe('applicationSchema', () => {
	it('accepts a valid application', () => {
		expect(applicationSchema.safeParse(valid()).success).toBe(true);
	});

	describe('fullName', () => {
		it('is trimmed', () => {
			const out = applicationSchema.parse({ ...valid(), fullName: '  Ada  ' });
			expect(out.fullName).toBe('Ada');
		});
		it('is required, including whitespace only', () => {
			expect(errorsFor({ fullName: '   ' })?.fullName).toEqual(['Required']);
			expect(errorsFor({ fullName: undefined })?.fullName).toEqual(['Required']);
		});
		it('allows 100 characters and rejects 101', () => {
			expect(errorsFor({ fullName: 'a'.repeat(100) })).toBeUndefined();
			expect(errorsFor({ fullName: 'a'.repeat(101) })?.fullName).toHaveLength(1);
		});
	});

	describe('email', () => {
		it('is trimmed and lowercased', () => {
			const out = applicationSchema.parse({ ...valid(), email: '  Ada@Student.UniMelb.EDU.au ' });
			expect(out.email).toBe('ada@student.unimelb.edu.au');
		});
		it('rejects an invalid address', () => {
			expect(errorsFor({ email: 'not-an-email' })?.email).toEqual(['Enter a valid email address']);
		});
		it('is required', () => {
			expect(errorsFor({ email: '' })?.email).toEqual(['Required']);
		});
		it('rejects more than 254 characters', () => {
			const long = `${'a'.repeat(64)}@${'b'.repeat(185)}.com`;
			expect(long).toHaveLength(254);
			expect(errorsFor({ email: long })?.email).toBeUndefined();
			expect(errorsFor({ email: `a${long}` })?.email).toContain(
				'Keep your email to 254 characters or fewer'
			);
		});
	});

	describe('degree', () => {
		it('is trimmed and required', () => {
			expect(applicationSchema.parse({ ...valid(), degree: ' BSc ' }).degree).toBe('BSc');
			expect(errorsFor({ degree: ' ' })?.degree).toEqual(['Required']);
		});
		it('allows 150 characters and rejects 151', () => {
			expect(errorsFor({ degree: 'a'.repeat(150) })).toBeUndefined();
			expect(errorsFor({ degree: 'a'.repeat(151) })?.degree).toHaveLength(1);
		});
	});

	describe('graduation', () => {
		it('accepts every configured option', () => {
			for (const option of recruitment.graduationOptions) {
				expect(errorsFor({ graduation: option })).toBeUndefined();
			}
		});
		it('rejects anything else', () => {
			expect(errorsFor({ graduation: '2031 Sem 1' })?.graduation).toHaveLength(1);
		});
	});

	describe('availability', () => {
		it('turns "yes" and "no" into booleans', () => {
			const out = applicationSchema.parse({
				...valid(),
				availableGroup: 'yes',
				availableIndividual: 'no'
			});
			expect(out.availableGroup).toBe(true);
			expect(out.availableIndividual).toBe(false);
		});
		it('rejects other values and missing answers', () => {
			expect(errorsFor({ availableGroup: 'maybe' })?.availableGroup).toEqual(['Choose yes or no']);
			expect(errorsFor({ availableIndividual: undefined })?.availableIndividual).toEqual([
				'Choose yes or no'
			]);
		});
	});

	describe('role preferences', () => {
		it('rejects identical first and second preferences', () => {
			expect(errorsFor({ secondPreference: roleA })?.secondPreference).toEqual([
				'Choose two different roles'
			]);
		});
		it('rejects an unknown role id', () => {
			expect(errorsFor({ firstPreference: 'astronaut' })?.firstPreference).toEqual([
				'Choose a role'
			]);
		});
		it('rejects a role name instead of its id', () => {
			const name = recruitment.roles[0].name;
			expect(name).not.toBe(roleA);
			expect(errorsFor({ firstPreference: name })?.firstPreference).toEqual(['Choose a role']);
		});
	});

	describe.each(['answerGeneral', 'answerFirst', 'answerSecond'] as const)('%s', (field) => {
		it(`allows exactly ${recruitment.wordLimit} words and rejects ${recruitment.wordLimit + 1}`, () => {
			expect(errorsFor({ [field]: words(recruitment.wordLimit) })).toBeUndefined();
			expect(errorsFor({ [field]: words(recruitment.wordLimit + 1) })?.[field]).toEqual([
				`Keep your answer to ${recruitment.wordLimit} words or fewer`
			]);
		});
		it('rejects a single 2,001-character word', () => {
			expect(errorsFor({ [field]: 'a'.repeat(2000) })).toBeUndefined();
			expect(errorsFor({ [field]: 'a'.repeat(2001) })?.[field]).toEqual([
				'Keep your answer to 2000 characters or fewer'
			]);
		});
		it('is required, including whitespace only', () => {
			expect(errorsFor({ [field]: ' \n ' })?.[field]).toEqual(['Required']);
		});
		it('is trimmed', () => {
			expect(applicationSchema.parse({ ...valid(), [field]: '  hi  ' })[field]).toBe('hi');
		});
	});

	describe('resume', () => {
		const max = recruitment.maxResumeBytes;
		it('accepts a PDF of exactly the size limit', () => {
			expect(errorsFor({ resume: pdf(max) })).toBeUndefined();
		});
		it('rejects a PDF over the size limit', () => {
			expect(errorsFor({ resume: pdf(max + 1) })?.resume).toEqual([
				'Your resume must be 4 MB or smaller'
			]);
		});
		it('rejects a missing or empty file with one message', () => {
			expect(errorsFor({ resume: undefined })?.resume).toEqual(['Attach your resume']);
			expect(errorsFor({ resume: pdf(0, '', 'application/octet-stream') })?.resume).toEqual([
				'Attach your resume'
			]);
		});
		it('rejects a non-PDF type or extension', () => {
			expect(errorsFor({ resume: pdf(10, 'resume.docx', 'application/msword') })?.resume).toEqual([
				'Your resume must be a PDF'
			]);
			expect(errorsFor({ resume: pdf(10, 'resume.txt') })?.resume).toEqual([
				'Your resume must be a PDF'
			]);
		});
		it('accepts an upper-case .PDF extension', () => {
			expect(errorsFor({ resume: pdf(10, 'RESUME.PDF') })).toBeUndefined();
		});
	});
});

describe('parseApplicationForm', () => {
	const toForm = (values: Record<string, string | File>) => {
		const form = new FormData();
		for (const [k, v] of Object.entries(values)) form.append(k, v);
		return form;
	};

	it('parses a valid form', () => {
		const result = parseApplicationForm(toForm(valid()));
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.availableGroup).toBe(true);
	});

	it('reports an error for every missing field without throwing', () => {
		const result = parseApplicationForm(new FormData());
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(Object.keys(result.fieldErrors).sort()).toEqual(Object.keys(valid()).sort());
		}
	});

	it('ignores fields the schema does not know', () => {
		const result = parseApplicationForm(toForm({ ...valid(), website: '', extra: 'x' }));
		expect(result.success).toBe(true);
		if (result.success) expect(result.data).not.toHaveProperty('extra');
	});
});
