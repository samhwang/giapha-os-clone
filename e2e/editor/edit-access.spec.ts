import { expect, test } from '@playwright/test';
import { waitForHydration } from '../fixtures';

test.describe('Editor Access Control', () => {
  test('should allow editor to access member edit page', async ({ page }) => {
    // Create a member first
    await page.goto('/dashboard/members/new');
    await waitForHydration(page, '#fullName');
    const name = `E2E Editor ${Date.now()}`;
    const fullNameInput = page.locator('#fullName');
    await fullNameInput.fill(name);
    await expect(fullNameInput)
      .toHaveValue(name, { timeout: 5000 })
      .catch(async () => {
        await fullNameInput.fill(name);
      });
    await page.locator('#gender').selectOption('male');
    await page.getByRole('button', { name: /thêm thành viên/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/members\/[0-9a-f]{8}-/, { timeout: 15000 });

    // Navigate to edit page
    await page.getByRole('link', { name: /sửa/i }).click();
    await expect(page).toHaveURL(/\/edit/, { timeout: 10000 });

    // Should see the edit form
    await waitForHydration(page, '#fullName');
    await expect(page.locator('#fullName')).toBeVisible();

    // Should NOT see private data fields (phone, occupation, residence)
    await expect(page.locator('#phoneNumber')).not.toBeVisible();
    await expect(page.locator('#occupation')).not.toBeVisible();
    await expect(page.locator('#currentResidence')).not.toBeVisible();
  });

  test('should redirect from admin-only pages', async ({ page }) => {
    // Editor should not access user management
    await page.goto('/dashboard/users');
    await expect(page).not.toHaveURL(/\/dashboard\/users/, { timeout: 10000 });

    // Editor should not access data import/export
    await page.goto('/dashboard/data');
    await expect(page).not.toHaveURL(/\/dashboard\/data/, { timeout: 10000 });
  });
});
