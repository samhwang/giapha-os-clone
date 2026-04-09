import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './.playwright/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: './.playwright/report' }]],
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'vi-VN',
    extraHTTPHeaders: {
      'Accept-Language': 'vi-VN,vi;q=0.9',
    },
  },
  projects: [
    {
      name: 'seed',
      testMatch: /e2e-seed\.ts$/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /e2e-teardown\.ts/,
    },
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      dependencies: ['seed'],
      fullyParallel: false,
    },
    {
      name: 'public',
      testDir: './e2e/public',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin',
      testDir: './e2e/admin',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.playwright/auth/admin.json',
      },
    },
    {
      name: 'editor',
      testDir: './e2e/editor',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.playwright/auth/editor.json',
      },
    },
    {
      name: 'member',
      testDir: './e2e/member',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.playwright/auth/member.json',
      },
    },
    {
      name: 'mobile-android',
      testDir: './e2e/public',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-ios',
      testDir: './e2e/public',
      use: { ...devices['iPhone 15 Pro'] },
    },
  ],
  webServer: {
    command: 'E2E_TEST_UTILS=true bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
});
