import { expect, test } from '@playwright/test';

test.describe('Member Read-Only Access', () => {
  test('should view dashboard as member', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByPlaceholder(/tìm/i)).toBeVisible({ timeout: 15000 });
  });

  test('should be able to create a member as non-admin', async ({ page }) => {
    await page.goto('/dashboard/members/new');

    // Member can still add members (without private info)
    const name = `E2E Member Created ${Date.now()}`;
    await page.locator('#fullName').fill(name);
    await page.locator('#gender').selectOption('female');
    await page.getByRole('button', { name: /thêm thành viên/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/members\//, { timeout: 15000 });
    await expect(page.getByText(name)).toBeVisible();
  });

  test('should not see private details section as member', async ({ page }) => {
    // Create a member first
    await page.goto('/dashboard/members/new');
    const name = `E2E Private ${Date.now()}`;
    await page.locator('#fullName').fill(name);
    await page.locator('#gender').selectOption('male');
    await page.getByRole('button', { name: /thêm thành viên/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/members\//, { timeout: 15000 });

    // Private details should show restricted message
    await expect(page.getByText(/chỉ hiển thị với quản trị viên/i)).toBeVisible({ timeout: 10000 });
  });
});
