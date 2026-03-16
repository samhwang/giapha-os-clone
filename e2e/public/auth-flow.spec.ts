import { expect, test } from '@playwright/test';
import { waitForHydration } from '../fixtures';

test.describe('Authentication Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible();
  });

  test('should toggle to signup mode', async ({ page }) => {
    await page.goto('/login');
    await waitForHydration(page);
    await page.getByRole('button', { name: /chưa có tài khoản/i }).click();

    await expect(page.locator('#confirmPassword')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /tạo tài khoản/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await waitForHydration(page);
    await page.locator('#email').fill('invalid@test.com');
    await page.locator('#password').fill('wrongpassword');
    await page.getByRole('button', { name: /đăng nhập/i }).click();

    await expect(page.getByText(/thất bại|invalid|error|lỗi/i)).toBeVisible({ timeout: 10000 });
  });

  test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
