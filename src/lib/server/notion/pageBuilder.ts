import type {
	BlockObjectRequest,
	CreatePageParameters,
	RichTextItemRequest
} from '@notionhq/client';
import type { RecruitmentConfig, Role } from '#lib/config/types.ts';
import type { Application } from '#lib/domain/application.ts';
import type { FileUploadId } from '#lib/server/ports.ts';
import { MAX_RICH_TEXT_LENGTH, PROP, STAGE_APPLIED, TIME_ZONE } from './properties.ts';

type PageProperties = NonNullable<CreatePageParameters['properties']>;

/** The page's database properties. */
export function properties(
	app: Application,
	resume: FileUploadId,
	config: RecruitmentConfig
): PageProperties {
	return {
		[PROP.name]: { title: plainText(app.fullName) },
		[PROP.email]: { email: app.email },
		[PROP.degree]: { rich_text: plainText(app.degree) },
		[PROP.graduation]: { select: { name: app.graduation } },
		[PROP.availableGroup]: { checkbox: app.availableGroup },
		[PROP.availableIndividual]: { checkbox: app.availableIndividual },
		[PROP.firstPreference]: { select: { name: roleById(config, app.firstPreference).name } },
		[PROP.secondPreference]: { select: { name: roleById(config, app.secondPreference).name } },
		[PROP.resume]: {
			files: [{ type: 'file_upload', file_upload: { id: resume }, name: app.resume.filename }]
		},
		[PROP.submittedAt]: { date: { start: toZonedIso(app.submittedAt, TIME_ZONE) } },
		[PROP.stage]: { status: { name: STAGE_APPLIED } },
		[PROP.submissionId]: { rich_text: plainText(app.submissionId) }
	};
}

/** The page body: the three responses, then empty sections for interview notes. */
export function children(app: Application, config: RecruitmentConfig): BlockObjectRequest[] {
	const first = roleById(config, app.firstPreference);
	const second = roleById(config, app.secondPreference);

	return [
		heading2('Application responses'),
		heading3(`General: ${config.generalQuestion.label}`),
		paragraph(app.responses.general),
		heading3(`First preference (${first.name}): ${first.question.label}`),
		paragraph(app.responses.firstPreference),
		heading3(`Second preference (${second.name}): ${second.question.label}`),
		paragraph(app.responses.secondPreference),
		{ divider: {} },
		heading2('Group interview notes'),
		paragraph(''),
		heading2('Individual interview notes'),
		paragraph('')
	];
}

/**
 * Plain-text rich text with no formatting or links, so applicant inputs can never change how the
 * page looks. Long text is split into several objects to stay under Notion's per-object limit.
 */
export function plainText(text: string): RichTextItemRequest[] {
	return chunk(text, MAX_RICH_TEXT_LENGTH).map((content) => ({ type: 'text', text: { content } }));
}

/**
 * Splits text into pieces of at most `max` UTF-16 code units without breaking a character that
 * is made of two code units (such as an emoji). Empty text gives no pieces.
 */
export function chunk(text: string, max: number): string[] {
	const pieces: string[] = [];
	let current = '';
	for (const char of text) {
		if (current.length + char.length > max) {
			pieces.push(current);
			current = '';
		}
		current += char;
	}
	if (current) pieces.push(current);
	return pieces;
}

/** Formats a date as ISO 8601 in the given time zone with its offset, e.g. 2027-02-20T09:00:00+11:00. */
export function toZonedIso(date: Date, timeZone: string): string {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-AU', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hourCycle: 'h23',
			timeZoneName: 'longOffset'
		})
			.formatToParts(date)
			.map((p) => [p.type, p.value])
	);
	const offset = parts.timeZoneName === 'GMT' ? '+00:00' : parts.timeZoneName.replace('GMT', '');
	return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

function roleById(config: RecruitmentConfig, id: string): Role {
	const role = config.roles.find((r) => r.id === id);
	if (!role) throw new Error(`Unknown role id: ${id}`);
	return role;
}

const heading2 = (text: string): BlockObjectRequest => ({
	heading_2: { rich_text: plainText(text) }
});

const heading3 = (text: string): BlockObjectRequest => ({
	heading_3: { rich_text: plainText(text) }
});

const paragraph = (text: string): BlockObjectRequest => ({
	paragraph: { rich_text: plainText(text) }
});
