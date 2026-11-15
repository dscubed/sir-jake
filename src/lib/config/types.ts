export interface Question {
	/** Stable slug, e.g. "events_q". */
	id: string;
	label: string;
	helpText?: string;
}

export interface Role {
	/** Stable slug, e.g. "events". Posted by the form as `firstPreference` / `secondPreference`. */
	id: string;
	/** Must match the Notion `First preference` / `Second preference` select option exactly. */
	name: string;
	/** What the team does. Shown on the landing page. */
	description: string;
	/** Shown on the landing page under the description. */
	lookingFor: {
		/** e.g. "We are looking for applicants who:" */
		intro: string;
		points: string[];
	};
	/** Exactly one question per role, asked whichever rank the role is given. */
	question: Question;
}

export interface RecruitmentConfig {
	cycle: '2027-S1';
	/** ISO 8601 with the Melbourne offset, e.g. "2027-02-20T09:00:00+11:00". */
	opensAt: string;
	/** Same format as `opensAt`. */
	closesAt: string;
	/** Maximum words per response. */
	wordLimit: 200;
	/** 4 MB, set by Vercel's request body limit. */
	maxResumeBytes: number;
	/** The interview options applicants choose from. */
	interviews: {
		/**
		 * Group interview sessions the applicant picks from, e.g. "Wed 10 March". Must match the
		 * Notion `Group interview availability` multi-select options exactly.
		 */
		group: readonly [string, ...string[]];
		/** Individual interview days. Must match the `Individual interview availability` options. */
		individual: readonly [string, ...string[]];
	};
	/** Display date for when outcomes are sent.  */
	outcomesDate: string;
	/** Must match the Notion `Expected graduation` select options exactly. */
	graduationOptions: readonly string[];
	generalQuestion: Question;
	/** At least two, with unique ids and names. */
	roles: readonly Role[];
}
