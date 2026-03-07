import { expect, test } from '@playwright/test';
import { Gender } from '../../src/types';
import { waitForHydration } from '../fixtures';

const TEST_MEMBER_NAME = `E2E Nguyễn Văn Test ${Date.now()}`;

test.describe('Member CRUD', () => {
  test('should create a new member', async ({ page }) => {
    await page.goto('/dashboard/members/new');
    await waitForHydration(page, '#fullName');

    // Fill the form
    await page.locator('#fullName').fill(TEST_MEMBER_NAME);
    await page.locator('#gender').selectOption(Gender.enum.male);

    // Set birth year
    const yearInput = page.locator('input[placeholder="Năm"]').first();
    await yearInput.fill('1990');

    // Submit
    await page.getByRole('button', { name: /thêm thành viên/i }).click();

    // Should redirect to the member detail page
    await expect(page).toHaveURL(/\/dashboard\/members\//, { timeout: 15000 });
    await expect(page.getByText(TEST_MEMBER_NAME)).toBeVisible();
  });

  test('should view member detail page', async ({ page }) => {
    // First create a member
    await page.goto('/dashboard/members/new');
    await waitForHydration(page, '#fullName');
    const memberName = `E2E Detail ${Date.now()}`;
    await page.locator('#fullName').fill(memberName);
    await page.locator('#gender').selectOption(Gender.enum.female);
    await page.getByRole('button', { name: /thêm thành viên/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/members\//, { timeout: 15000 });

    // Verify detail page shows expected sections
    await expect(page.getByText(memberName)).toBeVisible();
    await expect(page.getByText(/gia đình/i)).toBeVisible();
  });

  test('should edit member and see updated data', async ({ page }) => {
    // Create a member first
    await page.goto('/dashboard/members/new');
    await waitForHydration(page, '#fullName');
    const originalName = `E2E Edit ${Date.now()}`;
    await page.locator('#fullName').fill(originalName);
    await page.locator('#gender').selectOption(Gender.enum.male);
    await page.getByRole('button', { name: /thêm thành viên/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/members\//, { timeout: 15000 });

    // Click edit button
    await page.getByText(/chỉnh sửa/i).click();
    await waitForHydration(page, '#fullName');

    // Update the name
    const updatedName = `${originalName} Updated`;
    await page.locator('#fullName').fill(updatedName);
    await page.getByRole('button', { name: /lưu thay đổi/i }).click();

    // Verify the updated name shows
    await expect(page).toHaveURL(/\/dashboard\/members\//, { timeout: 15000 });
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });
  });

  test('should delete standalone member', async ({ page }) => {
    // Create a standalone member (no relationships)
    await page.goto('/dashboard/members/new');
    await waitForHydration(page, '#fullName');
    const deletableName = `E2E Delete ${Date.now()}`;
    await page.locator('#fullName').fill(deletableName);
    await page.locator('#gender').selectOption(Gender.enum.male);
    await page.getByRole('button', { name: /thêm thành viên/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/members\//, { timeout: 15000 });

    // Accept the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Click delete button
    await page.getByRole('button', { name: /xoá hồ sơ/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
  });
});
