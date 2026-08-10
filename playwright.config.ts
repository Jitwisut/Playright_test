import { defineConfig, devices } from '@playwright/test';

export const TARGET_URL = 'https://registration.expopass.co/register/form/kiso26/ThqcXW';

const projects: any[] = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], browserName: 'chromium' as const },
  },
];

if (process.env.CROSS_BROWSER === '1') {
  projects.push(
    { name: 'firefox', use: { ...devices['Desktop Firefox'], browserName: 'firefox' as const } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], browserName: 'webkit' as const } },
  );
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  forbidOnly: !!process.env.CI,
  grepInvert: process.env.RUN_SUBMISSION === '1' ? undefined : /@submission/,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  outputDir: 'test-results',
  use: {
    baseURL: TARGET_URL,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
    ignoreHTTPSErrors: false,
  },
  projects,
});
