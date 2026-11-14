import { describe, expect, it } from 'vitest';
import type { RecruitmentConfig } from '../../src/lib/config/types';
import type { Application } from '../../src/lib/domain/application';
import {
	children,
	chunk,
	plainText,
	properties,
	toZonedIso
} from '../../src/lib/server/notion/pageBuilder';

const config: RecruitmentConfig = {
	cycle: '2027-S1',
	opensAt: '2027-02-20T09:00:00+11:00',
	closesAt: '2027-03-06T23:59:00+11:00',
	wordLimit: 200,
	maxResumeBytes: 4 * 1024 * 1024,
	interviews: { groupDate: 'TBD', individualDate: 'TBD' },
	graduationOptions: ['2028 Sem 2'],
	generalQuestion: { id: 'why_join', label: 'Why do you want to join DSCubed?' },
	roles: [
		{
			id: 'events',
			name: 'Events',
			description: '',
			responsibilities: [],
			question: { id: 'events_q', label: 'Describe an event you would run.' }
		},
		{
			id: 'marketing',
			name: 'Marketing',
			description: '',
			responsibilities: [],
			question: { id: 'marketing_q', label: 'How would you grow our audience?' }
		}
	]
};

const app = (overrides: Partial<Application> = {}): Application => ({
	submissionId: '6f1c2a9e-0000-4000-8000-000000000001',
	fullName: 'Ada Lovelace',
	email: 'ada@student.unimelb.edu.au',
	degree: 'Bachelor of Science',
	graduation: '2028 Sem 2',
	availableGroup: true,
	availableIndividual: false,
	firstPreference: 'events',
	secondPreference: 'marketing',
	responses: {
		general: 'I love data.',
		firstPreference: 'A hackathon.',
		secondPreference: 'More reels.'
	},
	resume: { filename: 'ada-resume.pdf', sizeBytes: 1234, bytes: new Uint8Array() },
	submittedAt: new Date('2027-02-20T01:30:00Z'),
	...overrides
});

describe('properties', () => {
	it('matches the expected payload', () => {
		expect(properties(app(), 'upload-123', config)).toMatchInlineSnapshot(`
			{
			  "Degree": {
			    "rich_text": [
			      {
			        "text": {
			          "content": "Bachelor of Science",
			        },
			        "type": "text",
			      },
			    ],
			  },
			  "Email": {
			    "email": "ada@student.unimelb.edu.au",
			  },
			  "Expected graduation": {
			    "select": {
			      "name": "2028 Sem 2",
			    },
			  },
			  "First preference": {
			    "select": {
			      "name": "Events",
			    },
			  },
			  "Group interview available": {
			    "checkbox": true,
			  },
			  "Individual interview available": {
			    "checkbox": false,
			  },
			  "Name": {
			    "title": [
			      {
			        "text": {
			          "content": "Ada Lovelace",
			        },
			        "type": "text",
			      },
			    ],
			  },
			  "Resume": {
			    "files": [
			      {
			        "file_upload": {
			          "id": "upload-123",
			        },
			        "name": "ada-resume.pdf",
			        "type": "file_upload",
			      },
			    ],
			  },
			  "Second preference": {
			    "select": {
			      "name": "Marketing",
			    },
			  },
			  "Stage": {
			    "status": {
			      "name": "Applied",
			    },
			  },
			  "Submission ID": {
			    "rich_text": [
			      {
			        "text": {
			          "content": "6f1c2a9e-0000-4000-8000-000000000001",
			        },
			        "type": "text",
			      },
			    ],
			  },
			  "Submitted at": {
			    "date": {
			      "start": "2027-02-20T12:30:00+11:00",
			    },
			  },
			}
		`);
	});

	it('uses role names, not ids, for the preferences', () => {
		const props = properties(app(), 'upload-123', config);
		expect(props['First preference']).toEqual({ select: { name: 'Events' } });
		expect(props['Second preference']).toEqual({ select: { name: 'Marketing' } });
	});

	it('throws on an unknown role id', () => {
		expect(() => properties(app({ firstPreference: 'astronaut' }), 'u', config)).toThrow(
			'Unknown role id: astronaut'
		);
	});
});

describe('children', () => {
	it('matches the expected block layout', () => {
		expect(children(app(), config)).toMatchInlineSnapshot(`
			[
			  {
			    "heading_2": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "Application responses",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "heading_3": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "General: Why do you want to join DSCubed?",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "paragraph": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "I love data.",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "heading_3": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "First preference (Events): Describe an event you would run.",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "paragraph": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "A hackathon.",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "heading_3": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "Second preference (Marketing): How would you grow our audience?",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "paragraph": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "More reels.",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "divider": {},
			  },
			  {
			    "heading_2": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "Group interview notes",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "paragraph": {
			      "rich_text": [],
			    },
			  },
			  {
			    "heading_2": {
			      "rich_text": [
			        {
			          "text": {
			            "content": "Individual interview notes",
			          },
			          "type": "text",
			        },
			      ],
			    },
			  },
			  {
			    "paragraph": {
			      "rich_text": [],
			    },
			  },
			]
		`);
	});

	it('puts each answer under its role question, whichever rank the role has', () => {
		const swapped = children(
			app({ firstPreference: 'marketing', secondPreference: 'events' }),
			config
		);
		const headings = swapped
			.filter((b) => 'heading_3' in b)
			.map((b) =>
				'heading_3' in b
					? b.heading_3.rich_text.map((t) => 'text' in t && t.text.content).join('')
					: ''
			);
		expect(headings).toEqual([
			'General: Why do you want to join DSCubed?',
			'First preference (Marketing): How would you grow our audience?',
			'Second preference (Events): Describe an event you would run.'
		]);
	});
});

describe('plainText', () => {
	it('splits a 2,500-character answer into two rich-text objects', () => {
		const result = plainText('a'.repeat(2500));
		expect(result).toHaveLength(2);
		expect(result.map((r) => ('text' in r ? r.text.content.length : 0))).toEqual([2000, 500]);
	});

	it('keeps text of exactly 2,000 characters in one object', () => {
		expect(plainText('a'.repeat(2000))).toHaveLength(1);
	});

	it('sends Markdown and links as literal text with no formatting', () => {
		const input = '**bold** [click](https://evil.example) <script>';
		expect(plainText(input)).toEqual([{ type: 'text', text: { content: input } }]);
	});

	it('gives an empty array for empty text', () => {
		expect(plainText('')).toEqual([]);
	});
});

describe('chunk', () => {
	it('never splits an emoji across two pieces', () => {
		const pieces = chunk('a' + '😀'.repeat(3), 4);
		expect(pieces).toEqual(['a😀', '😀😀']);
		expect(pieces.join('')).toBe('a😀😀😀');
	});
});

describe('toZonedIso', () => {
	it('uses +11:00 during Melbourne daylight saving', () => {
		expect(toZonedIso(new Date('2027-02-20T01:30:00Z'), 'Australia/Melbourne')).toBe(
			'2027-02-20T12:30:00+11:00'
		);
	});

	it('uses +10:00 outside daylight saving', () => {
		expect(toZonedIso(new Date('2027-07-20T01:30:00Z'), 'Australia/Melbourne')).toBe(
			'2027-07-20T11:30:00+10:00'
		);
	});

	it('rolls over to the next day in Melbourne time', () => {
		expect(toZonedIso(new Date('2027-03-01T14:00:00Z'), 'Australia/Melbourne')).toBe(
			'2027-03-02T01:00:00+11:00'
		);
	});

	it('writes UTC as +00:00', () => {
		expect(toZonedIso(new Date('2027-02-20T01:30:00Z'), 'UTC')).toBe('2027-02-20T01:30:00+00:00');
	});
});
