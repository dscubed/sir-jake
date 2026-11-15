import { createRequire } from 'node:module';
import { expect, type Page } from '@playwright/test';
import { recruitment } from '../../src/lib/config/recruitment';

/** Times inside and after the application window in `recruitment.ts`. */
export const DURING = '2027-03-01T12:00:00+11:00';
export const AFTER = '2027-03-08T12:00:00+11:00';

/** The preview server whose clock is after closing. The default `baseURL` is inside the window. */
export const CLOSED_URL = 'http://localhost:4174';

export const [firstRole, secondRole] = recruitment.roles;

/** A tiny file that passes both the type check and the server's `%PDF-` signature check. */
export const pdf = {
	name: 'resume.pdf',
	mimeType: 'application/pdf',
	buffer: Buffer.from('%PDF-1.4\n%%EOF\n')
};

/** A new address each time, because the fake repository keeps every application per server. */
export const uniqueEmail = () =>
	`e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@student.unimelb.edu.au`;

export const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ');

/** Fills every field with valid answers. */
export async function fillValidApplication(page: Page, email = uniqueEmail()) {
	await page.getByLabel('Full name').fill('Ada Lovelace');
	await page.getByLabel('Student email').fill(email);
	await page.getByLabel('Degree').fill('Bachelor of Science');
	await page.getByLabel('Expected graduation').selectOption(recruitment.graduationOptions[2]);
	await page.getByLabel('First preference', { exact: true }).selectOption(firstRole.id);
	await page.getByLabel('Second preference', { exact: true }).selectOption(secondRole.id);
	await page.locator('[name=answerGeneral]').fill('I love working with data.');
	await page.locator('[name=answerFirst]').fill('I would run a datathon.');
	await page.locator('[name=answerSecond]').fill('I would help with the designs.');
	await page.locator('input[name=resume]').setInputFiles(pdf);
	await page.getByLabel(recruitment.interviews.group[0]).check();
	await page.getByLabel(recruitment.interviews.individual[1]).check();
	return email;
}

/** Waits for the Turnstile test widget to hand over its token, then submits. */
export async function submit(page: Page) {
	await expect(page.locator('input[name="cf-turnstile-response"]')).not.toHaveValue('', {
		timeout: 15_000
	});
	await page.getByRole('button', { name: 'Submit application' }).click();
}

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

/** Runs axe on the current page and returns the serious and critical violations. */
export async function seriousA11yViolations(page: Page) {
	await page.addScriptTag({ path: axePath });
	const violations = await page.evaluate(async () => {
		// @ts-expect-error axe is added to the page by the script tag above.
		const result = await window.axe.run(document, { resultTypes: ['violations'] });
		return result.violations as {
			id: string;
			impact: string | null;
			help: string;
			nodes: { target: string[] }[];
		}[];
	});
	return violations
		.filter((v) => v.impact === 'serious' || v.impact === 'critical')
		.map((v) => ({ id: v.id, help: v.help, targets: v.nodes.map((n) => n.target.join(' ')) }));
}
