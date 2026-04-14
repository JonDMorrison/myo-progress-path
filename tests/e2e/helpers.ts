import { Page } from '@playwright/test';

export const TEST_PATIENT = {
  email: 'test.patient@myocoach.ca',
  password: 'TestPass2024!',
  patientId: '73cc86e3-8e0e-45be-992e-43c1ed5cf6a2',
};

export const TEST_THERAPIST = {
  email: 'test.therapist@myocoach.ca',
  password: 'TestPass2024!',
  userId: 'b406772c-4550-4ddd-850e-53cb714a0a46',
};

export async function loginAs(page: Page, user: { email: string; password: string }) {
  await page.goto('/auth');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 15000 });
}

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}
