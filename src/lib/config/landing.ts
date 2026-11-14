import type { DisplayStatus } from '#lib/domain/window.ts';

/**
 * Landing page copy (step 3.8). Placeholder wording from the design handoff;
 * the committee replaces it at step 4.3. Roles, dates and questions live in `recruitment.ts`.
 */
export const landing = {
	hero: {
		title: 'Join the team behind Melbourne’s leading data science club.',
		lead: 'We’re recruiting officers for 2027 Semester 1. No committee experience needed, just curiosity and the drive to make data science better for every student.'
	},
	about: {
		eyebrow: 'About DSCubed',
		words: ['Learn.', 'Connect.', 'Belong.'],
		lead: 'DS Cubed supports data science students to grow into world-class data scientists, representing students from every data science related course at the University of Melbourne.',
		body: 'As an officer, you’ll help run the socials, workshops, industry nights and study groups that make that happen.'
	},
	teams: {
		eyebrow: 'Our teams',
		/** `{count}` becomes the number of roles in the config, in words. */
		title: '{count} teams, all hiring officers',
		body: 'You’ll choose your preferred teams on the application page.'
	},
	process: {
		eyebrow: 'How it works',
		title: 'Three rounds, no surprises',
		application: 'Choose two preferred teams, answer a few short questions and upload your resume.',
		group: 'A short team exercise with other applicants and members of the committee.',
		individual: 'A relaxed chat with directors from your preferred teams.',
		offer: {
			when: 'Before semester starts',
			body: 'Successful applicants hear back by email and join onboarding.'
		}
	},
	faq: {
		eyebrow: 'FAQ',
		title: 'Questions, answered',
		items: [
			{
				q: 'Do I need committee experience?',
				a: 'No. Officer roles are made for students getting involved for the first time. We care about initiative and enthusiasm more than your CV.'
			},
			{
				q: 'Can I apply for more than one team?',
				a: 'Yes. You’ll choose a first and second preference on the application page.'
			},
			{
				q: 'Who can apply?',
				a: 'Any University of Melbourne student. You don’t need to study data science; we represent students from every data science related course.'
			},
			{
				q: 'How much time does it take?',
				a: 'Expect a few hours a week, with busier periods around major events.'
			}
		]
	},
	/** Calls to action change with the application window. */
	cta: {
		open: {
			hero: 'Apply now',
			nav: 'Apply now',
			title: 'Ready to join the committee?',
			body: 'Choose your preferred teams on the application page. It takes about 20 minutes.'
		},
		upcoming: {
			hero: 'Get notified on Discord',
			nav: 'Get notified',
			title: 'Applications open soon',
			body: 'Join our Discord to hear the moment applications open.'
		},
		closed: {
			hero: 'Join our Discord',
			nav: 'Join Discord',
			title: 'Thanks for your interest',
			body: 'Applications for 2027 Semester 1 have closed. Join our Discord to hear about the next round.'
		}
	} satisfies Record<DisplayStatus, { hero: string; nav: string; title: string; body: string }>
};

const numberWords = [
	'Zero',
	'One',
	'Two',
	'Three',
	'Four',
	'Five',
	'Six',
	'Seven',
	'Eight',
	'Nine',
	'Ten'
];

/** "Six" for 6; digits above ten. */
export function countInWords(n: number): string {
	return numberWords[n] ?? String(n);
}
