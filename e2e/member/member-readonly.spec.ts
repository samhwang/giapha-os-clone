import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { SEED_DATA_PATH, type SeedData } from '../e2e-seed-data';
import { waitForHydration } from '../fixtures';

function getSeedData(): SeedData {
  return JSON.parse(readFileSync(SEED_DATA_PATH, 'utf-8'));
}

test.describe('Member Read-Only Access', () => {
  test('should view dashboard as member', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('header h1')).toBeVisible({ timeout: 15000 });
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
    // Navigate to member list and click the e2e-seeded person card
    await page.goto('/dashboard/members');
    await waitForHydration(page);

    const { personName } = getSeedData();
    const personCard = page.getByRole('button', { name: new RegExp(personName) });
    await expect(personCard).toBeVisible({ timeout: 15000 });
    await personCard.click();

    // Wait for modal content to fully load and animate in.
    // As a non-admin member, the private details section shows a restricted message.
    await expect(page.getByText(/chỉ hiển thị với quản trị viên/i)).toBeVisible({ timeout: 30000 });
  });
});
