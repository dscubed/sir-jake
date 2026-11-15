import { recruitment } from '#lib/config/recruitment.ts';
import type { ApplicationField } from '#lib/domain/application.ts';
import {
	emptyValues,
	fieldError,
	firstErrorField,
	validateForm,
	type FormErrors,
	type FormValues
} from './fields.ts';
import { sectionProgress } from './progress.ts';

export interface VisibleQuestion {
	field: 'answerGeneral' | 'answerFirst' | 'answerSecond';
	/** Small line above the question, e.g. "First preference: Events". */
	kicker: string;
	label: string;
}

const roleById = (id: string) => recruitment.roles.find((r) => r.id === id);

/**
 * State of the application form in the browser. Validation reuses the shared schema through
 * `fields.ts`; nothing here talks to the server.
 */
export class ApplicationForm {
	values = $state<FormValues>(emptyValues());
	resume = $state<File | null>(null);
	/** True after the first submit attempt: from then on errors show and update as the applicant types. */
	tried = $state(false);

	/** Every current problem, whether or not it is shown yet. */
	readonly errors: FormErrors = $derived(validateForm(this.values, this.resume));

	/**
	 * Errors the server returned (design §8 `invalid`), with the value each was about. A server
	 * error disappears as soon as the applicant changes that field.
	 */
	serverErrors = $state<Partial<Record<ApplicationField, { message: string; value: unknown }>>>({});

	/** Errors to show beside fields. The resume's type and size are flagged as soon as a file is picked. */
	readonly shownErrors: FormErrors = $derived.by(() => {
		const shown: FormErrors = {};
		for (const [field, entry] of Object.entries(this.serverErrors)) {
			const key = field as ApplicationField;
			const current = key === 'resume' ? this.resume : this.values[key];
			if (entry && entry.value === current) shown[key] = entry.message;
		}
		if (this.tried) return { ...shown, ...this.errors };
		const resumeError = this.resume ? fieldError('resume', this.resume) : undefined;
		return resumeError ? { ...shown, resume: resumeError } : shown;
	});

	readonly progress = $derived(sectionProgress(this.values, this.errors, this.tried));

	/** The general question, plus one question per chosen role (FR4). */
	readonly questions: VisibleQuestion[] = $derived.by(() => {
		const list: VisibleQuestion[] = [
			{
				field: 'answerGeneral',
				kicker: 'General question',
				label: recruitment.generalQuestion.label
			}
		];
		const first = roleById(this.values.firstPreference);
		const second = roleById(this.values.secondPreference);
		if (first) {
			list.push({
				field: 'answerFirst',
				kicker: `First preference: ${first.name}`,
				label: first.question.label
			});
		}
		if (second) {
			list.push({
				field: 'answerSecond',
				kicker: `Second preference: ${second.name}`,
				label: second.question.label
			});
		}
		return list;
	});

	/** Choosing the current second preference as the first clears the second (step 3.2). */
	setFirstPreference(id: string) {
		this.values.firstPreference = id;
		if (id !== '' && id === this.values.secondPreference) this.values.secondPreference = '';
	}

	/** Marks the form as attempted and returns the first field that needs fixing, if any. */
	attemptSubmit(): ApplicationField | undefined {
		this.tried = true;
		return firstErrorField(this.errors);
	}

	/** Shows the server's field errors beside the fields they belong to. */
	setServerErrors(errors: FormErrors) {
		const entries: typeof this.serverErrors = {};
		for (const [field, message] of Object.entries(errors)) {
			const key = field as ApplicationField;
			if (message) {
				entries[key] = { message, value: key === 'resume' ? this.resume : this.values[key] };
			}
		}
		this.serverErrors = entries;
		this.tried = true;
	}

	/** Fills the form from a saved draft (step 3.5). */
	restore(draft: Partial<FormValues>) {
		this.values = { ...emptyValues(), ...draft };
		// Drop interview options that are no longer offered, in case the config changed.
		const { group, individual } = recruitment.interviews;
		this.values.availableGroup = this.values.availableGroup.filter((o) => group.includes(o));
		this.values.availableIndividual = this.values.availableIndividual.filter((o) =>
			individual.includes(o)
		);
		// A draft could hold the same team twice if the config changed since it was saved.
		if (this.values.secondPreference === this.values.firstPreference) {
			this.values.secondPreference = '';
		}
	}

	clear() {
		this.values = emptyValues();
		this.resume = null;
		this.tried = false;
		this.serverErrors = {};
	}
}
