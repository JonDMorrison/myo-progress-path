import { test, expect } from '@playwright/test';
import { loginAs, TEST_PATIENT, waitForPageLoad } from './helpers';

test.describe('Module submission UX', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_PATIENT);
  });

  test('Patient dashboard loads correctly', async ({ page }) => {
    await page.goto('/patient');
    await waitForPageLoad(page);
    await expect(page.getByText('Module')).toBeVisible({ timeout: 10000 });
  });

  test('Week 1 shows Part Two navigation not submit button', async ({ page }) => {
    await page.goto('/week/1');
    await waitForPageLoad(page);
    await expect(page.getByText('SUBMIT FOR REVIEW')).not.toBeVisible();
    const pageText = await page.textContent('body');
    expect(pageText?.includes('Start Part Two') || pageText?.includes('Part Two') || pageText?.includes('Module Progress')).toBeTruthy();
  });

  test('Badges section shows X of 10 earned', async ({ page }) => {
    await page.goto('/patient');
    await waitForPageLoad(page);
    const pageText = await page.textContent('body');
    expect(pageText).toContain('of 10 earned');
  });
});
