import { expect, test } from '@playwright/test';

test.describe('About Page', () => {
  test('should display about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText(/giới thiệu/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show security section', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText(/bảo mật/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show contact section with GitHub link', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText(/liên hệ/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toBeVisible();
  });

  test('should have back link to homepage', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText(/trang chủ/i)).toBeVisible({ timeout: 10000 });
  });
});
