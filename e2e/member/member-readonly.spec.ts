import { expect, test } from '@playwright/test';
import { waitForHydration } from '../fixtures';

test.describe('Member Read-Only Access', () => {
  test('should view dashboard as member', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /gia phả os/i })).toBeVisible({ timeout: 15000 });
  });

  test('should not be able to create a member as non-admin', async ({ page }) => {
    await page.goto('/dashboard/members/new');
    await waitForHydration(page, '#gender');

    await page.locator('#fullName').fill('E2E Should Fail');
    await page.locator('#gender').selectOption('female');
    await page.getByRole('button', { name: /thêm thành viên/i }).click();

    // Member role cannot create — should show authorization error
    await expect(page.getByText(/quyền biên tập|editorOnly/i)).toBeVisible({ timeout: 10000 });
  });

  test('should not see private details section as member', async ({ page }) => {
    // Navigate to member list and click a member card to open detail modal
    await page.goto('/dashboard/members');
    await waitForHydration(page);

    const firstMemberCard = page.getByRole('button', { name: /Vạn Công Gốc/ });
    await expect(firstMemberCard).toBeVisible({ timeout: 15000 });
    await firstMemberCard.click();

    // Wait for modal content to load (loading spinner disappears)
    await expect(page.locator('.animate-spin')).toBeHidden({ timeout: 15000 });

    // Private details should show restricted message in modal
    await expect(page.getByText(/chỉ hiển thị với quản trị viên/i)).toBeVisible({ timeout: 15000 });
  });
});
