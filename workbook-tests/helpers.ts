import { expect, Locator, Page, test } from '@playwright/test';

export const REGISTRATION_URL = process.env.WORKBOOK_REGISTRATION_URL
  ?? 'https://registration.expopass.co/register/form/kiso26/ThqcXW';

export const SYNTHETIC_PROFILE = {
  email: 'qa.workbook@example.test',
  firstName: 'Workbook',
  lastName: 'Automation',
  company: 'Synthetic QA Company',
  position: 'QA Engineer',
  mobile: '812345678',
};

export const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

export function annotateExpected(expected: string): void {
  if (expected) test.info().annotations.push({ type: 'expected-result', description: expected });
}

export function requireEnv(name: string, purpose: string): string {
  const value = process.env[name];
  test.skip(!value, `${purpose}: กรุณากำหนด environment variable ${name}`);
  return value ?? '';
}

export function writableTestEnvironment(): boolean {
  try {
    const hostname = new URL(REGISTRATION_URL).hostname;
    return process.env.WORKBOOK_ALLOW_WRITE === '1'
      && process.env.WORKBOOK_CAPTCHA_TEST_MODE === '1'
      && hostname !== 'registration.expopass.co';
  } catch {
    return false;
  }
}

export async function installProductionGuards(page: Page): Promise<void> {
  await page.route('**/registrationv5/save_page/**', (route) => route.abort('blockedbyclient'));
  await page.route('**/registrationv5/upload', (route) => route.abort('blockedbyclient'));
}

export async function openRegistration(page: Page, guarded = true): Promise<void> {
  if (guarded) await installProductionGuards(page);
  const response = await page.goto(REGISTRATION_URL, { waitUntil: 'domcontentloaded' });
  expect(response, 'Registration navigation should return a response').not.toBeNull();
  await expect(page.locator('form#registerV5Form')).toBeVisible();
}

export async function fillRequiredRegistration(page: Page): Promise<void> {
  await page.locator('#pf_userFname').fill(SYNTHETIC_PROFILE.firstName);
  await page.locator('#pf_userLname').fill(SYNTHETIC_PROFILE.lastName);
  await page.locator('#pf_userTitle').selectOption({ label: 'Mr.' });
  await page.getByRole('radio', { name: 'Energy', exact: true }).check();
}

export async function fillFullRegistration(page: Page): Promise<void> {
  await page.locator('#pf_userEmail').fill(SYNTHETIC_PROFILE.email);
  await page.locator('#pf_userEmail_confirm').fill(SYNTHETIC_PROFILE.email);
  await fillRequiredRegistration(page);
  await page.locator('#pf_companyName').fill(SYNTHETIC_PROFILE.company);
  await page.locator('#pf_position').fill(SYNTHETIC_PROFILE.position);
  await page.locator('#pf_mobile').fill(SYNTHETIC_PROFILE.mobile);
  await page.locator('#pf_countryID').selectOption({ label: 'THAILAND' });
  await page.locator('#pf_color').fill('#336699');
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

export async function expectPayloadNotExecutable(page: Page, payload: string): Promise<void> {
  const result = await page.evaluate((value) => ({
    scriptEcho: Array.from(document.scripts).some((script) => script.textContent?.includes(value)),
    handlerEcho: Array.from(document.querySelectorAll('[onerror], [onload], [onclick]'))
      .some((element) => element.outerHTML.includes(value)),
  }), payload);
  expect(result).toEqual({ scriptEcho: false, handlerEcho: false });
}

export async function firstVisible(locator: Locator): Promise<Locator | null> {
  for (let index = 0; index < await locator.count(); index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible()) return candidate;
  }
  return null;
}

export async function visibleQuestionControls(page: Page): Promise<Locator[]> {
  const controls = page.locator('form input:not([type="hidden"]):not([type="submit"]):not([type="button"]), form textarea, form select');
  const visible: Locator[] = [];
  for (let index = 0; index < await controls.count(); index += 1) {
    const candidate = controls.nth(index);
    if (await candidate.isVisible()) visible.push(candidate);
  }
  return visible;
}

export async function openRequiredUrl(page: Page, envName: string, purpose: string): Promise<string> {
  const url = requireEnv(envName, purpose);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return url;
}
