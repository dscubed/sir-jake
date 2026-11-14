import type { RecruitmentConfig } from '#lib/config/types.ts';
import { ApplicationService, type SubmissionLog } from './applicationService.ts';
import { FakeApplicantRepository } from './fakeRepository.ts';
import { createNotionClient, NotionApplicantRepository } from './notion/repository.ts';
import { systemClock, type ApplicantRepository, type Clock } from './ports.ts';
import { TurnstileVerifier } from './turnstile.ts';

export interface ServerEnv {
	APPLICANT_REPO?: 'fake' | 'notion';
	NOTION_TOKEN?: string;
	NOTION_DATA_SOURCE_ID?: string;
	NOTION_TEST_DATA_SOURCE_ID?: string;
	TURNSTILE_SECRET_KEY: string;
	FAKE_NOW?: Date;
	VERCEL_ENV?: string;
}

export interface Container {
	service: ApplicationService;
	clock: Clock;
	repoKind: 'fake' | 'notion';
	/** Which Notion database is in use, for the startup log. */
	database?: 'production' | 'test';
}

/**
 * Builds the application service from the environment. Fails loudly on a setting that would make
 * production lose or misplace applications, rather than starting in a broken state.
 *
 * Only production writes to the real Notion database. Every other environment (local, preview)
 * uses the TEST database, so development can never touch real applications.
 */
export function createContainer(
	env: ServerEnv,
	config: RecruitmentConfig,
	options: { log?: (entry: SubmissionLog) => void } = {}
): Container {
	const production = env.VERCEL_ENV === 'production';
	const repoKind = env.APPLICANT_REPO ?? (production ? 'notion' : 'fake');

	if (production && repoKind === 'fake') {
		throw new Error('APPLICANT_REPO=fake is not allowed in production');
	}

	let repo: ApplicantRepository;
	let database: Container['database'];
	if (repoKind === 'notion') {
		const name = production ? 'NOTION_DATA_SOURCE_ID' : 'NOTION_TEST_DATA_SOURCE_ID';
		const dataSourceId = env[name];
		if (!env.NOTION_TOKEN) throw new Error('NOTION_TOKEN is required when APPLICANT_REPO=notion');
		if (!dataSourceId) throw new Error(`${name} is required when APPLICANT_REPO=notion`);
		repo = new NotionApplicantRepository({
			client: createNotionClient(env.NOTION_TOKEN),
			dataSourceId,
			config
		});
		database = production ? 'production' : 'test';
	} else {
		repo = new FakeApplicantRepository();
	}

	const clock: Clock =
		env.FAKE_NOW && !production ? { now: () => new Date(env.FAKE_NOW!) } : systemClock;

	const service = new ApplicationService({
		repo,
		captcha: new TurnstileVerifier({ secretKey: env.TURNSTILE_SECRET_KEY }),
		clock,
		config,
		log: options.log
	});

	return { service, clock, repoKind, database };
}
