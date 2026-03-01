import { expect, test as setup } from '@playwright/test';
import { loginViaUI, TEST_ADMIN, TEST_MEMBER } from './fixtures';

setup('authenticate as admin', async ({ page }) => {
  // Register admin user (first user = auto admin + active)
  // Ignore errors if user already exists
  await page.request.post('/api/auth/sign-up/email', {
    data: { email: TEST_ADMIN.email, password: TEST_ADMIN.password, name: TEST_ADMIN.email },
    failOnStatusCode: false,
  });

  // Login via UI
  await loginViaUI(page, TEST_ADMIN.email, TEST_ADMIN.password);
  await expect(page).toHaveURL(/\/dashboard/);

  // Ensure member user exists (register via API, might already exist)
  await page.request.post('/api/auth/sign-up/email', {
    data: { email: TEST_MEMBER.email, password: TEST_MEMBER.password, name: TEST_MEMBER.email },
    failOnStatusCode: false,
  });

  // Activate member if needed: go to user management and approve
  await page.goto('/dashboard/users');
  const memberRow = page.locator('tr', { hasText: TEST_MEMBER.email });
  const approveButton = memberRow.getByRole('button', { name: /^duyệt$/i });

  if (await approveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await approveButton.click();
    await page.waitForTimeout(1500);
  }

  // Save admin auth state
  await page.context().storageState({ path: '.playwright/auth/admin.json' });
});

setup('authenticate as member', async ({ page }) => {
  // Login as member (already created and activated by admin setup above)
  await loginViaUI(page, TEST_MEMBER.email, TEST_MEMBER.password);
  await expect(page).toHaveURL(/\/dashboard/);

  // Save member auth state
  await page.context().storageState({ path: '.playwright/auth/member.json' });
});
