import { test, expect } from '@playwright/test';

test.describe('AI Engines', () => {
  test('research center loads', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('ai-cofounder-auth-storage', JSON.stringify({
        state: { user: { id: 'test', name: 'Test' }, token: 'test-token' }
      }));
    });
    await page.goto('http://localhost:5173/dashboard');
    await expect(page.locator('text=Research Center')).toBeVisible();
  });

  test('execution mode shows input', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('ai-cofounder-auth-storage', JSON.stringify({
        state: { user: { id: 'test', name: 'Test' }, token: 'test-token' }
      }));
    });
    await page.goto('http://localhost:5173/dashboard');
    await expect(page.locator('text=Execution Mode')).toBeVisible();
  });

  test('memory graph renders', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('ai-cofounder-auth-storage', JSON.stringify({
        state: { user: { id: 'test', name: 'Test' }, token: 'test-token' }
      }));
    });
    await page.goto('http://localhost:5173/dashboard');
    await expect(page.locator('text=Memory Graph')).toBeVisible();
  });
});
