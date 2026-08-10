import { test as base, expect, Page } from '@playwright/test';
import { RegistrationPage } from '../pages/RegistrationPage';

export type BrowserHealth = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
};

export type RegistrationFixtures = {
  registrationPage: RegistrationPage;
  browserHealth: BrowserHealth;
};

function attachHealthMonitor(page: Page, health: BrowserHealth): void {
  page.on('console', (message) => {
    if (message.type() === 'error') health.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => health.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!/hcaptcha|google-analytics|googletagmanager|doubleclick/i.test(url)) {
      health.failedRequests.push(`${request.method()} ${url} :: ${request.failure()?.errorText ?? 'unknown'}`);
    }
  });
}

export const test = base.extend<RegistrationFixtures>({
  browserHealth: async ({ page }, use) => {
    const health: BrowserHealth = { consoleErrors: [], pageErrors: [], failedRequests: [] };
    attachHealthMonitor(page, health);
    await use(health);
  },
  registrationPage: async ({ page }, use) => {
    // Safety guard: no test in the default suite can transmit a registration or upload to production.
    await page.route('**/registrationv5/save_page/**', (route) => route.abort('blockedbyclient'));
    await page.route('**/registrationv5/upload', (route) => route.abort('blockedbyclient'));

    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await use(registrationPage);
  },
});

export { expect };
