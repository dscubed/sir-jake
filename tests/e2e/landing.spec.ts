import { expect, test } from '@playwright/test';
import { AFTER, DURING, seriousA11yViolations } from './helpers';
import { recruitment } from '../../src/lib/config/recruitment';

// The landing page is prerendered, so whether applications are open is worked out in the browser
// from its own clock. Each test sets that clock.

test('while applications are open, the buttons go to the form', async ({ page }) => {
	await page.clock.setFixedTime(new Date(DURING));
	await page.goto('/');

	const hero = page.getByRole('link', { name: 'Apply now' }).first();
	await expect(hero).toBeVisible();
	await hero.click();
	await expect(page).toHaveURL(/\/apply$/);
	await expect(page.getByRole('heading', { name: 'Application Form' })).toBeVisible();
});

test('after applications close, there is nothing to click through to', async ({ page }) => {
	await page.clock.setFixedTime(new Date(AFTER));
	await page.goto('/');

	await expect(page.getByText('Applications closed').first()).toBeVisible();
	await expect(page.getByRole('link', { name: 'Apply now' })).toHaveCount(0);
});

test('shows one card per team in the config', async ({ page }) => {
	await page.goto('/');
	for (const role of recruitment.roles) {
		await expect(page.getByRole('heading', { name: `${role.name} Officers` })).toBeVisible();
	}
});

test('has no serious accessibility issues', async ({ page }) => {
	await page.clock.setFixedTime(new Date(DURING));
	await page.goto('/');
	expect(await seriousA11yViolations(page)).toEqual([]);
});
