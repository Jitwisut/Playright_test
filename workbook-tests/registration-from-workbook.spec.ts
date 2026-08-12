import { expect, test } from '@playwright/test';
import { casesFor, workbookTitle } from '../test-data/web-registration-online-cases';
import {
  annotateExpected,
  expectNoHorizontalOverflow,
  expectPayloadNotExecutable,
  fillFullRegistration,
  fillRequiredRegistration,
  installProductionGuards,
  ONE_PIXEL_PNG,
  openRegistration,
  REGISTRATION_URL,
  requireEnv,
  SYNTHETIC_PROFILE,
  writableTestEnvironment,
} from './helpers';

const registrationCases = casesFor('Registration');

for (const testCase of registrationCases) {
  test(workbookTitle(testCase), async ({ page, browserName }, testInfo) => {
    annotateExpected(testCase.expected);

    switch (testCase.id) {
      case 'REG-001': {
        await openRegistration(page);
        await expect(page).toHaveTitle('Visitor Pre-Registration');
        await expect(page.getByRole('heading', { name: 'Registrant Information' })).toBeVisible();
        break;
      }
      case 'REG-002': {
        await installProductionGuards(page);
        const invalidUrl = `${new URL(REGISTRATION_URL).origin}/invalid-workbook-registration-url`;
        const response = await page.goto(invalidUrl, { waitUntil: 'domcontentloaded' });
        const warning = page.getByText(/404|not found|invalid|ไม่พบ|ไม่ถูกต้อง/i);
        expect(response?.status() === 404 || await warning.count() > 0).toBe(true);
        break;
      }
      case 'REG-003': {
        await openRegistration(page);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        const invalid = page.locator('#registerV5Form :invalid');
        expect(await invalid.count()).toBeGreaterThanOrEqual(4);
        break;
      }
      case 'REG-004': {
        test.fail(true, 'Known requirement mismatch: the live field does not expose an English-only pattern.');
        await openRegistration(page);
        const field = page.locator('#pf_userFname');
        await field.fill('John');
        expect(await field.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(true);
        await field.fill('สมชาย');
        expect(await field.evaluate((input: HTMLInputElement) => input.validity.patternMismatch)).toBe(true);
        break;
      }
      case 'REG-005': {
        await openRegistration(page);
        const field = page.locator('#pf_userFname');
        await expect(field).toHaveAttribute('required', '');
        expect(await field.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
        break;
      }
      case 'REG-006': {
        await openRegistration(page);
        const field = page.locator('#pf_userFname');
        const maxLength = Number(await field.getAttribute('maxlength'));
        expect(maxLength).toBeGreaterThan(0);
        await field.fill('A'.repeat(256));
        expect((await field.inputValue()).length).toBeLessThanOrEqual(maxLength);
        break;
      }
      case 'REG-007': {
        test.fail(true, 'Known requirement mismatch: the live Last Name field does not expose an English-only pattern.');
        await openRegistration(page);
        const field = page.locator('#pf_userLname');
        await field.fill('Automation');
        expect(await field.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(true);
        await field.fill('ใจดี');
        expect(await field.evaluate((input: HTMLInputElement) => input.validity.patternMismatch)).toBe(true);
        break;
      }
      case 'REG-008': {
        await openRegistration(page);
        const email = page.locator('#pf_userEmail');
        await email.fill('test@test.com');
        expect(await email.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(true);
        break;
      }
      case 'REG-009': {
        await openRegistration(page);
        const email = page.locator('#pf_userEmail');
        await email.fill('test@');
        expect(await email.evaluate((input: HTMLInputElement) => input.validity.typeMismatch)).toBe(true);
        break;
      }
      case 'REG-010': {
        test.skip(!writableTestEnvironment(), 'Duplicate-email validation needs a non-production environment with CAPTCHA test mode.');
        await openRegistration(page, false);
        const duplicateEmail = requireEnv('WORKBOOK_DUPLICATE_EMAIL', 'REG-010 duplicate account');
        await fillFullRegistration(page);
        await page.locator('#pf_userEmail').fill(duplicateEmail);
        await page.locator('#pf_userEmail_confirm').fill(duplicateEmail);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await expect(page.getByText(/This account already exists/i)).toBeVisible();
        break;
      }
      case 'REG-011': {
        await openRegistration(page);
        const mobile = page.locator('#pf_mobile');
        await mobile.fill('812345678');
        expect((await mobile.inputValue()).replace(/\D/g, '')).toBe('812345678');
        break;
      }
      case 'REG-012': {
        await openRegistration(page);
        const mobile = page.locator('#pf_mobile');
        await mobile.fill('ABC123');
        const state = await mobile.evaluate((input: HTMLInputElement) => ({ value: input.value, valid: input.validity.valid }));
        expect(/[A-Za-z]/.test(state.value) && state.valid).toBe(false);
        break;
      }
      case 'REG-013': {
        test.fail(true, 'Known requirement mismatch: the live Mobile field has no 8/15-digit validity constraint.');
        await openRegistration(page);
        const mobile = page.locator('#pf_mobile');
        await mobile.fill('12345678');
        expect(await mobile.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false);
        break;
      }
      case 'REG-014': {
        await openRegistration(page);
        const dropdown = page.locator('#pf_userTitle');
        await dropdown.selectOption({ label: 'Mr.' });
        expect(await dropdown.evaluate((select: HTMLSelectElement) => select.selectedOptions[0]?.textContent?.trim())).toBe('Mr.');
        break;
      }
      case 'REG-015': {
        await openRegistration(page);
        const dropdown = page.locator('#pf_userTitle');
        await expect(dropdown).toHaveAttribute('required', '');
        expect(await dropdown.evaluate((select: HTMLSelectElement) => select.validity.valueMissing)).toBe(true);
        break;
      }
      case 'REG-016': {
        await openRegistration(page);
        await page.locator('#pf_userTitle').selectOption({ label: 'Other' });
        await expect(page.locator('#pf_userTitle_other')).toBeVisible();
        break;
      }
      case 'REG-017': {
        test.fail(true, 'Known requirement mismatch: the revealed Other textbox is not required on the live form.');
        await openRegistration(page);
        await fillRequiredRegistration(page);
        await page.locator('#pf_userTitle').selectOption({ label: 'Other' });
        const other = page.locator('#pf_userTitle_other');
        await other.clear();
        expect(await other.evaluate((input: HTMLInputElement) => input.required && input.validity.valueMissing)).toBe(true);
        break;
      }
      case 'REG-018': {
        await openRegistration(page);
        const upload = page.locator('#pf_imgProfile');
        let requestObserved = false;
        page.on('request', (request) => {
          if (request.url().includes('/registrationv5/upload')) requestObserved = true;
        });
        await upload.setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: ONE_PIXEL_PNG });
        const count = await upload.evaluate((input: HTMLInputElement) => input.files?.length ?? 0);
        expect(count === 1 || requestObserved).toBe(true);
        expect(await upload.getAttribute('accept')).toMatch(/\.png/);
        break;
      }
      case 'REG-019': {
        await openRegistration(page);
        const upload = page.locator('#pf_imgProfile');
        expect(await upload.getAttribute('accept')).not.toContain('.pdf');
        await upload.setInputFiles({ name: 'file.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic') });
        const feedback = await page.locator('body').innerText();
        const retained = await upload.evaluate((input: HTMLInputElement) => input.files?.[0]?.name === 'file.pdf');
        expect(/upload failed|invalid|unsupported|error/i.test(feedback) || !retained).toBe(true);
        break;
      }
      case 'REG-020': {
        await openRegistration(page);
        const upload = page.locator('#pf_imgProfile');
        await upload.setInputFiles({ name: 'large.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(20 * 1024 * 1024) });
        const body = await page.locator('body').innerText();
        const cleared = await upload.evaluate((input: HTMLInputElement) => (input.files?.length ?? 0) === 0);
        expect(/upload failed|too large|max|size|error/i.test(body) || cleared).toBe(true);
        break;
      }
      case 'REG-021':
      case 'REG-022': {
        test.fail(true, 'Known requirement mismatch: this event form currently has no PDPA/consent checkbox.');
        await openRegistration(page);
        const consent = page.locator('input[type="checkbox"][name*="consent" i], input[type="checkbox"][name*="pdpa" i]');
        await expect(consent.first()).toBeVisible();
        if (testCase.id === 'REG-022') await consent.first().check();
        break;
      }
      case 'REG-023':
      case 'REG-024': {
        test.skip(!writableTestEnvironment(), 'Real submission is enabled only for a non-production URL with WORKBOOK_ALLOW_WRITE=1 and CAPTCHA test mode.');
        await openRegistration(page, false);
        await fillFullRegistration(page);
        let saveRequests = 0;
        page.on('request', (request) => {
          if (request.url().includes('/registrationv5/save_page/')) saveRequests += 1;
        });
        const submit = page.getByRole('button', { name: 'Submit', exact: true });
        if (testCase.id === 'REG-024') await submit.dblclick();
        else await submit.click();
        await page.waitForLoadState('domcontentloaded');
        expect(saveRequests).toBe(1);
        await expect(page).toHaveURL(/question|questionnaire/i);
        break;
      }
      case 'REG-025': {
        const timeoutMs = Number(requireEnv('WORKBOOK_SESSION_TIMEOUT_MS', 'REG-025 session timeout duration'));
        await openRegistration(page);
        await page.waitForTimeout(timeoutMs);
        await expect(page.getByText(/session expired|หมดอายุ/i)).toBeVisible();
        break;
      }
      case 'REG-026': {
        await openRegistration(page);
        await page.locator('#pf_userFname').fill(SYNTHETIC_PROFILE.firstName);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('form#registerV5Form')).toBeVisible();
        break;
      }
      case 'REG-027':
      case 'REG-028':
      case 'REG-029':
      case 'REG-030': {
        const requiredProject = {
          'REG-027': 'chromium',
          'REG-028': 'edge',
          'REG-029': 'firefox',
          'REG-030': 'webkit',
        }[testCase.id];
        test.skip(testInfo.project.name !== requiredProject, `Run with WORKBOOK_CROSS_BROWSER=1 on the ${requiredProject} project.`);
        await openRegistration(page);
        await expect(page.locator('form#registerV5Form')).toBeVisible();
        expect(browserName).toMatch(/chromium|firefox|webkit/);
        break;
      }
      case 'REG-031': {
        await page.setViewportSize({ width: 390, height: 844 });
        await openRegistration(page);
        await expectNoHorizontalOverflow(page);
        await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeVisible();
        break;
      }
      case 'REG-032': {
        await openRegistration(page);
        const payload = "' OR 1=1 --";
        await page.locator('#pf_companyName').fill(payload);
        await expect(page.locator('#pf_companyName')).toHaveValue(payload);
        await expectPayloadNotExecutable(page, payload);
        break;
      }
      case 'REG-033': {
        await openRegistration(page);
        const payload = '<script>alert(1)</script>';
        let dialogOpened = false;
        page.on('dialog', async (dialog) => {
          dialogOpened = true;
          await dialog.dismiss();
        });
        await page.locator('#pf_companyName').fill(payload);
        await expectPayloadNotExecutable(page, payload);
        expect(dialogOpened).toBe(false);
        break;
      }
      case 'REG-034': {
        await openRegistration(page);
        await fillRequiredRegistration(page);
        const slaMs = Number(process.env.WORKBOOK_SLA_MS ?? '3000');
        const started = Date.now();
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        expect(Date.now() - started).toBeLessThanOrEqual(slaMs);
        break;
      }
      case 'REG-035': {
        await openRegistration(page);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        for (const selector of ['#pf_userFname', '#pf_userTitle', '#pf_userLname']) {
          expect(await page.locator(selector).evaluate((element: HTMLInputElement | HTMLSelectElement) => element.validity.valid)).toBe(false);
        }
        expect(await page.getByRole('radio').first().evaluate((element: HTMLInputElement) => element.validity.valid)).toBe(false);
        break;
      }
      case 'REG-036': {
        await openRegistration(page);
        const fields = [
          ['#pf_userEmail', 'Enter email address'],
          ['#pf_userFname', 'Enter first name'],
          ['#pf_userLname', 'Enter last name'],
          ['#pf_companyName', 'Enter company name'],
          ['#pf_position', 'Enter position'],
          ['#pf_mobile', 'Enter mobile number'],
        ] as const;
        for (const [selector, placeholder] of fields) {
          const field = page.locator(selector);
          await expect(field).toHaveAttribute('placeholder', placeholder);
          expect(await field.getAttribute('aria-label') || await field.getAttribute('id')).toBeTruthy();
        }
        break;
      }
      case 'REG-037': {
        await openRegistration(page);
        const order = await page.locator('#registerV5Form input:not([type="hidden"]), #registerV5Form select, #registerV5Form button')
          .evaluateAll((elements) => elements.filter((element) => !(element as HTMLInputElement).disabled).map((element) => element.id || element.getAttribute('name') || element.textContent?.trim()));
        expect(order.indexOf('pf_userFname')).toBeLessThan(order.indexOf('pf_userLname'));
        expect(order.indexOf('pf_userLname')).toBeLessThan(order.indexOf('pf_companyName'));
        break;
      }
      case 'REG-038': {
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
        break;
      }
      case 'REG-039': {
        await openRegistration(page);
        for (const value of ['English', 'ภาษาไทย', '@#$%^&']) {
          await page.locator('#pf_companyName').fill(value);
          await expect(page.locator('#pf_companyName')).toHaveValue(value);
          await expectPayloadNotExecutable(page, value);
        }
        break;
      }
      case 'REG-040': {
        await installProductionGuards(page);
        for (const viewport of [{ width: 1440, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }]) {
          await page.setViewportSize(viewport);
          await page.goto(REGISTRATION_URL, { waitUntil: 'domcontentloaded' });
          await expect(page.locator('form#registerV5Form')).toBeVisible();
          await expectNoHorizontalOverflow(page);
        }
        break;
      }
      case 'REG-041': {
        test.skip(true, 'Requires a successful non-production registration plus mailbox API/fixture; covered by EMF-001 when configured.');
        break;
      }
      case 'REG-042': {
        test.skip(true, 'Requires read-only access to a test database or Back Office API; credentials are intentionally not stored in Git.');
        break;
      }
      case 'REG-043': {
        const closedUrl = requireEnv('WORKBOOK_CLOSED_EVENT_URL', 'REG-043 closed/not-open/expired event URL');
        await installProductionGuards(page);
        await page.goto(closedUrl, { waitUntil: 'domcontentloaded' });
        await expect(page.getByText(/closed|not open|expired|ปิดรับสมัคร|ยังไม่เปิด|หมดอายุ/i)).toBeVisible();
        break;
      }
      default:
        throw new Error(`No workbook runner implemented for ${testCase.id}`);
    }
  });
}
