import { expect, test } from '@playwright/test';

import { waitForHydration } from '../fixtures';

test.describe('Dashboard Views', () => {
  test('should display dashboard with member list', async ({ page }) => {
    await page.goto('/dashboard/members');
    await waitForHydration(page);
    await expect(page).toHaveURL(/\/dashboard\/members/);
    await expect(page.getByPlaceholder(/tìm/i)).toBeVisible({ timeout: 15000 });
  });

  test('should switch between list, tree, mindmap, and bubble views', async ({ page }) => {
    await page.goto('/dashboard/members');
    await waitForHydration(page);

    // List view should be default
    await expect(page.getByText(/danh sách/i)).toBeVisible();

    // Switch to tree view
    await page.getByText(/sơ đồ cây/i).click();
    await expect(page.getByText(/sơ đồ cây/i)).toBeVisible();

    // Switch to mindmap view
    await page.getByText(/mindmap/i).click();
    await expect(page.getByText(/mindmap/i)).toBeVisible();

    // Switch to bubble map view
    await page.getByRole('button', { name: /bubble/i }).click();
    // Bubble map renders a full-size SVG in a container
    await expect(page.locator('svg.w-full.h-full')).toBeVisible({ timeout: 10000 });

    // Switch back to list view
    await page.getByText(/danh sách/i).click();
    await expect(page.getByPlaceholder(/tìm/i)).toBeVisible();
  });

  test('should show collapse buttons in tree view', async ({ page }) => {
    await page.goto('/dashboard/members');
    await waitForHydration(page);

    // Switch to tree view
    await page.getByText(/sơ đồ cây/i).click();

    // Center button should be visible
    const centerButton = page.locator('button').filter({ has: page.locator('svg.lucide-crosshair') });
    await expect(centerButton).toBeVisible({ timeout: 10000 });
  });

  test('should show admin menu items in header', async ({ page }) => {
    await page.goto('/dashboard/members');
    await waitForHydration(page);

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
