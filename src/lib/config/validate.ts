import type { RecruitmentConfig } from './types';

export function configProblems(config: RecruitmentConfig): string[] {
	const problems: string[] = [];

	if (config.roles.length < 2) problems.push('There must be at least two roles (FR3).');

	const ids = config.roles.map((r) => r.id);
	const names = config.roles.map((r) => r.name);
	for (const id of duplicates(ids)) problems.push(`Duplicate role id: ${id}`);
	for (const name of duplicates(names)) problems.push(`Duplicate role name: ${name}`);

	return problems;
}

function duplicates(values: string[]): string[] {
	return [...new Set(values.filter((v, i) => values.indexOf(v) !== i))];
}
