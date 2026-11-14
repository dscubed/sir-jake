import type { ApplicationField } from '#lib/domain/application.ts';
import { visibleFields, type FormErrors, type FormValues } from './fields.ts';

export type SectionId = 'personal' | 'roles' | 'questions' | 'resume' | 'submit';

/** The four sections the applicant fills in, then the review step. */
export const sections: readonly { id: SectionId; label: string }[] = [
	{ id: 'personal', label: 'Personal details' },
	{ id: 'roles', label: 'Role preferences' },
	{ id: 'questions', label: 'Questions' },
	{ id: 'resume', label: 'Resume' },
	{ id: 'submit', label: 'Review and submit' }
];

const sectionFields: Record<Exclude<SectionId, 'submit'>, readonly ApplicationField[]> = {
	personal: ['fullName', 'email', 'degree', 'graduation', 'availableGroup', 'availableIndividual'],
	roles: ['firstPreference', 'secondPreference'],
	questions: ['answerGeneral', 'answerFirst', 'answerSecond'],
	resume: ['resume']
};

export interface SectionProgress {
	id: SectionId;
	label: string;
	done: boolean;
	/** "Not started", "2 items left", "Complete", … */
	status: string;
	/** Colour of the status line: green when complete, red for unfinished sections after a failed submit. */
	tone: 'neutral' | 'success' | 'error';
}

/**
 * Progress for the side menu (design handoff). `errors` are the current problems in every
 * visible field; `tried` is true after the first submit attempt.
 */
export function sectionProgress(
	values: FormValues,
	errors: FormErrors,
	tried: boolean
): { sections: SectionProgress[]; doneCount: number; total: number } {
	const visible = new Set(visibleFields(values));
	const rolesChosen = values.firstPreference !== '' && values.secondPreference !== '';

	const filled = Object.entries(sectionFields).map(([id, fields]) => {
		const shown = fields.filter((f) => visible.has(f));
		const left = shown.filter((f) => errors[f]).length;
		const done = left === 0 && (id !== 'questions' || rolesChosen);
		let status: string;
		if (done) status = 'Complete';
		else if (id === 'questions' && !rolesChosen) status = 'Choose your roles first';
		else if (left === shown.length) status = 'Not started';
		else status = left === 1 ? '1 item left' : `${left} items left`;
		const tone: SectionProgress['tone'] = done ? 'success' : tried ? 'error' : 'neutral';
		return { id: id as SectionId, done, status, tone };
	});

	const doneCount = filled.filter((s) => s.done).length;
	const total = filled.length;
	const ready = doneCount === total;

	const all = [
		...filled,
		{
			id: 'submit' as const,
			done: false,
			status: ready ? 'Ready to submit' : 'Finish the sections above',
			tone: ready ? ('success' as const) : ('neutral' as const)
		}
	];

	return {
		sections: all.map((s) => ({ ...s, label: sections.find((x) => x.id === s.id)!.label })),
		doneCount,
		total
	};
}
