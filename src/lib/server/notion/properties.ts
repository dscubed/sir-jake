/** Property names in the Applications data source. They must match Notion exactly. */
export const PROP = {
	name: 'Name',
	email: 'Email',
	degree: 'Degree',
	graduation: 'Expected graduation',
	availableGroup: 'Group interview available',
	availableIndividual: 'Individual interview available',
	firstPreference: 'First preference',
	secondPreference: 'Second preference',
	resume: 'Resume',
	submittedAt: 'Submitted at',
	stage: 'Stage',
	submissionId: 'Submission ID'
} as const;

/** The `Stage` status every new application starts in. */
export const STAGE_APPLIED = 'Applied';

export const TIME_ZONE = 'Australia/Melbourne';

/** Notion rejects a single rich-text object longer than this. */
export const MAX_RICH_TEXT_LENGTH = 2000;
