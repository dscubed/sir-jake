import type { RecruitmentConfig, Role } from './types';

/** Descriptions and questions are placeholders from the design handoff until the directors send theirs. */
function placeholderRole(id: string, name: string, description: string, question: string): Role {
	return {
		id,
		name,
		description,
		responsibilities: ['TBD'],
		question: { id: `${id}_q`, label: question }
	};
}

export const recruitment = {
	cycle: '2027-S1',
	opensAt: 'TBD',
	closesAt: 'TBD',
	wordLimit: 200,
	maxResumeBytes: 4 * 1024 * 1024,
	interviews: { groupDate: 'TBD', individualDate: 'TBD' },
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
		// id, name, description, question
		placeholderRole(
			'events',
			'Events',
			'From trivia nights to the Inter-Uni Datathon, you’ll turn ideas into events for hundreds of students!',
			'Describe an event you would love DSCubed to run. How would you make it happen?'
		),
		// Marketing is split into two teams: Graphics (posters and design) and Media (reels and short-form content).
		placeholderRole(
			'graphics',
			'Graphics',
			'Every poster and post students see starts with you. You’ll design the artwork and visual identity that get students through the door and end up all over campus.',
			'Pick a recent DSCubed poster or post. What would you change to make it stand out, and why?'
		),
		placeholderRole(
			'media',
			'Media',
			'Bring DSCubed to life on camera. You’ll script, shoot and edit the reels and short-form videos that show students what the club is really like.',
			'Pitch a 30-second reel for a DSCubed event. What would you film, and how would you hook viewers in the first few seconds?'
		),
		placeholderRole(
			'hr',
			'HR',
			'A great club starts with a committee that enjoys working together. You’ll shape onboarding, culture and recruitment, including the next version of this process.',
			'How would you help a new committee member feel part of the team in their first month?'
		),
		placeholderRole(
			'industry',
			'Industry',
			'You’ll be the link between students and the companies they want to work for, building sponsor relationships and shaping panels and networking nights.',
			'Which company would you most like DSCubed to partner with, and what would you pitch them?'
		),
		placeholderRole(
			'education',
			'Education',
			'Help students learn beyond the syllabus. You’ll design workshops, run study sessions and bring in speakers on data science and AI.',
			'Outline a 1-hour workshop you could run for first-year data science students.'
		),
		placeholderRole(
			'products',
			'Products',
			'Build and improve the tech behind DSCubed, from our website to the Visualiser and student projects, in a small team that ships.',
			'Tell us about something you have built. What would you do differently next time?'
		)
	]
} satisfies RecruitmentConfig;
