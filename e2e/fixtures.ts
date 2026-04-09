import type { Page } from "@playwright/test";

/**
 * Wait for React hydration to complete on TanStack Start SSR pages.
 * Polls until a target element has React fiber keys attached.
 */
export async function waitForHydration(page: Page, selector = "button") {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      return Object.keys(el).some((k) => k.startsWith("__reactFiber"));
    },
    selector,
    { timeout: 15000 },
  );
}

export const TEST_ADMIN = {
  email: "admin@e2e.test",
  password: "testpassword123",
};

export const TEST_EDITOR = {
  email: "editor@e2e.test",
  password: "testpassword123",
};

export const TEST_MEMBER = {
  email: "member@e2e.test",
  password: "testpassword123",
};

export const TEST_PERSON = {
  fullName: "E2E Nguyễn Văn Test",
  gender: "male" as const,
  birthYear: 1960,
};

export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto("/login");
  await waitForHydration(page);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

export async function registerViaUI(page: Page, email: string, password: string) {
  await page.goto("/login");
  await waitForHydration(page);
  await page.getByRole("button", { name: /chưa có tài khoản/i }).click();
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("#confirmPassword").fill(password);
  await page.getByRole("button", { name: /tạo tài khoản/i }).click();
}

export async function waitForDashboard(page: Page) {
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}
