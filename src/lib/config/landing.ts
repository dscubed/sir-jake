export const landing = {
	hero: {
		title: 'Join the largest data science student society in Australia',
		lead: 'Gain valuable experiences, meet life-long friends, and make the most out of your time at uni.'
	},
	about: {
		eyebrow: 'About DSCubed',
		words: ['Learn.', 'Connect.', 'Belong.'],
		lead: 'DSCubed supports data science students to grow into world-class data scientists, representing students from every data science related course at the University of Melbourne.',
		body: 'As an officer, you’ll help run the socials, workshops, industry nights and study groups that make that happen.'
	},
	teams: {
		eyebrow: 'Our teams',
		title: '{count} teams, all hiring officers',
		body: 'Learn more about them here.'
	},
	process: {
		eyebrow: 'How it works',
		title: 'Our recruitment process',
		application: 'Choose two preferred teams, answer a few short questions and upload your resume.',
		group:
			'A short group exercise with other applicants and members of the committee. You’ll choose the sessions you can attend when you apply.',
		individual:
			'An interview with directors from your preferred teams. You’ll choose the days you can do when you apply.',
		offer: 'Successful applicants will hear back by email and join onboarding.'
	},
	faq: {
		eyebrow: 'FAQ',
		title: 'Find the answer to your questions!',
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
				a: 'We welcome students from any university in Melbourne, studying any course, not just data science students! As long as you have the passion and willingness to contribute.'
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
			label: 'Apply now',
			title: 'Ready to join the committee?',
			body: 'Choose your preferred teams on the application page. It takes about 20 minutes.'
		},
		/** Shown before applications open and after they close. */
		closed: 'Applications closed'
	}
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
