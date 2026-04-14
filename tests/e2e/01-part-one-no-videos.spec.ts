import { test, expect } from '@playwright/test';
import { loginAs, TEST_PATIENT, waitForPageLoad } from './helpers';

test.describe('Part One — no video requirement', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_PATIENT);
  });

  test('Week 1 does not show video upload section', async ({ page }) => {
    await page.goto('/week/1');
    await waitForPageLoad(page);
    await expect(page.getByText('First Attempt').first()).not.toBeVisible();
    await expect(page.getByText('Last Attempt').first()).not.toBeVisible();
  });

  test('Week 1 checklist does not include video items', async ({ page }) => {
    await page.goto('/week/1');
    await waitForPageLoad(page);
    await expect(page.getByText('First attempt videos submitted')).not.toBeVisible();
    await expect(page.getByText('Last attempt videos submitted')).not.toBeVisible();
  });

  test('Week 1 does not show submit button', async ({ page }) => {
    await page.goto('/week/1');
    await waitForPageLoad(page);
    await expect(page.getByText('SUBMIT FOR REVIEW')).not.toBeVisible();
  });

  test('Week 2 shows video upload section', async ({ page }) => {
    await page.goto('/week/2');
    await waitForPageLoad(page);
    const pageText = await page.textContent('body');
    const hasVideoUI = pageText?.includes('First Attempt') || pageText?.includes('Upload') || pageText?.includes('first attempt');
    expect(hasVideoUI).toBeTruthy();
  });
});
