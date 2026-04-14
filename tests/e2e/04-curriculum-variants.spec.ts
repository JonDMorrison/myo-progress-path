import { test, expect } from '@playwright/test';
import { loginAs, TEST_THERAPIST, waitForPageLoad } from './helpers';

test.describe('Curriculum variant routing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_THERAPIST);
  });

  test('Non-surgical Module 4 shows non-surgical exercises', async ({ page }) => {
    await page.goto('/week/7?variant=non_frenectomy');
    await waitForPageLoad(page);
    const pageText = await page.textContent('body');
    const hasCorrect = pageText?.includes('Perfect Bowl') || pageText?.includes('Lip Pops') || pageText?.includes('Teeth Trace');
    expect(hasCorrect).toBeTruthy();
    expect(pageText).not.toContain('Forklift Stretch');
  });

  test('Non-surgical Module 5 does not show post-op recovery', async ({ page }) => {
    await page.goto('/week/9?variant=non_frenectomy');
    await waitForPageLoad(page);
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('Post-Frenectomy Recovery');
    expect(pageText).not.toContain('Recovery Phase 1');
    const hasCorrect = pageText?.includes('Pickle Tongue') || pageText?.includes('Smile Swallows');
    expect(hasCorrect).toBeTruthy();
  });

  test('Module 14 frenectomy shows congratulations text', async ({ page }) => {
    await page.goto('/week/25?variant=frenectomy');
    await waitForPageLoad(page);
    const pageText = await page.textContent('body');
    expect(pageText?.includes('Congratulations') || pageText?.includes('completed') || pageText?.includes('24 week')).toBeTruthy();
  });

  test('Frenectomy Module 1 shows Regular and Modified video tabs', async ({ page }) => {
    await page.goto('/week/1?variant=frenectomy');
    await waitForPageLoad(page);
    // Click first exercise to expand it (tabs only show when expanded)
    await page.locator('[class*="exercise"], [class*="Exercise"]').first().click();
    await page.waitForTimeout(500);
    const pageText = await page.textContent('body');
    expect(pageText?.includes('Regular') || pageText?.includes('Modified')).toBeTruthy();
  });
});
