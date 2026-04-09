import type { TestHelpers } from 'better-auth/plugins';

import { test as setup } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { auth } from '../src/auth/server';
import { SEED_DATA_PATH, type SeedData } from './e2e-seed-data';

async function saveAuthState(userId: string, statePath: string): Promise<void> {
  const ctx = await auth.$context;
  const test = (ctx as unknown as { test: TestHelpers }).test;
  const cookies = await test.getCookies({ userId, domain: 'localhost' });

  // Playwright storageState expects { cookies, origins } shape
  mkdirSync('.playwright/auth', { recursive: true });
  writeFileSync(statePath, JSON.stringify({ cookies, origins: [] }, null, 2));
}

setup('authenticate as admin', async () => {
  const seedData: SeedData = JSON.parse(readFileSync(SEED_DATA_PATH, 'utf-8'));
  await saveAuthState(seedData.adminUserId, '.playwright/auth/admin.json');
});

setup('authenticate as editor', async () => {
  const seedData: SeedData = JSON.parse(readFileSync(SEED_DATA_PATH, 'utf-8'));
  await saveAuthState(seedData.editorUserId, '.playwright/auth/editor.json');
});

setup('authenticate as member', async () => {
  const seedData: SeedData = JSON.parse(readFileSync(SEED_DATA_PATH, 'utf-8'));
  await saveAuthState(seedData.memberUserId, '.playwright/auth/member.json');
});
