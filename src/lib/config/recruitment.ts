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
	roles: [
		// id, name, description
		placeholderRole('products', 'Products', 'Build the software and data products DSCubed runs.'),
		placeholderRole('education', 'Education', 'Design and teach DSCubed workshops.'),
		placeholderRole('industry', 'Industry', 'Build partnerships with sponsors and industry.'),
		placeholderRole('events', 'Events', "Plan and run DSCubed's workshops and socials."),
		placeholderRole('hr', 'HR', 'Look after committee recruitment, onboarding and culture.'),
		placeholderRole('marketing', 'Marketing', "Promote DSCubed's events and grow its audience."),
		placeholderRole('media', 'Media', 'Create photos, videos and graphics for DSCubed.')
	]
} satisfies RecruitmentConfig;
