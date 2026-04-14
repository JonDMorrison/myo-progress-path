import { test, expect } from '@playwright/test';
import { loginAs, TEST_THERAPIST, waitForPageLoad } from './helpers';

test.describe('Therapist — video and dashboard access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_THERAPIST);
  });

  test('Therapist dashboard loads without permission error', async ({ page }) => {
    await page.goto('/therapist');
    await waitForPageLoad(page);
    await expect(page.getByText("You don't have permission")).not.toBeVisible();
    await expect(page.getByText('Needs Review')).toBeVisible();
  });

  test('Master Patient List loads without error', async ({ page }) => {
    await page.goto('/admin/master');
    await waitForPageLoad(page);
    await expect(page.getByText('Failed to Load Patients')).not.toBeVisible();
    await expect(page.getByText('Test Patient')).toBeVisible({ timeout: 10000 });
  });
});
