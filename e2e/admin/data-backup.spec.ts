import { expect, test } from '@playwright/test';

test.describe('Data Backup & Restore', () => {
  test('should display backup and restore sections', async ({ page }) => {
    await page.goto('/dashboard/data');
    await expect(page.getByText(/sao lưu dữ liệu/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/phục hồi dữ liệu/i)).toBeVisible();
  });

  test('should show download backup button', async ({ page }) => {
    await page.goto('/dashboard/data');
    await expect(page.getByText(/tải xuống bản sao lưu/i)).toBeVisible({ timeout: 15000 });
  });

  test('should show restore file selector', async ({ page }) => {
    await page.goto('/dashboard/data');
    await expect(page.getByText(/chọn file.*phục hồi/i)).toBeVisible({ timeout: 15000 });
  });

  test('should show restore warning', async ({ page }) => {
    await page.goto('/dashboard/data');
    await expect(page.getByText(/xoá toàn bộ/i)).toBeVisible({ timeout: 15000 });
  });
});
