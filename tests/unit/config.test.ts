import { describe, expect, it } from 'vitest';
import { recruitment } from '../../src/lib/config/recruitment';
import { configProblems } from '../../src/lib/config/validate';
import type { RecruitmentConfig, Role } from '../../src/lib/config/types';

const role = (id: string, name: string): Role => ({
	id,
	name,
	description: 'd',
	lookingFor: { intro: '', points: [] },
	question: { id: `${id}_q`, label: 'q' }
});

const withRoles = (roles: Role[]): RecruitmentConfig => ({ ...recruitment, roles });

describe('recruitment config', () => {
	it('has no problems', () => {
		expect(configProblems(recruitment)).toEqual([]);
	});

	it('gives every role a question id distinct from the general question', () => {
		const ids = [recruitment.generalQuestion.id, ...recruitment.roles.map((r) => r.question.id)];
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('configProblems', () => {
	it('rejects fewer than two roles', () => {
		expect(configProblems(withRoles([role('a', 'A')]))).toContain(
			'There must be at least two roles (FR3).'
		);
	});

	it('rejects duplicate role ids', () => {
		expect(configProblems(withRoles([role('a', 'A'), role('a', 'B')]))).toEqual([
			'Duplicate role id: a'
		]);
	});

	it('rejects duplicate role names', () => {
		expect(configProblems(withRoles([role('a', 'A'), role('b', 'A')]))).toEqual([
			'Duplicate role name: A'
		]);
	});

	it('accepts two distinct roles', () => {
		expect(configProblems(withRoles([role('a', 'A'), role('b', 'B')]))).toEqual([]);
	});
});
