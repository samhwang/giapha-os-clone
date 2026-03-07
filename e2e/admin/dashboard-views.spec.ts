import { expect, test } from '@playwright/test';

test.describe('Dashboard Views', () => {
  test('should display dashboard with member list', async ({ page }) => {
    await page.goto('/dashboard/members');
    await expect(page).toHaveURL(/\/dashboard\/members/);
    await expect(page.getByPlaceholder(/tìm/i)).toBeVisible({ timeout: 15000 });
  });

  test('should switch between list, tree, and mindmap views', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.waitForLoadState('networkidle');

    // List view should be default
    await expect(page.getByText(/danh sách/i)).toBeVisible();

    // Switch to tree view
    await page.getByText(/sơ đồ cây/i).click();
    await expect(page.getByText(/sơ đồ cây/i)).toBeVisible();

    // Switch to mindmap view
    await page.getByText(/mindmap/i).click();
    await expect(page.getByText(/mindmap/i)).toBeVisible();

    // Switch back to list view
    await page.getByText(/danh sách/i).click();
    await expect(page.getByPlaceholder(/tìm/i)).toBeVisible();
  });

  test('should show admin menu items in header', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.waitForLoadState('networkidle');

    // Open the header menu
    const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-down') });
    await menuButton.click();

    // Admin-only items should be visible
    await expect(page.getByText(/quản lý người dùng/i)).toBeVisible();
    await expect(page.getByText(/thứ tự gia phả/i)).toBeVisible();
    await expect(page.getByText(/sao lưu/i)).toBeVisible();

    // Common items
    await expect(page.getByText(/sự kiện/i)).toBeVisible();
    await expect(page.getByText(/tra cứu danh xưng/i)).toBeVisible();
    await expect(page.getByText(/thống kê/i)).toBeVisible();
  });
});
