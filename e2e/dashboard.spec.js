import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('onboarding flow renders', async ({ page }) => {
    await page.goto('http://localhost:5173/onboarding');
    await expect(page.locator('text=primary goal')).toBeVisible();
  });

  test('goal page renders reality engine', async ({ page }) => {
    await page.goto('http://localhost:5173/goal');
    await expect(page.locator('text=goal')).toBeVisible();
  });

  test('dashboard sidebar navigation works', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await expect(page.locator('text=Command Center')).toBeVisible();
  });
});
