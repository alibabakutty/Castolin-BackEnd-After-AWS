// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 🔹 UNIT TESTS (no server, no baseURL)
    {
      name: 'unit',
      testMatch: '**/unit/**/*.spec.js',
    },

    // 🔹 INTEGRATION TESTS (API)
    {
      name: 'integration',
      testMatch: '**/integration/**/*.spec.js',
      dependencies: ['unit'],
      use: {
        baseURL: process.env.BACKEND_URL || 'http://localhost:10000',
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },

    // 🔹 E2E TESTS
    {
      name: 'e2e',
      testMatch: '**/e2e/**/*.spec.js',
      dependencies: ['integration'],
      use: {
        baseURL: process.env.BACKEND_URL || 'http://localhost:10000',
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
  ],

  globalSetup: require.resolve('./tests/setup/global-setup.js'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.js'),
});
