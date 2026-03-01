import type { Page } from '@playwright/test';

export const TEST_ADMIN = {
  email: 'admin@e2e.test',
  password: 'testpassword123',
};

export const TEST_MEMBER = {
  email: 'member@e2e.test',
  password: 'testpassword123',
};

export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('#email-address').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /đăng nhập/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

export async function registerViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByText(/chưa có tài khoản/i).click();
  await page.locator('#email-address').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.getByRole('button', { name: /tạo tài khoản/i }).click();
}

export async function waitForDashboard(page: Page) {
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}
