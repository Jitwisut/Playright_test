import { expect, Locator, Page, test } from '@playwright/test';
import { casesFor, workbookTitle, WorkbookCase } from '../test-data/web-registration-online-cases';
import { annotateExpected, firstVisible, openRequiredUrl, requireEnv } from './helpers';
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
  test(workbookTitle(testCase), async ({ page }, testInfo) => {
    annotateExpected(testCase.expected);
    const inviteUrl = await openRequiredUrl(page, 'WORKBOOK_INVITE_URL', 'Invite Friend test needs the invitation URL from the workbook');
    await expect(page.getByText(/invite|tell a friend|เพื่อน/i).first()).toBeVisible();

    testInfo.annotations.push({
      type: 'manual-substeps',
      description: 'Rows without TC ID in the workbook cover new-account confirmation, invitation quota, confirmation email, and an already-registered account.',
    });

    if (process.env.WORKBOOK_RUN_INVITE_SUBMISSION !== '1') return;
    const productionHost = /(^|\.)eventpassinsight\.co$|(^|\.)expopass\.co$/i.test(new URL(inviteUrl).hostname);
    test.skip(process.env.WORKBOOK_ALLOW_WRITE !== '1' || productionHost, 'Invite submission requires WORKBOOK_ALLOW_WRITE=1 and a non-production invitation URL.');

    const friendEmail = requireEnv('WORKBOOK_INVITE_NEW_EMAIL', 'Synthetic recipient for Invite Friend submission');
    const emailField = await required(page.getByLabel(/email/i).or(page.locator('input[type="email"]')), 'Invite Friend page has no email field.');
    const submit = await required(page.getByRole('button', { name: /submit|send|invite|ส่ง/i }), 'Invite Friend page has no Submit/Send button.');
    if (!emailField || !submit) return;
    await emailField.fill(friendEmail);
    await submit.click();

    const confirm = await required(page.getByRole('button', { name: /confirm|yes|ตกลง|ยืนยัน/i }), 'Invite Friend confirmation dialog did not appear.');
    if (!confirm) return;
    await expect(page.getByText(/do you want to submit/i)).toBeVisible();
    await confirm.click();
    await expect(page.getByText(/used request|invitation.*sent|ส่ง.*สำเร็จ/i)).toBeVisible();
  });
}
