import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have login link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /login|đăng nhập/i })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: /login|đăng nhập/i }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });
});
