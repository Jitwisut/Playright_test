import { expect, Page, test } from '@playwright/test';

const REGISTRATION_URL = process.env.WORKBOOK_REGISTRATION_URL
  ?? 'https://registration.expopass.co/register/form/kiso26/ThqcXW';

async function openRegistration(page: Page): Promise<void> {
  await page.route('**/registrationv5/save_page/**', (route) => route.abort('blockedbyclient'));
  await page.route('**/registrationv5/upload', (route) => route.abort('blockedbyclient'));
  await page.goto(REGISTRATION_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#registerV5Form')).toBeVisible();
}

test('PAGE-001 - Registration page loads @page', async ({ page }) => {
  await openRegistration(page);
  await expect(page).toHaveTitle('Visitor Pre-Registration');
  await expect(page.getByRole('heading', { name: 'Registrant Information' })).toBeVisible();
});

test('PAGE-002 - Required fields block an empty submit @page', async ({ page }) => {
  await openRegistration(page);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  expect(await page.locator('#registerV5Form :invalid').count()).toBeGreaterThan(0);
});

test('PAGE-003 - Email validation works @page', async ({ page }) => {
  await openRegistration(page);
  const email = page.locator('#pf_userEmail');
  await email.fill('test@');
  expect(await email.evaluate((input: HTMLInputElement) => input.validity.typeMismatch)).toBe(true);
  await email.fill('qa@example.test');
  expect(await email.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(true);
});

test('PAGE-004 - Job Title Other reveals a detail field @page', async ({ page }) => {
  await openRegistration(page);
  await page.locator('#pf_userTitle').selectOption({ label: 'Other' });
  await expect(page.locator('#pf_userTitle_other')).toBeVisible();
});

test('PAGE-005 - Mobile field does not accept a valid alphabetic value @page', async ({ page }) => {
  await openRegistration(page);
  const mobile = page.locator('#pf_mobile');
  await mobile.fill('ABC123');
  const state = await mobile.evaluate((input: HTMLInputElement) => ({ value: input.value, valid: input.validity.valid }));
  expect(/[A-Za-z]/.test(state.value) && state.valid).toBe(false);
});

test('PAGE-006 - Profile upload control supports PNG @page', async ({ page }) => {
  await openRegistration(page);
  const upload = page.locator('#pf_imgProfile');
  await expect(upload).toHaveAttribute('accept', /\.png/);
  await expect(upload).toHaveAttribute('accept', /\.jpg/);
});

test('PAGE-007 - Refresh keeps the registration form available @page', async ({ page }) => {
  await openRegistration(page);
  await page.locator('#pf_userFname').fill('Workbook');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#registerV5Form')).toBeVisible();
});

test('PAGE-008 - SQL payload remains text in Company field @page', async ({ page }) => {
  await openRegistration(page);
  const payload = "' OR 1=1 --";
  const company = page.locator('#pf_companyName');
  await company.fill(payload);
  await expect(company).toHaveValue(payload);
});

test('PAGE-009 - XSS payload does not execute @page', async ({ page }) => {
  await openRegistration(page);
  let dialogOpened = false;
  page.on('dialog', async (dialog) => {
    dialogOpened = true;
    await dialog.dismiss();
  });
  await page.locator('#pf_companyName').fill('<script>alert(1)</script>');
  expect(dialogOpened).toBe(false);
});

test('PAGE-010 - Placeholders are present @page', async ({ page }) => {
  await openRegistration(page);
  await expect(page.locator('#pf_userEmail')).toHaveAttribute('placeholder', 'Enter email address');
  await expect(page.locator('#pf_userFname')).toHaveAttribute('placeholder', 'Enter first name');
  await expect(page.locator('#pf_userLname')).toHaveAttribute('placeholder', 'Enter last name');
  await expect(page.locator('#pf_mobile')).toHaveAttribute('placeholder', 'Enter mobile number');
});

test('PAGE-011 - Keyboard tab order follows the form layout @page', async ({ page }) => {
  await openRegistration(page);
  const order = await page.locator('#registerV5Form input:not([type="hidden"]), #registerV5Form select, #registerV5Form button')
    .evaluateAll((elements) => elements.filter((element) => !(element as HTMLInputElement).disabled).map((element) => element.id));
  expect(order.indexOf('pf_userFname')).toBeLessThan(order.indexOf('pf_userLname'));
  expect(order.indexOf('pf_userLname')).toBeLessThan(order.indexOf('pf_companyName'));
});

test('PAGE-012 - Copy and paste works between fields @page', async ({ page }) => {
  await openRegistration(page);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(REGISTRATION_URL).origin });
  const source = page.locator('#pf_companyName');
  const target = page.locator('#pf_position');
  await source.fill('Copy Paste Test');
  await source.selectText();
  await page.keyboard.press('ControlOrMeta+C');
  await target.focus();
  await page.keyboard.press('ControlOrMeta+V');
  await expect(target).toHaveValue('Copy Paste Test');
});

test('PAGE-013 - Mobile layout has no horizontal overflow @page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openRegistration(page);
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});
