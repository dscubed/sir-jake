import type { RecruitmentConfig, Role } from './types';

function placeholderRole(id: string, name: string, description: string): Role {
	return {
		id,
		name,
		description,
		responsibilities: ['TBD'],
		question: { id: `${id}_q`, label: `TBD (from ${name} director)` }
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
	generalQuestion: { id: 'why_join', label: 'Why do you want to join DSCubed?' },
	// Order and descriptions follow the design handoff (placeholder copy until step 4.3).
	roles: [
		// id, name, description
		placeholderRole(
			'events',
			'Events',
			'From game show nights to the Inter-Uni Datathon, you’ll turn ideas into events hundreds of students show up for, and be there on the night making it happen.'
		),
		placeholderRole(
			'marketing',
			'Marketing',
			'Every poster, reel and post students see starts with you. You’ll design, write and experiment to get more students through the door.'
		),
		placeholderRole(
			'hr',
			'HR',
			'A great club starts with a committee that enjoys working together. You’ll shape onboarding, culture and recruitment, including the next version of this process.'
		),
		placeholderRole(
			'industry',
			'Industry',
			'You’ll be the link between students and the companies they want to work for, building sponsor relationships and shaping panels and networking nights.'
		),
		placeholderRole(
			'education',
			'Education',
			'Help students learn beyond the syllabus. You’ll design workshops, run study sessions and bring in speakers on data science and AI.'
		),
		placeholderRole(
			'products',
			'Products',
			'Build and improve the tech behind DSCubed, from our website to the Visualiser and student projects, in a small team that ships.'
		),
		// Not in the design handoff, which lists six teams. Kept until the committee confirms.
		placeholderRole('media', 'Media', 'Create photos, videos and graphics for DSCubed.')
	]
} satisfies RecruitmentConfig;
