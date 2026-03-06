import { expect, test } from '@playwright/test';
import { waitForHydration } from '../fixtures';

test.describe('Member Access Control', () => {
  test('should redirect from admin user management to dashboard', async ({ page }) => {
    await page.goto('/dashboard/users');
    // Member role should be redirected away from admin pages
    await expect(page).not.toHaveURL(/\/dashboard\/users/, { timeout: 10000 });
  });

  test('should redirect from admin data page to dashboard', async ({ page }) => {
    await page.goto('/dashboard/data');
    await expect(page).not.toHaveURL(/\/dashboard\/data/, { timeout: 10000 });
  });

  test('should redirect from admin lineage page to dashboard', async ({ page }) => {
    await page.goto('/dashboard/lineage');
    await expect(page).not.toHaveURL(/\/dashboard\/lineage/, { timeout: 10000 });
  });

  test('should not show admin menu items in header', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForHydration(page);

    // Open menu
    const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-down') });
    await menuButton.click();

    // Admin items should NOT be visible
    await expect(page.getByText(/quản lý người dùng/i)).not.toBeVisible();
    await expect(page.getByText(/thứ tự gia phả/i)).not.toBeVisible();

    // Common items SHOULD be visible in the menu
    const menu = page.locator('[class*="absolute"]').filter({ hasText: /tài khoản/i });
    await expect(menu.getByRole('link', { name: /sự kiện/i })).toBeVisible();
    await expect(menu.getByRole('link', { name: /tra cứu danh xưng/i })).toBeVisible();
  });
});
