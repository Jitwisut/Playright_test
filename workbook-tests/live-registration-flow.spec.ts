import { expect, Page, test, TestInfo } from '@playwright/test';

const REGISTRATION_URL = process.env.WORKBOOK_REGISTRATION_URL
  ?? 'https://registration.expopass.co/register/form/kiso26/ThqcXW';

function requireTestEmail(): string {
  const email = process.env.WORKBOOK_TEST_EMAIL?.trim();
  if (!email) {
    throw new Error('Set WORKBOOK_TEST_EMAIL to the mailbox that should receive the real registration email.');
  }
  return email;
}

function uniqueGmailAlias(email: string): string {
  const match = /^([^@]+)@gmail\.com$/i.exec(email);
  if (!match) return email;
  return `${match[1]}+expopassqa${Date.now()}@gmail.com`;
}

async function attachScreenshot(testInfo: TestInfo, name: string, page: Page): Promise<void> {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

test('LIVE-REG-001 - Registration to Questionnaire with manual hCaptcha @live-flow', async ({ page }, testInfo) => {
  test.setTimeout(12 * 60_000);
  if (testInfo.project.use.headless !== false) {
    throw new Error('Run this live flow with --headed so a person can complete hCaptcha.');
  }

  const email = uniqueGmailAlias(requireTestEmail());
  await page.goto(REGISTRATION_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#registerV5Form')).toBeVisible();

  await page.locator('#pf_userEmail').fill(email);
  await page.locator('#pf_userEmail_confirm').fill(email);
  await page.locator('#pf_userFname').fill('Workbook');
  await page.locator('#pf_userLname').fill('Automation');
  await page.locator('#pf_userTitle').selectOption({ label: 'Mr.' });
  await page.locator('#pf_companyName').fill('Expopass QA Automation');
  await page.locator('#pf_position').fill('QA Engineer');
  await page.locator('#pf_mobile').fill('812345678');
  await page.locator('#pf_countryID').selectOption({ label: 'THAILAND' });
  await page.locator('#pf_color').fill('#336699');
  await page.getByRole('radio', { name: 'Energy', exact: true }).check();
  await attachScreenshot(testInfo, '01-ready-for-captcha', page);

  testInfo.annotations.push({
    type: 'manual-action',
    description: 'Complete hCaptcha in the open browser window. The test waits up to 10 minutes, then submits automatically.',
  });
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea[name="h-captcha-response"]'))
      .some((field) => field.value.trim().length > 0),
    undefined,
    { timeout: 10 * 60_000 },
  );

  const registrationUrl = page.url();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await page.waitForURL((url) => url.toString() !== registrationUrl, { timeout: 60_000, waitUntil: 'domcontentloaded' });
  await attachScreenshot(testInfo, '02-after-registration', page);

  testInfo.annotations.push({ type: 'generated-email', description: email });
  testInfo.annotations.push({ type: 'next-step-url', description: page.url() });
  expect(page.url()).not.toBe(registrationUrl);
});
