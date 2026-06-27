import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('landing page loads', async ({ page }) => {
    await expect(page.locator('text=AI Co-Founder')).toBeVisible();
    await expect(page.locator('text=Get Started')).toBeVisible();
  });

  test('navigate to auth page', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('login form is visible', async ({ page }) => {
    await page.goto('http://localhost:5173/auth');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('shows error on invalid login', async ({ page }) => {
    await page.goto('http://localhost:5173/auth');
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=error')).toBeVisible({ timeout: 10000 });
  });
});
