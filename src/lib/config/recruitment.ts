import type { RecruitmentConfig, Role } from './types';

const WHO = 'We are looking for applicants who:';
const SKILLS = 'We are looking for applicants with skills such as:';

function role(
	id: string,
	name: string,
	description: string,
	lookingFor: Role['lookingFor'],
	question: string
): Role {
	return { id, name, description, lookingFor, question: { id: `${id}_q`, label: question } };
}

export const recruitment = {
	cycle: '2027-S1',
	opensAt: '2027-02-22T09:00:00+11:00',
	closesAt: '2027-03-07T23:59:59+11:00',
	wordLimit: 200,
	maxResumeBytes: 4 * 1024 * 1024,
	interviews: {
		group: ['Wed 10 March', 'Thu 11 March'],
		individual: ['Fri 12 March', 'Sat 13 March']
	},
	outcomesDate: 'Sun 14 March',
	graduationOptions: [
		'2027 Sem 1',
		'2027 Sem 2',
		'2028 Sem 1',
		'2028 Sem 2',
		'2029 Sem 1',
		'2029 Sem 2',
		'2030 Sem 1',
		'2030 Sem 2'
	],
	generalQuestion: {
		id: 'why_join',
		label: 'Why do you want to join the DSCubed committee, and what would you bring to the team?'
	},

	roles: [
		role(
			'events',
			'Events',
			'Organise and coordinate club events, including workshops, networking sessions and social gatherings.',
			{
				intro: WHO,
				points: [
					'Are committed to attending at least 75% of events.',
					'Have strong logistical and setup skills to ensure smooth event execution.',
					'Possess excellent communication and teamwork abilities to collaborate effectively.'
				]
			},
			'Describe an event you would love DSCubed to run. How would you make it happen?'
		),
		// Marketing is split into two teams: Graphics (posters and design) and Media (reels and short-form content).
		role(
			'graphics',
			'Graphics',
			'Design the posters, social media graphics and campaign artwork that shape the club’s public image.',
			{
				intro: SKILLS,
				points: [
					'Being highly creative, bringing fresh ideas to every design.',
					'Excellent communication and collaboration skills.',
					'Experience with design tools such as Figma, Canva or Adobe.'
				]
			},
			'Pick a recent DSCubed poster or post. What would you change to make it stand out, and why?'
		),
		role(
			'media',
			'Media',
			'Run the club’s social media, create reels and short-form content, and write the club’s newsletter.',
			{
				intro: SKILLS,
				points: [
					'Being highly creative, bringing fresh ideas to content creation.',
					'Excellent communication and collaboration skills.',
					'Strong writing skills, particularly for newsletters and social media content.'
				]
			},
			'Pitch a 30-second reel for a DSCubed event. What would you film, and how would you hook viewers in the first few seconds?'
		),
		role(
			'hr',
			'HR',
			'Look after the club’s internal culture, from recruitment and committee morale to end-of-year handovers.',
			{
				intro: SKILLS,
				points: [
					'Communication and mediation between all club members.',
					'Handling disputes with empathy and discretion, and understanding multiple perspectives.',
					'A knack for planning social events.'
				]
			},
			'How would you help a new committee member feel part of the team in their first month?'
		),
		role(
			'industry',
			'Industry',
			'Build long-standing relationships with our sponsors and keep them engaged with club events.',
			{
				intro: WHO,
				points: [
					'Possess strong communication skills.',
					'Have great writing skills that can be applied in a professional environment.',
					'Are committed to attending relevant industry events.'
				]
			},
			'Which company would you most like DSCubed to partner with, and what would you pitch them?'
		),
		role(
			'education',
			'Education',
			'Develop and deliver tutorials, workshops and study materials that build members’ data science skills.',
			{
				intro: WHO,
				points: [
					'Have a strong general technical foundation and a passion for data science.',
					'Are hardworking, motivated and eager to take on challenges.',
					'Can effectively teach and communicate complex concepts in a clear, engaging manner.'
				]
			},
			'Outline a 1-hour workshop you could run for first-year data science students.'
		),
		role(
			'products',
			'Products',
			'Build and improve the tech behind DSCubed, from our website to the Visualiser and student projects.',
			{
				intro: WHO,
				points: [
					'Have programming experience, through coursework or personal projects.',
					'Enjoy learning new tools and frameworks.',
					'Work well in a team and communicate their progress clearly.'
				]
			},
			'Tell us about something you have built. What would you do differently next time?'
		)
	]
} satisfies RecruitmentConfig;
