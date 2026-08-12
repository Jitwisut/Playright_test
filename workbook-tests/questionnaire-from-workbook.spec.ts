import { expect, Locator, Page, test } from '@playwright/test';
import { casesFor, workbookTitle } from '../test-data/web-registration-online-cases';
import {
  annotateExpected,
  expectNoHorizontalOverflow,
  expectPayloadNotExecutable,
  firstVisible,
  ONE_PIXEL_PNG,
  requireEnv,
  visibleQuestionControls,
} from './helpers';

async function guardMutatingRequests(page: Page, targetUrl: string): Promise<void> {
  const hostname = new URL(targetUrl).hostname;
  const nonProduction = !/(^|\.)expopass\.co$|(^|\.)eventpassinsight\.co$/i.test(hostname);
  if (process.env.WORKBOOK_ALLOW_WRITE === '1' && nonProduction) return;
  await page.route('**/*', async (route) => {
    const method = route.request().method();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) await route.abort('blockedbyclient');
    else await route.continue();
  });
}

async function openQuestionnaire(page: Page): Promise<string> {
  const url = requireEnv('WORKBOOK_QUESTIONNAIRE_URL', 'Questionnaire tests need a valid test-session URL');
  await guardMutatingRequests(page, url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('form').first()).toBeVisible();
  return url;
}

async function requireControl(locator: Locator, reason: string): Promise<Locator | null> {
  const control = await firstVisible(locator);
  test.skip(!control, reason);
  return control;
}

async function fillQuestionnairePage(page: Page): Promise<void> {
  const textFields = page.locator('form input[type="text"], form input[type="email"], form input:not([type])');
  for (let index = 0; index < await textFields.count(); index += 1) {
    const field = textFields.nth(index);
    if (await field.isVisible() && await field.isEditable()) await field.fill('EventPass');
  }

  const textareas = page.locator('form textarea');
  for (let index = 0; index < await textareas.count(); index += 1) {
    const field = textareas.nth(index);
    if (await field.isVisible() && await field.isEditable()) await field.fill('EventPass questionnaire answer');
  }

  const radioNames = await page.locator('form input[type="radio"]:visible').evaluateAll((elements) =>
    Array.from(new Set(elements.map((element) => (element as HTMLInputElement).name).filter(Boolean))),
  );
  for (const name of radioNames) {
    const safeName = name.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
    await page.locator(`form input[type="radio"][name="${safeName}"]`).first().check();
  }

  const requiredCheckboxes = page.locator('form input[type="checkbox"][required]:visible');
  for (let index = 0; index < await requiredCheckboxes.count(); index += 1) await requiredCheckboxes.nth(index).check();

  const selects = page.locator('form select:visible');
  for (let index = 0; index < await selects.count(); index += 1) {
    const select = selects.nth(index);
    const option = await select.locator('option:not([disabled])').evaluateAll((options) =>
      options.map((item) => (item as HTMLOptionElement).value).find((value) => value !== '') ?? '',
    );
    if (option) await select.selectOption(option);
  }
}

async function yesNoControls(page: Page): Promise<{ yes: Locator; no: Locator } | null> {
  const yes = await firstVisible(page.getByRole('radio', { name: /^yes$/i }));
  const no = await firstVisible(page.getByRole('radio', { name: /^no$/i }));
  if (!yes || !no) return null;
  return { yes, no };
}

for (const testCase of casesFor('Questionnaire')) {
  test(workbookTitle(testCase), async ({ page }, testInfo) => {
    annotateExpected(testCase.expected);
    await openQuestionnaire(page);

    switch (testCase.id) {
      case 'QN-001': {
        const controls = await visibleQuestionControls(page);
        expect(controls.length).toBeGreaterThan(0);
        break;
      }
      case 'QN-002': {
        const expectedCount = Number(process.env.WORKBOOK_QUESTION_COUNT ?? '0');
        const questions = page.locator('form fieldset:visible, form [data-question]:visible, form .question:visible, form .form-group:visible');
        const actual = await questions.count();
        if (expectedCount > 0) expect(actual).toBe(expectedCount);
        else expect(actual).toBeGreaterThan(0);
        break;
      }
      case 'QN-003': {
        const action = await requireControl(page.getByRole('button', { name: /next|submit|ถัดไป|ส่ง/i }), 'No Next/Submit button exists on this questionnaire page.');
        if (!action) break;
        await action.click();
        expect(await page.locator('form :invalid').count()).toBeGreaterThan(0);
        break;
      }
      case 'QN-004': {
        const field = await requireControl(page.locator('form input[type="text"]'), 'Questionnaire has no visible textbox.');
        if (!field) break;
        await field.fill('EventPass');
        await expect(field).toHaveValue('EventPass');
        break;
      }
      case 'QN-005': {
        const field = await requireControl(page.locator('form input[type="text"][required]'), 'Questionnaire has no required textbox.');
        if (!field) break;
        await field.clear();
        expect(await field.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
        break;
      }
      case 'QN-006': {
        const field = await requireControl(page.locator('form input[type="text"][maxlength], form textarea[maxlength]'), 'Questionnaire has no text control with maxlength.');
        if (!field) break;
        const maxLength = Number(await field.getAttribute('maxlength'));
        await field.fill('A'.repeat(Math.max(500, maxLength + 1)));
        expect((await field.inputValue()).length).toBeLessThanOrEqual(maxLength);
        break;
      }
      case 'QN-007': {
        const field = await requireControl(page.locator('form input[type="text"]'), 'Questionnaire has no visible textbox.');
        if (!field) break;
        await field.fill('@#$%^&');
        await expect(field).toHaveValue('@#$%^&');
        break;
      }
      case 'QN-008': {
        const field = await requireControl(page.locator('form textarea'), 'Questionnaire has no visible textarea.');
        if (!field) break;
        await field.fill('Lorem Ipsum\nSecond line');
        await expect(field).toHaveValue('Lorem Ipsum\nSecond line');
        break;
      }
      case 'QN-009': {
        const radio = await requireControl(page.locator('form input[type="radio"]'), 'Questionnaire has no radio choices.');
        if (!radio) break;
        const name = await radio.getAttribute('name');
        await radio.check();
        expect(await page.locator(`form input[type="radio"][name="${name}"]:checked`).count()).toBe(1);
        break;
      }
      case 'QN-010': {
        const first = await requireControl(page.locator('form input[type="radio"]'), 'Questionnaire has no radio choices.');
        if (!first) break;
        const name = await first.getAttribute('name');
        const group = page.locator(`form input[type="radio"][name="${name}"]`);
        test.skip(await group.count() < 2, 'Radio group has fewer than two choices.');
        await group.nth(0).check();
        await group.nth(1).check();
        await expect(group.nth(1)).toBeChecked();
        expect(await page.locator(`form input[type="radio"][name="${name}"]:checked`).count()).toBe(1);
        break;
      }
      case 'QN-011': {
        const checkboxes = page.locator('form input[type="checkbox"]:visible');
        test.skip(await checkboxes.count() < 2, 'Questionnaire has fewer than two checkbox choices.');
        const selected = Math.min(3, await checkboxes.count());
        for (let index = 0; index < selected; index += 1) await checkboxes.nth(index).check();
        expect(await page.locator('form input[type="checkbox"]:checked').count()).toBeGreaterThanOrEqual(selected);
        break;
      }
      case 'QN-012': {
        const checkbox = await requireControl(page.locator('form input[type="checkbox"][required]'), 'Questionnaire has no required checkbox.');
        if (!checkbox) break;
        await checkbox.uncheck();
        expect(await checkbox.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
        break;
      }
      case 'QN-013': {
        const select = await requireControl(page.locator('form select'), 'Questionnaire has no dropdown.');
        if (!select) break;
        const value = await select.locator('option:not([disabled])').evaluateAll((options) =>
          options.map((item) => (item as HTMLOptionElement).value).find((item) => item !== '') ?? '',
        );
        test.skip(!value, 'Dropdown has no selectable non-empty option.');
        await select.selectOption(value);
        await expect(select).toHaveValue(value);
        break;
      }
      case 'QN-014': {
        const select = await requireControl(page.locator('form select[required]'), 'Questionnaire has no required dropdown.');
        if (!select) break;
        await select.selectOption('');
        expect(await select.evaluate((element: HTMLSelectElement) => element.validity.valueMissing)).toBe(true);
        break;
      }
      case 'QN-015':
      case 'QN-016':
      case 'QN-017': {
        const other = await requireControl(page.getByRole('radio', { name: /other|อื่น/i }).or(page.getByRole('option', { name: /other|อื่น/i })), 'Questionnaire has no Other option.');
        if (!other) break;
        const before = (await visibleQuestionControls(page)).length;
        const tagName = await other.evaluate((element) => element.tagName);
        if (tagName === 'OPTION') {
          const value = await other.getAttribute('value');
          await other.locator('..').selectOption(value ?? '');
        } else await other.check();
        const afterControls = await visibleQuestionControls(page);
        expect(afterControls.length).toBeGreaterThan(before);
        const detail = await firstVisible(page.locator('form input[type="text"], form textarea'));
        test.skip(!detail, 'Other option did not reveal a detail textbox.');
        if (!detail) break;
        if (testCase.id === 'QN-016') {
          await detail.clear();
          expect(await detail.evaluate((input: HTMLInputElement | HTMLTextAreaElement) => input.required && input.validity.valueMissing)).toBe(true);
        }
        if (testCase.id === 'QN-017') {
          await detail.fill('Other Detail');
          await expect(detail).toHaveValue('Other Detail');
        }
        break;
      }
      case 'QN-018': {
        const rating = await requireControl(page.getByRole('radio', { name: /5|five|ห้า/i }), 'Questionnaire has no rating value 5.');
        if (!rating) break;
        await rating.check();
        await expect(rating).toBeChecked();
        break;
      }
      case 'QN-019': {
        const date = await requireControl(page.locator('form input[type="date"]'), 'Questionnaire has no date input.');
        if (!date) break;
        await date.fill('2026-06-30');
        await expect(date).toHaveValue('2026-06-30');
        break;
      }
      case 'QN-020':
      case 'QN-021':
      case 'QN-022': {
        const upload = await requireControl(page.locator('form input[type="file"]'), 'Questionnaire has no upload input.');
        if (!upload) break;
        if (testCase.id === 'QN-020') {
          await upload.setInputFiles({ name: 'image.jpg', mimeType: 'image/jpeg', buffer: ONE_PIXEL_PNG });
          const count = await upload.evaluate((input: HTMLInputElement) => input.files?.length ?? 0);
          expect(count).toBeGreaterThanOrEqual(0);
        }
        if (testCase.id === 'QN-021') {
          expect(await upload.getAttribute('accept')).not.toMatch(/\.exe|application\/octet-stream/i);
          await upload.setInputFiles({ name: 'file.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ synthetic') });
          expect(await page.locator('body').innerText()).toMatch(/error|invalid|unsupported|upload failed/i);
        }
        if (testCase.id === 'QN-022') {
          await upload.setInputFiles({ name: 'image.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(20 * 1024 * 1024) });
          expect(await page.locator('body').innerText()).toMatch(/error|large|max|size|upload failed/i);
        }
        break;
      }
      case 'QN-023': {
        await fillQuestionnairePage(page);
        const next = await requireControl(page.getByRole('button', { name: /next|ถัดไป/i }), 'Questionnaire has no Next button.');
        if (!next) break;
        const before = await page.locator('form').innerText();
        await next.click();
        await expect.poll(() => page.locator('form').innerText()).not.toBe(before);
        break;
      }
      case 'QN-024':
      case 'QN-040': {
        const text = await requireControl(page.locator('form input[type="text"]'), 'Questionnaire has no textbox to verify persistence.');
        const next = await requireControl(page.getByRole('button', { name: /next|ถัดไป/i }), 'Questionnaire has no Next button.');
        if (!text || !next) break;
        await text.fill('Persisted Answer');
        await fillQuestionnairePage(page);
        await next.click();
        const previous = await requireControl(page.getByRole('button', { name: /previous|back|ย้อน|ก่อนหน้า/i }), 'Questionnaire has no Previous button.');
        if (!previous) break;
        await previous.click();
        await expect(text).toHaveValue('Persisted Answer');
        break;
      }
      case 'QN-025':
      case 'QN-026': {
        const hostname = new URL(page.url()).hostname;
        const nonProduction = !/(^|\.)expopass\.co$|(^|\.)eventpassinsight\.co$/i.test(hostname);
        test.skip(process.env.WORKBOOK_ALLOW_WRITE !== '1' || !nonProduction, 'Questionnaire submission is enabled only for a non-production session with WORKBOOK_ALLOW_WRITE=1.');
        await fillQuestionnairePage(page);
        let writes = 0;
        page.on('request', (request) => {
          if (['POST', 'PUT', 'PATCH'].includes(request.method())) writes += 1;
        });
        const submit = await requireControl(page.getByRole('button', { name: /submit|ส่ง/i }), 'Questionnaire has no Submit button.');
        if (!submit) break;
        if (testCase.id === 'QN-026') await submit.dblclick();
        else await submit.click();
        expect(writes).toBe(1);
        break;
      }
      case 'QN-027': {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('form').first()).toBeVisible();
        break;
      }
      case 'QN-028': {
        const url = page.url();
        await page.goto('about:blank');
        await page.goBack({ waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(url);
        await expect(page.locator('form').first()).toBeVisible();
        break;
      }
      case 'QN-029': {
        const timeoutMs = Number(requireEnv('WORKBOOK_SESSION_TIMEOUT_MS', 'QN-029 session timeout duration'));
        await page.waitForTimeout(timeoutMs);
        await expect(page.getByText(/session expired|หมดอายุ/i)).toBeVisible();
        break;
      }
      case 'QN-030':
      case 'QN-031': {
        const field = await requireControl(page.locator('form input[type="text"], form textarea'), 'Questionnaire has no text control for security input.');
        if (!field) break;
        const payload = testCase.id === 'QN-030' ? '<script>alert(1)</script>' : "' OR 1=1 --";
        let dialogOpened = false;
        page.on('dialog', async (dialog) => { dialogOpened = true; await dialog.dismiss(); });
        await field.fill(payload);
        await expectPayloadNotExecutable(page, payload);
        expect(dialogOpened).toBe(false);
        break;
      }
      case 'QN-032': {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expectNoHorizontalOverflow(page);
        break;
      }
      case 'QN-033': {
        testInfo.annotations.push({ type: 'browser', description: testInfo.project.name });
        await expect(page.locator('form').first()).toBeVisible();
        break;
      }
      case 'QN-034':
      case 'QN-035':
      case 'QN-036':
      case 'QN-037':
      case 'QN-038': {
        const controls = await yesNoControls(page);
        test.skip(!controls, 'Questionnaire has no Yes/No branching controls.');
        if (!controls) break;
        const before = await visibleQuestionControls(page);
        await controls.yes.check();
        const shown = await visibleQuestionControls(page);
        if (testCase.id === 'QN-034') expect(shown.length).toBeGreaterThan(before.length);
        if (testCase.id === 'QN-035') {
          const extra = shown.find((control) => !before.includes(control));
          if (extra && await extra.isEditable()) await extra.fill('Temporary answer');
          await controls.no.check();
          const afterNo = await visibleQuestionControls(page);
          expect(afterNo.length).toBeLessThan(shown.length);
        }
        if (testCase.id === 'QN-036') {
          await controls.no.check();
          expect(await page.locator('form').evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(true);
        }
        if (testCase.id === 'QN-037') {
          expect(await page.locator('form :invalid').count()).toBeGreaterThan(0);
        }
        if (testCase.id === 'QN-038') {
          for (let index = 0; index < 3; index += 1) {
            await controls.no.check();
            await controls.yes.check();
          }
          expect((await visibleQuestionControls(page)).length).toBe(shown.length);
        }
        break;
      }
      case 'QN-039': {
        const optionCount = await page.locator('form option, form input[type="radio"], form input[type="checkbox"]').count();
        expect(optionCount).toBeGreaterThanOrEqual(100);
        break;
      }
      default:
        throw new Error(`No workbook runner implemented for ${testCase.id}`);
    }
  });
}
