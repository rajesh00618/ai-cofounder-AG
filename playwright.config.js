import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: process.env.CI ? 'http://app:3001' : 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: process.env.CI ? 'on-first-retry' : 'off',
  },
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: 'npm run dev',
          port: 5173,
          reuseExistingServer: true,
        },
      ],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
