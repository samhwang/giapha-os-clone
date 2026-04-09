import { expect, test } from "@playwright/test";

import { waitForHydration } from "../fixtures";

test.describe("Relationships", () => {
  let memberUrl: string;

  test.beforeEach(async ({ page }) => {
    // Create a member to work with
    await page.goto("/dashboard/members/new");
    await waitForHydration(page, "#fullName");
    const name = `E2E Rel ${Date.now()}`;
    const fullNameInput = page.locator("#fullName");
    // Fill and retry if hydration resets the controlled input
    await fullNameInput.fill(name);
    await expect(fullNameInput)
      .toHaveValue(name, { timeout: 5000 })
      .catch(async () => {
        await fullNameInput.fill(name);
      });
    await page.locator("#gender").selectOption("male");
    await page.getByRole("button", { name: /thêm thành viên/i }).click();
    // Wait for redirect to detail page (UUID in URL, not /new)
    await expect(page).toHaveURL(/\/dashboard\/members\/[0-9a-f]{8}-/, { timeout: 15000 });
    memberUrl = page.url();
  });

  test("should display relationship sections on member detail", async ({ page }) => {
    await page.goto(memberUrl);
    await waitForHydration(page);
    await expect(page.getByRole("heading", { name: /gia đình/i })).toBeVisible();
    // Relationship sections load asynchronously — wait for loading to finish
    await expect(page.getByText(/bố \/ mẹ/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/vợ \/ chồng/i)).toBeVisible();
    await expect(page.getByText(/con cái/i)).toBeVisible();
  });

  test("should show add relationship buttons for admin", async ({ page }) => {
    await page.goto(memberUrl);
    await waitForHydration(page);
    // Wait for async relationship data to load
    await expect(page.getByText(/thêm con/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/thêm vợ\/chồng/i)).toBeVisible();
    await expect(page.getByText(/thêm mối quan hệ/i)).toBeVisible();
  });

  test("should open add spouse form", async ({ page }) => {
    await page.goto(memberUrl);
    await waitForHydration(page);
    await page.getByText(/thêm vợ\/chồng/i).click({ timeout: 15000 });

    // Should show the quick add spouse form
    await expect(page.getByText(/thêm nhanh vợ\/chồng/i)).toBeVisible({ timeout: 10000 });
  });

  test("should add a spouse via quick form", async ({ page }) => {
    await page.goto(memberUrl);
    await waitForHydration(page);
    await page.getByText(/thêm vợ\/chồng/i).click({ timeout: 15000 });

    // Fill spouse name
    const nameInput = page.getByRole("textbox", { name: /họ và tên/i });
    await nameInput.fill(`E2E Spouse ${Date.now()}`);

    // Submit
    await page.getByRole("button", { name: /lưu/i }).click();

    // Wait for the spouse to appear in the relationships section
    await expect(page.getByText(/e2e spouse/i)).toBeVisible({ timeout: 10000 });
  });
});
