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

	/** Errors to show beside fields. The resume's type and size are flagged as soon as a file is picked. */
	readonly shownErrors: FormErrors = $derived.by(() => {
		if (this.tried) return this.errors;
		const resumeError = this.resume ? fieldError('resume', this.resume) : undefined;
		return resumeError ? { resume: resumeError } : {};
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

	clear() {
		this.values = emptyValues();
		this.resume = null;
		this.tried = false;
	}
}
