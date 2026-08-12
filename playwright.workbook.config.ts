import { defineConfig, devices } from '@playwright/test';

const registrationUrl = process.env.WORKBOOK_REGISTRATION_URL
  ?? 'https://registration.expopass.co/register/form/kiso26/ThqcXW';

const projects: Parameters<typeof defineConfig>[0]['projects'] = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], browserName: 'chromium' },
  },
];

if (process.env.WORKBOOK_CROSS_BROWSER === '1') {
  if (process.platform === 'win32') {
    projects?.push({
      name: 'edge',
      use: { ...devices['Desktop Edge'], browserName: 'chromium', channel: 'msedge' },
    });
  }
  projects?.push(
    { name: 'firefox', use: { ...devices['Desktop Firefox'], browserName: 'firefox' } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], browserName: 'webkit' } },
  );
}

export default defineConfig({
  testDir: './workbook-tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-workbook', open: 'never' }],
  ],
  outputDir: 'test-results-workbook',
  use: {
    baseURL: registrationUrl,
    headless: process.env.PW_HEADLESS !== '0',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
    ignoreHTTPSErrors: false,
    storageState: process.env.WORKBOOK_STORAGE_STATE || undefined,
  },
  projects,
});
