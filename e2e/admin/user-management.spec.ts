import { expect, test } from '@playwright/test';
import { waitForHydration } from '../fixtures';

test.describe('User Management', () => {
  test('should display user list', async ({ page }) => {
    await page.goto('/dashboard/users');
    await expect(page.getByText(/quản lý người dùng/i)).toBeVisible({ timeout: 15000 });
    await expect(page.locator('table')).toBeVisible();
  });

  test('should show current admin user in list', async ({ page }) => {
    await page.goto('/dashboard/users');
    await expect(page.getByText('admin@e2e.test')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/bạn/i)).toBeVisible();
  });

  test('should show add user button', async ({ page }) => {
    await page.goto('/dashboard/users');
    await expect(page.getByText(/thêm người dùng/i)).toBeVisible({ timeout: 15000 });
  });

  test('should open create user modal', async ({ page }) => {
    await page.goto('/dashboard/users');
    await waitForHydration(page);
    await page.getByText(/thêm người dùng/i).click();
    await expect(page.getByText(/tạo người dùng mới/i)).toBeVisible();
    await expect(page.locator('#createEmail')).toBeVisible();
    await expect(page.locator('#createPassword')).toBeVisible();
  });

  test('should show action buttons for non-self users', async ({ page }) => {
    await page.goto('/dashboard/users');

    // The member user row should have action buttons
    const memberRow = page.locator('tr', { hasText: 'member@e2e.test' });
    await expect(memberRow).toBeVisible({ timeout: 15000 });
    await expect(memberRow.getByRole('button').first()).toBeVisible();
  });
});
