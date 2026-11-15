import { describe, expect, it } from 'vitest';
import {
	emptyValues,
	fieldError,
	firstErrorField,
	validateForm,
	visibleFields,
	type FormValues
} from '../../src/lib/apply/fields';
import { sectionProgress } from '../../src/lib/apply/progress';

const pdf = (bytes = 1024) =>
	new File([new Uint8Array(bytes)], 'resume.pdf', { type: 'application/pdf' });

const filled = (overrides: Partial<FormValues> = {}): FormValues => ({
	fullName: 'Ada Lovelace',
	email: 'ada@student.unimelb.edu.au',
	degree: 'Bachelor of Science',
	graduation: '2028 Sem 2',
	availableGroup: ['Wed 10 March'],
	availableIndividual: ['Fri 12 March', 'Sat 13 March'],
	firstPreference: 'events',
	secondPreference: 'graphics',
	answerGeneral: 'I like data.',
	answerFirst: 'A datathon.',
	answerSecond: 'Bolder colours.',
	...overrides
});

describe('fieldError', () => {
	it('uses a specific message for empty fields', () => {
		expect(fieldError('fullName', '  ')).toBe('Enter your full name');
		expect(fieldError('availableGroup', [])).toBe('Select at least one session you can attend');
		expect(fieldError('resume', null)).toBe('Upload your resume as a PDF');
	});

	it('uses the shared schema for everything else', () => {
		expect(fieldError('email', 'not-an-email')).toBe('Enter a valid email address');
		expect(fieldError('answerGeneral', 'word '.repeat(201))).toMatch(/200 words or fewer/);
		expect(fieldError('answerGeneral', 'word '.repeat(200))).toBeUndefined();
	});

	it('accepts any valid email, not only student addresses', () => {
		expect(fieldError('email', 'ada@gmail.com')).toBeUndefined();
	});

	it('rejects a non-PDF and an oversized resume', () => {
		const doc = new File(['x'], 'cv.docx', { type: 'application/msword' });
		expect(fieldError('resume', doc)).toBe('Your resume must be a PDF');
		expect(fieldError('resume', pdf(4 * 1024 * 1024 + 1))).toMatch(/4 MB or smaller/);
		expect(fieldError('resume', pdf())).toBeUndefined();
	});
});

describe('validateForm', () => {
	it('passes a complete application', () => {
		expect(validateForm(filled(), pdf())).toEqual({});
	});

	it('only checks role questions whose preference is chosen', () => {
		const values = filled({
			firstPreference: '',
			secondPreference: '',
			answerFirst: '',
			answerSecond: ''
		});
		expect(visibleFields(values)).not.toContain('answerFirst');
		const errors = validateForm(values, pdf());
		expect(errors.answerFirst).toBeUndefined();
		expect(errors.firstPreference).toBe('Choose your first preference');
	});

	it('rejects the same team twice', () => {
		expect(validateForm(filled({ secondPreference: 'events' }), pdf()).secondPreference).toBe(
			'Choose two different teams'
		);
	});

	it('finds the first error in page order', () => {
		const errors = validateForm(filled({ degree: '', answerGeneral: '' }), null);
		expect(firstErrorField(errors)).toBe('degree');
	});
});

describe('sectionProgress', () => {
	it('starts with nothing done and questions waiting on roles', () => {
		const values = emptyValues();
		const { sections, doneCount } = sectionProgress(values, validateForm(values, null), false);
		expect(doneCount).toBe(0);
		expect(sections.map((s) => s.status)).toEqual([
			'Not started',
			'Not started',
			'Choose your roles first',
			'Not started',
			'Not started',
			'Finish the sections above'
		]);
	});

	it('counts items left and marks unfinished sections red after a submit attempt', () => {
		const values = filled({ degree: '', graduation: '' });
		const { sections } = sectionProgress(values, validateForm(values, pdf()), true);
		expect(sections[0]).toMatchObject({ status: '2 items left', tone: 'error' });
		expect(sections[1]).toMatchObject({ status: 'Complete', tone: 'success' });
	});

	it('is ready to submit when all five sections are complete', () => {
		const values = filled();
		const { sections, doneCount } = sectionProgress(values, validateForm(values, pdf()), false);
		expect(doneCount).toBe(5);
		expect(sections[5]).toMatchObject({ status: 'Ready to submit', tone: 'success' });
	});
});
