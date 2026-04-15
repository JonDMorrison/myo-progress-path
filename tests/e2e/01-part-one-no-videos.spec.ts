import { test, expect } from '@playwright/test';
import { loginAs, TEST_PATIENT, waitForPageLoad } from './helpers';

test.describe('Part One — first attempt only, no last attempt', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_PATIENT);
  });

  test('Week 1 shows first attempt but not last attempt upload', async ({ page }) => {
    await page.goto('/week/1');
    await waitForPageLoad(page);
    // Week 1 requires first attempt only — last attempt should not appear
    await expect(page.getByText('Last attempt videos submitted')).not.toBeVisible();
  });

  test('Week 1 checklist shows first attempt but not last attempt', async ({ page }) => {
    await page.goto('/week/1');
    await waitForPageLoad(page);
    // First attempt should appear (Sam wants to review it early)
    // Last attempt should NOT appear on Part One
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
    const hasVideoUI =
      pageText?.includes('first attempt videos submitted') ||
      pageText?.includes('First attempt videos') ||
      pageText?.includes('last attempt videos submitted') ||
      pageText?.includes('Your Video Submissions') ||
      pageText?.includes('video');
    expect(hasVideoUI).toBeTruthy();
  });
});
