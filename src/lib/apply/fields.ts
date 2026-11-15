import type { ApplicationField } from '#lib/domain/application.ts';
import { applicationSchema } from '#lib/domain/schema.ts';

/** Everything the applicant types or picks, as the form posts it (design §7.5). The resume is kept separately. */
export interface FormValues {
	fullName: string;
	email: string;
	degree: string;
	graduation: string;
	/** The interview options ticked, empty when none are. */
	availableGroup: string[];
	availableIndividual: string[];
	firstPreference: string;
	secondPreference: string;
	answerGeneral: string;
	answerFirst: string;
	answerSecond: string;
}

export type ValueField = keyof FormValues;

export const emptyValues = (): FormValues => ({
	fullName: '',
	email: '',
	degree: '',
	graduation: '',
	availableGroup: [],
	availableIndividual: [],
	firstPreference: '',
	secondPreference: '',
	answerGeneral: '',
	answerFirst: '',
	answerSecond: ''
});

/** One error per field, keyed by the field's form name. */
export type FormErrors = Partial<Record<ApplicationField, string>>;

/** Specific "what to do" messages for empty fields (design handoff); other errors come from the shared schema. */
export const requiredMessages: Record<ApplicationField, string> = {
	fullName: 'Enter your full name',
	email: 'Enter your student email',
	degree: 'Enter your degree',
	graduation: 'Select your expected graduation',
	availableGroup: 'Select at least one session you can attend',
	availableIndividual: 'Select at least one day you can attend',
	firstPreference: 'Choose your first preference',
	secondPreference: 'Choose your second preference',
	answerGeneral: 'Answer this question',
	answerFirst: 'Answer this question',
	answerSecond: 'Answer this question',
	resume: 'Upload your resume as a PDF'
};

/** Form fields in page order, used to find the first error. */
export const fieldOrder: readonly ApplicationField[] = [
	'fullName',
	'email',
	'degree',
	'graduation',
	'firstPreference',
	'secondPreference',
	'answerGeneral',
	'answerFirst',
	'answerSecond',
	'resume',
	'availableGroup',
	'availableIndividual'
];

type FieldValue = FormValues[ValueField] | File | null;

const isEmpty = (value: FieldValue) => {
	if (value === null) return true;
	if (typeof value === 'string') return value.trim() === '';
	if (Array.isArray(value)) return value.length === 0;
	return value.size === 0;
};

/**
 * Checks one field with the same Zod rules the server uses (design §7.6), so the browser and
 * server never disagree. Returns the message to show, or `undefined` if the value is valid.
 */
export function fieldError(field: ApplicationField, value: FieldValue): string | undefined {
	if (isEmpty(value)) return requiredMessages[field];
	const result = applicationSchema.shape[field].safeParse(value);
	return result.success ? undefined : result.error.issues[0]?.message;
}

/** A role question is only shown, and only checked, once its preference is chosen. */
export function visibleFields(values: FormValues): ApplicationField[] {
	return fieldOrder.filter(
		(f) =>
			(f !== 'answerFirst' || values.firstPreference !== '') &&
			(f !== 'answerSecond' || values.secondPreference !== '')
	);
}

/** Checks every visible field. Fields without an entry are valid. */
export function validateForm(values: FormValues, resume: File | null): FormErrors {
	const errors: FormErrors = {};
	for (const field of visibleFields(values)) {
		const error = fieldError(field, field === 'resume' ? resume : values[field]);
		if (error) errors[field] = error;
	}
	if (
		values.firstPreference !== '' &&
		values.firstPreference === values.secondPreference &&
		!errors.secondPreference
	) {
		errors.secondPreference = 'Choose two different teams';
	}
	return errors;
}

/** The first field with an error, in page order. */
export function firstErrorField(errors: FormErrors): ApplicationField | undefined {
	return fieldOrder.find((f) => errors[f]);
}
