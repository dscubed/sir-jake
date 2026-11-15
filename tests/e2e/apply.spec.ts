import { expect, test } from '@playwright/test';
import {
	CLOSED_URL,
	fillValidApplication,
	firstRole,
	seriousA11yViolations,
	submit,
	uniqueEmail,
	words
} from './helpers';
import { recruitment } from '../../src/lib/config/recruitment';
import { DRAFT_KEY } from '../../src/lib/apply/draft';

test.describe('application form', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/apply');
		await expect(page.getByRole('heading', { name: 'Application Form' })).toBeVisible();
	});

	test('a complete application shows the success screen', async ({ page }) => {
		await fillValidApplication(page);
		await submit(page);

		await expect(page.getByRole('heading', { name: 'Thanks for applying' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Thanks for applying' })).toBeFocused();
		await expect(page.locator('form#application')).toHaveCount(0);
	});

	test('a second application with the same email is rejected', async ({ page, browser }) => {
		const email = await fillValidApplication(page);
		await submit(page);
		await expect(page.getByRole('heading', { name: 'Thanks for applying' })).toBeVisible();

		// A fresh browser, so there is no draft left over from the first application.
		const second = await browser.newPage();
		await second.goto('/apply');
		await fillValidApplication(second, email.toUpperCase());
		await submit(second);
		await expect(second.getByRole('alert')).toContainText(
			'An application with this email already exists'
		);
		await second.close();
	});

	test('an empty submit lists the problems and focuses the first one', async ({ page }) => {
		await page.getByRole('button', { name: 'Submit application' }).click();

		await expect(page.getByRole('alert')).toContainText('Please fix');
		await expect(page.getByLabel('Full name')).toBeFocused();
		await expect(page.getByText('Select at least one session you can attend')).toBeVisible();
		await expect(page.getByText('Upload your resume as a PDF')).toBeVisible();
	});

	test('a 201-word answer is flagged and blocks submitting', async ({ page }) => {
		await fillValidApplication(page);
		const general = page.locator('[name=answerGeneral]');

		await general.fill(words(200));
		await expect(page.getByText('200 / 200 words')).toBeVisible();

		await general.fill(words(201));
		await expect(page.getByText('201 / 200 words')).toBeVisible();

		await page.getByRole('button', { name: 'Submit application' }).click();
		await expect(page.getByText('Keep your answer to 200 words or fewer')).toBeVisible();
		await expect(general).toBeFocused();
		await expect(page.getByRole('heading', { name: 'Thanks for applying' })).toHaveCount(0);
	});

	test('the same team cannot be picked twice', async ({ page }) => {
		await page.getByLabel('First preference', { exact: true }).selectOption(firstRole.id);
		const secondOptions = page.getByLabel('Second preference', { exact: true }).locator('option');
		await expect(secondOptions).not.toContainText([firstRole.name]);
		await expect(secondOptions).toHaveCount(recruitment.roles.length); // placeholder + the other roles

		// Picking the current second preference as the first clears the second.
		const other = recruitment.roles[1];
		await page.getByLabel('Second preference', { exact: true }).selectOption(other.id);
		await page.getByLabel('First preference', { exact: true }).selectOption(other.id);
		await expect(page.getByLabel('Second preference', { exact: true })).toHaveValue('');
	});

	test('a non-PDF resume is rejected straight away', async ({ page }) => {
		await page.locator('input[name=resume]').setInputFiles({
			name: 'resume.docx',
			mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			buffer: Buffer.from('not a pdf')
		});
		await expect(page.getByText('Your resume must be a PDF')).toBeVisible();
	});

	test('answers come back after a reload', async ({ page }) => {
		const email = uniqueEmail();
		await page.getByLabel('Full name').fill('Grace Hopper');
		await page.getByLabel('Student email').fill(email);
		await page.getByLabel('First preference', { exact: true }).selectOption(firstRole.id);
		await page.locator('[name=answerFirst]').fill('A draft answer.');
		await page.getByLabel(recruitment.interviews.group[1]).check();
		await expect(page.getByText(/Draft saved at/).first()).toBeVisible();
		// Saves are debounced, so wait until the last change (the checkbox) has been written.
		await expect
			.poll(() => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY))
			.toContain(recruitment.interviews.group[1]);

		await page.reload();

		await expect(page.getByLabel('Full name')).toHaveValue('Grace Hopper');
		await expect(page.getByLabel('Student email')).toHaveValue(email);
		await expect(page.getByLabel('First preference', { exact: true })).toHaveValue(firstRole.id);
		await expect(page.locator('[name=answerFirst]')).toHaveValue('A draft answer.');
		await expect(page.getByLabel(recruitment.interviews.group[1])).toBeChecked();
	});

	test('has no serious accessibility issues', async ({ page }) => {
		expect(await seriousA11yViolations(page)).toEqual([]);
	});
});

test.describe('after applications close', () => {
	test('the form is replaced by the closed message', async ({ page }) => {
		await page.goto(`${CLOSED_URL}/apply`);
		await expect(page.getByRole('heading', { name: 'Applications closed' })).toBeVisible();
		await expect(page.locator('form#application')).toHaveCount(0);
	});

	test('a late submission is refused with 403', async ({ request }) => {
		const response = await request.post(`${CLOSED_URL}/apply`, {
			headers: { origin: CLOSED_URL, 'x-sveltekit-action': 'true', accept: 'application/json' },
			multipart: { fullName: 'Late Applicant', email: uniqueEmail() }
		});
		const body = await response.json();
		expect(body.status).toBe(403);
		expect(body.data).toContain('closed');
	});
});
