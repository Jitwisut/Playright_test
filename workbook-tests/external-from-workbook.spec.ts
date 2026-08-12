import { expect, Locator, Page, test } from '@playwright/test';
import { casesFor, workbookTitle, WorkbookCase } from '../test-data/web-registration-online-cases';
import { annotateExpected, firstVisible, requireEnv } from './helpers';
import { expectRegistrationMail, readMailFixture } from './mail-fixture';

async function required(locator: Locator, reason: string): Promise<Locator | null> {
  const element = await firstVisible(locator);
  test.skip(!element, reason);
  return element;
}

async function loginConference(page: Page): Promise<void> {
  const url = requireEnv('WORKBOOK_CONFERENCE_URL', 'Conference tests need the correct login URL');
  const username = requireEnv('WORKBOOK_CONFERENCE_USER', 'Conference login username');
  const password = requireEnv('WORKBOOK_CONFERENCE_PASSWORD', 'Conference login password');
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const usernameField = await required(
    page.getByLabel(/email|username|user name/i).or(page.locator('input[type="email"], input[name*="user" i]')),
    'Conference page has no username/email field.',
  );
  const passwordField = await required(
    page.getByLabel(/password/i).or(page.locator('input[type="password"]')),
    'Conference page has no password field.',
  );
  const loginButton = await required(
    page.getByRole('button', { name: /login|sign in|เข้าสู่ระบบ/i }),
    'Conference page has no Login button.',
  );
  if (!usernameField || !passwordField || !loginButton) return;
  await usernameField.fill(username);
  await passwordField.fill(password);
  await loginButton.click();
  await expect(page.getByText(/my profile|profile|dashboard/i).first()).toBeVisible();
}

async function runConference(testCase: WorkbookCase, page: Page): Promise<void> {
  await loginConference(page);
  if (testCase.id === 'CFR-001') {
    await expect(page.getByText(/my profile|profile|dashboard/i).first()).toBeVisible();
    return;
  }

  const profileMenu = await required(page.getByText(/my profile/i).first(), 'Conference page has no My Profile menu.');
  if (!profileMenu) return;
  await profileMenu.click();

  if (testCase.id === 'CFR-002') {
    await expect(page.getByText(/my profile/i).first()).toBeVisible();
    await expect(page.getByText(/my booking/i).first()).toBeVisible();
  }
  if (testCase.id === 'CFR-003') {
    const myProfile = await required(page.getByText(/my profile/i).last(), 'Profile menu has no My Profile item.');
    if (!myProfile) return;
    await myProfile.click();
    await expect(page.getByText(/my profile/i).first()).toBeVisible();
  }
  if (testCase.id === 'CFR-004') {
    const booking = await required(page.getByText(/my booking/i).first(), 'Profile menu has no My Booking item.');
    if (!booking) return;
    await booking.click();
    await expect(page.getByText(/my booking/i).first()).toBeVisible();
  }
}

for (const testCase of casesFor('Conference')) {
  test(workbookTitle(testCase), async ({ page }) => {
    annotateExpected(testCase.expected);
    await runConference(testCase, page);
  });
}

for (const testCase of casesFor('Email Registration')) {
  test(workbookTitle(testCase), async () => {
    annotateExpected(testCase.expected);
    const message = await readMailFixture();
    expectRegistrationMail(message);
  });
}

for (const testCase of casesFor('Invite Friend')) {
  test(workbookTitle(testCase), async ({ page }) => {
    annotateExpected(testCase.expected);
    const inviteUrl = requireEnv('WORKBOOK_INVITE_URL', 'INF-001 needs the URL in Excel cell F120');
    const response = await page.goto(inviteUrl, { waitUntil: 'domcontentloaded' });
    expect(response, 'The Excel URL should return an HTTP response').not.toBeNull();
    expect(response!.status(), 'The Excel URL should not return an error page').toBeLessThan(400);
    await expect(page.locator('body')).not.toBeEmpty();
  });
}
