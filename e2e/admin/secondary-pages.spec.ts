import { expect, test } from '@playwright/test';

test.describe('Secondary Pages', () => {
  test('should display statistics page', async ({ page }) => {
    await page.goto('/dashboard/stats');
    await expect(page.getByText(/thống kê/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/tổng thành viên/i)).toBeVisible();
  });

  test('should display events page', async ({ page }) => {
    await page.goto('/dashboard/events');
    await expect(page.getByText(/sự kiện/i)).toBeVisible({ timeout: 15000 });
  });

  test('should display kinship finder page', async ({ page }) => {
    await page.goto('/dashboard/kinship');
    await expect(page.getByText(/tra cứu/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/chọn thành viên/i)).toBeVisible();
  });

  test('should display lineage management page', async ({ page }) => {
    await page.goto('/dashboard/lineage');
    await expect(page.getByText(/thế hệ/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/tính toán/i)).toBeVisible();
  });
});
