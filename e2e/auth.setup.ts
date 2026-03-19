import { expect, test as setup } from '@playwright/test';
import { loginViaUI, TEST_ADMIN, TEST_MEMBER } from './fixtures';

setup('authenticate as admin', async ({ page }) => {
  await loginViaUI(page, TEST_ADMIN.email, TEST_ADMIN.password);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: '.playwright/auth/admin.json' });
});

setup('authenticate as member', async ({ page }) => {
  await loginViaUI(page, TEST_MEMBER.email, TEST_MEMBER.password);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: '.playwright/auth/member.json' });
});
