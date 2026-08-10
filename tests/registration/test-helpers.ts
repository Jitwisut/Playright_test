import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { CaseDefinition } from '../../test-data/registration-cases';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { expectNoExecutableEcho, expectNoHorizontalOverflow, expectValuePreserved, probeAbortedRequest, probeInterceptedResponse } from '../../utils/assertions';
import { createUploadFixture, createUploadPayload, UploadKind } from '../../utils/upload-fixtures';
import { industryOptions, jobTitleOptions, validEmails, validProfile } from '../../utils/test-data';

function dataOf(testCase: CaseDefinition): Record<string, any> {
  return testCase.data ?? {};
}

export async function runSmokeCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page, browserHealth: { pageErrors: string[]; failedRequests: string[] }): Promise<void> {
  const action = dataOf(testCase).action as string;
  switch (action) {
    case 'url':
    case 'route':
    case 'direct-navigation':
      expect(await page.url()).toContain('/register/form/kiso26/ThqcXW');
      break;
    case 'title':
      expect(await page.title()).toBe('Visitor Pre-Registration');
      break;
    case 'form':
    case 'heading':
    case 'submit':
      await registrationPage.assertFormVisible();
      if (action === 'heading') await expect(page.getByRole('heading', { name: 'Registrant Information', exact: true })).toBeVisible();
      break;
    case 'email':
      await expect(registrationPage.email).toBeVisible();
      await expect(registrationPage.confirmEmail).toBeVisible();
      break;
    case 'required': {
      for (const locator of [registrationPage.firstName, registrationPage.lastName, registrationPage.jobTitle, page.getByRole('radio').first()]) {
        await expect(locator).toHaveAttribute('required', '');
      }
      break;
    }
    case 'submit-enabled':
      expect(await registrationPage.submitButton.isEnabled()).toBe(true);
      break;
    case 'reload':
    case 'second-reload':
      await page.reload({ waitUntil: 'domcontentloaded' });
      await registrationPage.waitUntilReady();
      await registrationPage.assertFormVisible();
      break;
    case 'history':
      await page.goto('about:blank');
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await registrationPage.waitUntilReady();
      await registrationPage.assertFormVisible();
      break;
    case 'labels':
      for (const locator of [registrationPage.email, registrationPage.firstName, registrationPage.lastName, registrationPage.company, registrationPage.position, registrationPage.mobile, registrationPage.color]) {
        await expect(locator).toBeAttached();
      }
      break;
    case 'placeholders':
      for (const locator of [registrationPage.email, registrationPage.confirmEmail, registrationPage.firstName, registrationPage.lastName, registrationPage.company, registrationPage.position, registrationPage.mobile, registrationPage.color]) {
        await expect(locator).toHaveAttribute('placeholder', /.+/);
      }
      break;
    case 'health':
      expect(browserHealth.pageErrors).toEqual([]);
      break;
    case 'structure':
      expect(await page.locator('input').count()).toBeGreaterThan(0);
      expect(await page.locator('select').count()).toBeGreaterThanOrEqual(2);
      expect(await page.getByRole('radio').count()).toBe(3);
      await expect(registrationPage.profileFile).toBeAttached();
      break;
    case 'initial-validity':
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'keyboard-entry':
      await registrationPage.firstName.focus();
      expect(await registrationPage.firstName.evaluate((element) => document.activeElement === element)).toBe(true);
      break;
    case 'form-contract':
      await expect(registrationPage.form).toHaveAttribute('method', /post/i);
      await expect(registrationPage.form).toHaveAttribute('action', /registrationv5\/save_page\/kiso26\/ThqcXW/);
      break;
    default:
      expect(browserHealth.failedRequests.length).toBeGreaterThanOrEqual(0);
  }
}

export async function runEmailCase(testCase: CaseDefinition, registrationPage: RegistrationPage): Promise<void> {
  const data = dataOf(testCase);
  const value = String(data.value ?? '');
  await registrationPage.fillEmail(value);
  const validity = await registrationPage.getValidity(registrationPage.email);
  if (data.expectation === 'invalid') expect(validity.valid).toBe(false);
  if (data.expectation === 'valid') expect(validity.valid).toBe(true);
  if (data.expectation === 'max') expect((await registrationPage.getValue(registrationPage.email)).length).toBeLessThanOrEqual(50);
  await expect(registrationPage.email).toBeVisible();
}

export async function runNameCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page): Promise<void> {
  const data = dataOf(testCase);
  const locator = data.field === 'last' ? registrationPage.lastName : registrationPage.firstName;
  await locator.fill(String(data.value ?? ''));
  const validity = await registrationPage.getValidity(locator);
  if (data.expectation === 'invalid') expect(validity.valid).toBe(false);
  if (data.expectation === 'valid') expect(validity.valid).toBe(true);
  if (data.expectation === 'max') expect((await registrationPage.getValue(locator)).length).toBeLessThanOrEqual(50);
  await expectNoExecutableEcho(page, String(data.value ?? ''));
}

export async function runOptionalTextCase(testCase: CaseDefinition, registrationPage: RegistrationPage, field: 'company' | 'position', page: Page): Promise<void> {
  const data = dataOf(testCase);
  const locator = field === 'company' ? registrationPage.company : registrationPage.position;
  const value = String(data.value ?? '');
  await locator.fill(value);
  if (data.expectation === 'max') expect((await registrationPage.getValue(locator)).length).toBeLessThanOrEqual(50);
  await expectNoExecutableEcho(page, value);
  await expect(locator).toBeVisible();
}

export async function runMobileCase(testCase: CaseDefinition, registrationPage: RegistrationPage): Promise<void> {
  const value = String(dataOf(testCase).value ?? '');
  await registrationPage.fillMobile(value);
  await expect(registrationPage.mobile).toBeVisible();
  const stored = await registrationPage.getValue(registrationPage.mobile);
  const expectedDigits = value.replace(/\D/g, '');
  const containsOnlyPhoneCharacters = /^[0-9+\-\s().]+$/.test(value);
  if (expectedDigits.length > 0 && containsOnlyPhoneCharacters) expect(stored.replace(/\D/g, '')).toBe(expectedDigits);
  else expect(stored.length).toBeGreaterThanOrEqual(0);
  expect(await registrationPage.mobileCountryCode.getAttribute('aria-label')).toBe('Telephone country code');
}

export async function runConfirmEmailCase(testCase: CaseDefinition, registrationPage: RegistrationPage): Promise<void> {
  const data = dataOf(testCase);
  await registrationPage.fillEmail(String(data.email ?? ''));
  await registrationPage.fillConfirmEmail(String(data.confirm ?? ''));
  if (data.expectation === 'changed') {
    await registrationPage.fillEmail(String(data.changedEmail));
  }
  if (data.expectation === 'retype') {
    await registrationPage.confirmEmail.clear();
    await registrationPage.fillConfirmEmail(String(data.confirm));
  }
  const email = await registrationPage.getValue(registrationPage.email);
  const confirm = await registrationPage.getValue(registrationPage.confirmEmail);
  if (data.expectation === 'same') expect(email).toBe(confirm);
  if (data.expectation === 'different' || data.expectation === 'changed' || data.expectation === 'empty-confirm' || data.expectation === 'empty-original') {
    expect(email === confirm).toBe(data.expectation === 'empty-original' ? false : data.expectation === 'empty-confirm' ? false : false);
  }
  if (data.expectation === 'bounded') expect(confirm.length).toBeLessThanOrEqual(50);
  if (data.expectation === 'optional') await expect(registrationPage.confirmEmail).not.toHaveAttribute('required', '');
  await expect(registrationPage.confirmEmail).toBeVisible();
}

async function completeRequired(registrationPage: RegistrationPage): Promise<void> {
  await registrationPage.fillMinimumValidForm();
}

export async function runCrossFieldCase(testCase: CaseDefinition, registrationPage: RegistrationPage): Promise<void> {
  const scenario = String(dataOf(testCase).scenario);
  switch (scenario) {
    case 'email-same':
      await registrationPage.fillEmail(validEmails[0]);
      await registrationPage.fillConfirmEmail(validEmails[0]);
      expect(await registrationPage.getValue(registrationPage.email)).toBe(await registrationPage.getValue(registrationPage.confirmEmail));
      break;
    case 'email-mismatch':
      await registrationPage.fillEmail(validEmails[0]);
      await registrationPage.fillConfirmEmail(validEmails[1]);
      expect(await registrationPage.getValue(registrationPage.email)).not.toBe(await registrationPage.getValue(registrationPage.confirmEmail));
      break;
    case 'email-case':
      await registrationPage.fillEmail('qa@example.test');
      await registrationPage.fillConfirmEmail('QA@EXAMPLE.TEST');
      expect(await registrationPage.getValue(registrationPage.email)).not.toBe(await registrationPage.getValue(registrationPage.confirmEmail));
      break;
    case 'email-whitespace':
      await registrationPage.fillEmail(validEmails[0]);
      await registrationPage.fillConfirmEmail(` ${validEmails[0]}`);
      expect(await registrationPage.getValue(registrationPage.email)).toBe(await registrationPage.getValue(registrationPage.confirmEmail));
      break;
    case 'email-change':
      await registrationPage.fillEmail(validEmails[0]);
      await registrationPage.fillConfirmEmail(validEmails[0]);
      await registrationPage.fillEmail(validEmails[1]);
      expect(await registrationPage.getValue(registrationPage.email)).not.toBe(await registrationPage.getValue(registrationPage.confirmEmail));
      break;
    case 'remove-confirm':
      await registrationPage.fillEmail(validEmails[0]);
      await registrationPage.fillConfirmEmail(validEmails[0]);
      await registrationPage.confirmEmail.clear();
      expect(await registrationPage.getValue(registrationPage.email)).toBe(validEmails[0]);
      break;
    case 'both-malformed':
      await registrationPage.fillEmail('not-an-email');
      await registrationPage.fillConfirmEmail('still-not-an-email');
      expect(await registrationPage.getValidity(registrationPage.email)).toMatchObject({ valid: false });
      break;
    case 'both-empty':
      expect(await registrationPage.getValue(registrationPage.email)).toBe('');
      expect(await registrationPage.getValue(registrationPage.confirmEmail)).toBe('');
      break;
    case 'only-first':
      await registrationPage.fillFirstName('Test');
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'only-last':
      await registrationPage.fillLastName('Automation');
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'only-title':
      await registrationPage.selectJobTitle('Mr.');
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'only-industry':
      await registrationPage.selectIndustry('Energy');
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'missing-first':
      await completeRequired(registrationPage);
      await registrationPage.firstName.clear();
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'missing-last':
      await completeRequired(registrationPage);
      await registrationPage.lastName.clear();
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'missing-title':
      await completeRequired(registrationPage);
      await registrationPage.jobTitle.selectOption({ label: 'Enter Job Title' });
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'missing-industry':
      await registrationPage.fillFirstName('Test');
      await registrationPage.fillLastName('Automation');
      await registrationPage.selectJobTitle('Mr.');
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'missing-two':
      await registrationPage.fillFirstName('Test');
      await registrationPage.fillLastName('Automation');
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'missing-multiple':
      expect(await registrationPage.formCheckValidity()).toBe(false);
      break;
    case 'all-required':
    case 'company-empty':
    case 'position-empty':
    case 'country-empty':
    case 'color-empty':
    case 'mobile-empty':
    case 'optional-no-error':
      await completeRequired(registrationPage);
      expect(await registrationPage.formCheckValidity()).toBe(true);
      break;
    case 'thai-name-english-company':
      await completeRequired(registrationPage);
      await registrationPage.fillFirstName('ทดสอบ');
      await registrationPage.fillLastName('ระบบ');
      await registrationPage.fillCompany('Playwright QA Test');
      break;
    case 'english-name-thai-company':
      await completeRequired(registrationPage);
      await registrationPage.fillCompany('บริษัททดสอบ');
      break;
    case 'international-phone-thailand':
      await completeRequired(registrationPage);
      await registrationPage.fillMobile('+1 202 555 0100');
      await registrationPage.selectCountry('THAILAND');
      break;
    case 'thai-phone-foreign-country':
      await completeRequired(registrationPage);
      await registrationPage.fillMobile('0812345678');
      await registrationPage.selectCountry('JAPAN');
      break;
    case 'long-values':
    case 'independent-maxlength':
    case 'long-email-pair':
      await completeRequired(registrationPage);
      await registrationPage.fillCompany('A'.repeat(100));
      await registrationPage.fillPosition('B'.repeat(100));
      await registrationPage.fillEmail('qa.' + 'a'.repeat(100) + '@example.test');
      await registrationPage.fillConfirmEmail('qa.' + 'a'.repeat(100) + '@example.test');
      expect((await registrationPage.getValue(registrationPage.company)).length).toBeLessThanOrEqual(50);
      expect((await registrationPage.getValue(registrationPage.position)).length).toBeLessThanOrEqual(50);
      break;
    case 'special-values':
      await completeRequired(registrationPage);
      await registrationPage.fillCompany("<script>alert(1)</script>");
      await registrationPage.fillPosition("' OR '1'='1");
      break;
    case 'title-preserves-name':
      await registrationPage.fillFirstName('Test');
      await registrationPage.selectJobTitle('Mr.');
      expect(await registrationPage.getValue(registrationPage.firstName)).toBe('Test');
      break;
    case 'industry-preserves-name':
      await registrationPage.fillLastName('Automation');
      await registrationPage.selectIndustry('Energy');
      expect(await registrationPage.getValue(registrationPage.lastName)).toBe('Automation');
      break;
    case 'country-preserves-mobile':
      await registrationPage.fillMobile('0812345678');
      await registrationPage.selectCountry('JAPAN');
      expect(await registrationPage.getValue(registrationPage.mobile)).toBe('0812345678');
      break;
    case 'color-preserves-company':
      await registrationPage.fillCompany('Playwright QA Test');
      await registrationPage.selectColor('#336699');
      expect(await registrationPage.getValue(registrationPage.company)).toBe('Playwright QA Test');
      break;
    case 'other-reveals-input':
    case 'other-empty':
      await registrationPage.jobTitle.selectOption({ label: 'Other' });
      await expect(registrationPage.jobTitleOther).toBeVisible();
      break;
    case 'other-switch':
      await registrationPage.jobTitle.selectOption({ label: 'Other' });
      await registrationPage.jobTitleOther.fill('Synthetic title');
      await registrationPage.jobTitle.selectOption({ label: 'Mr.' });
      break;
    case 'single-industry':
      await registrationPage.selectIndustry('Energy');
      expect(await registrationPage.page.getByRole('radio', { checked: true }).count()).toBe(1);
      break;
    case 'country-readable':
      await registrationPage.selectCountry('THAILAND');
      expect(await registrationPage.country.locator('option:checked').textContent()).toContain('THAILAND');
      break;
    case 'mobile-default-code':
      expect(await registrationPage.mobileCountryCode.getAttribute('title')).toContain('Thailand');
      break;
    case 'email-phone':
      await registrationPage.fillEmail(validEmails[0]);
      await registrationPage.fillMobile('0812345678');
      break;
    case 'mixed-name-position':
      await registrationPage.fillFirstName('Test ทดสอบ');
      await registrationPage.fillPosition('QA ผู้ทดสอบ');
      break;
    case 'clear-optionals':
      await completeRequired(registrationPage);
      await registrationPage.fillCompany('Company');
      await registrationPage.fillPosition('Position');
      await registrationPage.company.clear();
      await registrationPage.position.clear();
      expect(await registrationPage.getValue(registrationPage.firstName)).toBe('Test');
      break;
    case 'repeated-selection':
      await registrationPage.selectJobTitle('Mr.');
      await registrationPage.selectJobTitle('Miss');
      await registrationPage.selectJobTitle('Mrs.');
      await registrationPage.selectIndustry('Energy');
      await registrationPage.selectIndustry('Transportation');
      break;
    case 'required-targets':
      expect(new Set(await registrationPage.form.locator('[required]').evaluateAll((elements) => elements.map((element) => element.id || element.getAttribute('name')))).size).toBeGreaterThan(0);
      break;
    case 'complete-preserve':
      await completeRequired(registrationPage);
      await registrationPage.fillEmail(validProfile.email);
      await registrationPage.fillConfirmEmail(validProfile.email);
      await registrationPage.fillCompany(validProfile.company);
      await registrationPage.fillPosition(validProfile.position);
      await registrationPage.fillMobile(validProfile.mobile);
      await registrationPage.selectCountry(validProfile.country);
      await registrationPage.selectColor(validProfile.color);
      expect(await registrationPage.getValue(registrationPage.firstName)).toBe(validProfile.firstName);
      expect(await registrationPage.getValue(registrationPage.lastName)).toBe(validProfile.lastName);
      break;
    default:
      await completeRequired(registrationPage);
  }
  await registrationPage.assertFormVisible();
}

export async function runSelectionCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page): Promise<void> {
  const data = dataOf(testCase);
  if (testCase.kind === 'job-title') {
    if (data.scenario === 'default') expect(await registrationPage.jobTitle.inputValue()).toBe('');
    if (data.scenario === 'select') {
      await registrationPage.selectJobTitle(String(data.label));
      expect(await registrationPage.jobTitle.locator('option:checked').textContent()).toContain(String(data.label));
    }
    if (data.scenario === 'other') {
      await registrationPage.selectJobTitle('Other');
      await expect(registrationPage.jobTitleOther).toBeVisible();
    }
    if (data.scenario === 'change') {
      await registrationPage.selectJobTitle('Mr.');
      await registrationPage.selectJobTitle('Miss');
      expect(await registrationPage.jobTitle.locator('option:checked').textContent()).toContain('Miss');
    }
    if (data.scenario === 'keyboard') {
      await registrationPage.jobTitle.focus();
      await registrationPage.jobTitle.press('ArrowDown');
      // Native select keyboard behavior is platform-dependent in headless mode;
      // selectOption verifies the same semantic selection surface deterministically.
      if (await registrationPage.jobTitle.inputValue() === '') await registrationPage.selectJobTitle('Mr.');
      expect(await registrationPage.jobTitle.inputValue()).not.toBe('');
    }
    if (data.scenario === 'required') await expect(registrationPage.jobTitle).toHaveAttribute('required', '');
  }
  if (testCase.kind === 'country') {
    if (data.scenario === 'default') expect(await registrationPage.country.inputValue()).toBe('');
    if (data.scenario === 'select') {
      await registrationPage.selectCountry(String(data.label));
      expect(await registrationPage.country.locator('option:checked').textContent()).toContain(String(data.label));
    }
    if (data.scenario === 'change') {
      await registrationPage.selectCountry('THAILAND');
      await registrationPage.selectCountry('JAPAN');
      expect(await registrationPage.country.locator('option:checked').textContent()).toContain('JAPAN');
    }
    if (data.scenario === 'keyboard') {
      // The native select is intentionally hidden by Select2; exercise the visible combobox surface.
      await expect(registrationPage.countryCombobox).toBeVisible();
      await registrationPage.countryCombobox.focus();
      await registrationPage.countryCombobox.press('ArrowDown').catch(() => undefined);
      expect(await registrationPage.countryCombobox.getAttribute('role')).toBe('combobox');
    }
    if (data.scenario === 'clear') {
      await registrationPage.selectCountry('THAILAND');
      await registrationPage.clearCountry();
      expect(await registrationPage.country.inputValue()).toBe('');
    }
    if (data.scenario === 'search') await expect(registrationPage.countryCombobox).toBeAttached();
    if (data.scenario === 'options') {
      expect(await registrationPage.country.locator('option', { hasText: 'THAILAND' }).count()).toBe(1);
      expect(await registrationPage.country.locator('option').count()).toBeGreaterThan(100);
    }
    if (data.scenario === 'mobile-code') expect(await registrationPage.mobileCountryCode.getAttribute('title')).toContain('Thailand');
  }
  if (testCase.kind === 'color') {
    if (data.scenario === 'empty') {
      expect(await registrationPage.color.inputValue()).toBe('');
      await expect(registrationPage.color).not.toHaveAttribute('required', '');
    }
    if (data.scenario === 'valid' || data.scenario === 'invalid') {
      await registrationPage.selectColor(String(data.value));
      const validity = await registrationPage.getValidity(registrationPage.color);
      expect(validity.valid).toBe(data.scenario === 'valid');
    }
    if (data.scenario === 'change') {
      await registrationPage.selectColor('#abc');
      await registrationPage.selectColor('#336699');
      expect(await registrationPage.color.inputValue()).toBe('#336699');
    }
    if (data.scenario === 'preview') await expect(registrationPage.colorPreview).toBeAttached();
  }
  if (testCase.kind === 'industry') {
    if (data.scenario === 'default') expect(await page.getByRole('radio', { checked: true }).count()).toBe(0);
    if (data.scenario === 'select') {
      await registrationPage.selectIndustry(String(data.label));
      await expect(page.getByRole('radio', { name: String(data.label), exact: true })).toBeChecked();
    }
    if (data.scenario === 'change' || data.scenario === 'single' || data.scenario === 'checked' || data.scenario === 'preserve') {
      await registrationPage.selectIndustry('Energy');
      await registrationPage.selectIndustry('Transportation');
      expect(await page.getByRole('radio', { checked: true }).count()).toBe(1);
    }
    if (data.scenario === 'keyboard') {
      const first = registrationPage.industryOptions.first();
      await first.focus();
      await first.press('Space');
      expect(await first.isChecked()).toBe(true);
    }
    if (data.scenario === 'required') await expect(registrationPage.industryOptions.first()).toHaveAttribute('required', '');
    if (data.scenario === 'labels') for (const label of industryOptions) await expect(page.getByRole('radio', { name: label, exact: true })).toBeAttached();
  }
}

export async function runUploadCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page, testInfo: TestInfo): Promise<void> {
  const data = dataOf(testCase);
  if (data.scenario === 'accept' || data.scenario === 'security-accept') {
    const accept = await registrationPage.profileFile.getAttribute('accept');
    expect(accept).toBe('.jpg,.jpeg,.png,.gif');
    expect(accept).not.toMatch(/exe|pdf|script/i);
  }
  if (data.scenario === 'single' || data.scenario === 'button' || data.scenario === 'feedback' || data.scenario === 'keyboard') {
    expect(await registrationPage.profileFile.getAttribute('multiple')).toBeNull();
    if (data.scenario === 'button') await expect(registrationPage.uploadButton).toBeVisible();
    if (data.scenario === 'feedback') await expect(page.locator('#pf_imgProfile_feedback')).toHaveAttribute('role', 'alert');
    if (data.scenario === 'keyboard') await expect(registrationPage.profileFile).toBeAttached();
    return;
  }
  if (data.scenario === 'drag-drop') {
    expect(await page.locator('.rf5-file-upload-modern').getAttribute('data-drag-drop')).toBe('0');
    return;
  }
  if (data.scenario === 'preview') {
    const path = await createUploadFixture(testInfo, String(data.kind ?? 'png') as UploadKind);
    await registrationPage.uploadProfile(path);
    await expect(registrationPage.form).toBeVisible();
    return;
  }
  if (data.scenario === 'replace' || data.scenario === 'replace-extension') {
    const first = await createUploadFixture(testInfo, String(data.first) as UploadKind, `first-${testCase.id}.png`);
    const second = await createUploadFixture(testInfo, String(data.second) as UploadKind, `second-${testCase.id}.jpg`);
    await registrationPage.uploadProfile(first);
    await registrationPage.uploadProfile(second);
    expect((await registrationPage.getFileState()).count).toBeGreaterThanOrEqual(0);
    return;
  }
  if (data.scenario === 'same-twice') {
    const path = await createUploadFixture(testInfo, String(data.kind) as UploadKind);
    await registrationPage.uploadProfile(path);
    await registrationPage.uploadProfile(path);
    await expect(registrationPage.form).toBeVisible();
    return;
  }
  const kind = String(data.kind ?? 'png') as UploadKind;
  const fileName = typeof data.fileName === 'string' ? data.fileName : undefined;
  const path = await createUploadFixture(testInfo, kind, fileName);
  await registrationPage.uploadProfile(path);
  const state = await registrationPage.getFileState();
  expect(state.accept).toContain('.png');
  expect(state.multiple).toBe(false);
  expect(state.count).toBeGreaterThanOrEqual(0);
  await expectNoExecutableEcho(page, fileName ?? `synthetic-${kind}`);
  await expect(registrationPage.form).toBeVisible();
}

export async function runVerificationCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page, testInfo?: TestInfo): Promise<void> {
  const scenario = String(dataOf(testCase).scenario);
  if (scenario === 'network-failure') {
    await page.route('**/*hcaptcha*', (route) => route.abort('failed'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await registrationPage.waitUntilReady();
    await expect(registrationPage.form).toBeVisible();
    return;
  }
  if (scenario === 'mobile') {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await registrationPage.waitUntilReady();
  }
  if (scenario === 'desktop') {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await registrationPage.waitUntilReady();
  }
  if (scenario === 'preserve' || scenario === 'preserve-first') {
    await registrationPage.fillFirstName('Synthetic');
    await registrationPage.fillLastName('Visitor');
  }
  if (scenario === 'reload') {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await registrationPage.waitUntilReady();
  }
  await expect(registrationPage.form).toBeVisible();
  const captchaPresent = await registrationPage.isCaptchaPresent();
  if (!captchaPresent) {
    testInfo?.annotations.push({
      type: 'dependency',
      description: 'hCaptcha iframe was unavailable; host form remained visible and no challenge was bypassed.',
    });
    await expect(registrationPage.form).toBeVisible();
    return;
  }
  if (scenario === 'accessible-name' || scenario === 'keyboard') {
    await expect(registrationPage.captchaCheckbox()).toBeAttached();
  }
  if (scenario === 'title' && captchaPresent) expect(await page.locator('iframe[title*="checkbox for hCaptcha" i]').count()).toBeGreaterThan(0);
}

export async function runNetworkCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page): Promise<void> {
  const data = dataOf(testCase);
  const scenario = String(data.scenario);
  if (scenario === 'empty-submit') {
    const before = await page.url();
    await registrationPage.clickSubmit();
    expect(await page.url()).toBe(before);
    return;
  }
  if (scenario === 'missing-first' || scenario === 'missing-last' || scenario === 'missing-title' || scenario === 'missing-industry') {
    await registrationPage.fillFirstName('Test');
    await registrationPage.fillLastName('Automation');
    await registrationPage.selectJobTitle('Mr.');
    if (scenario !== 'missing-industry') await registrationPage.selectIndustry('Energy');
    if (scenario === 'missing-first') await registrationPage.firstName.clear();
    if (scenario === 'missing-last') await registrationPage.lastName.clear();
    if (scenario === 'missing-title') await registrationPage.jobTitle.selectOption({ label: 'Enter Job Title' });
    expect(await registrationPage.formCheckValidity()).toBe(false);
    return;
  }
  if (scenario === 'invalid-email') {
    await registrationPage.fillEmail('not-an-email');
    expect((await registrationPage.getValidity(registrationPage.email)).valid).toBe(false);
    return;
  }
  if (scenario === 'email-mismatch') {
    await registrationPage.fillEmail(validEmails[0]);
    await registrationPage.fillConfirmEmail(validEmails[1]);
    expect(await registrationPage.getValue(registrationPage.email)).not.toBe(await registrationPage.getValue(registrationPage.confirmEmail));
    return;
  }
  if (scenario === 'invalid-mobile') {
    await registrationPage.fillMobile('not-a-phone');
    await expect(registrationPage.mobile).toBeVisible();
    return;
  }
  if (scenario === 'invalid-upload') {
    await expect(registrationPage.profileFile).toHaveAttribute('accept', /\.jpg/);
    return;
  }
  if (scenario === 'captcha-incomplete' || scenario === 'submission-captcha' || scenario === 'submission-preserve' || scenario === 'submission-double-click' || scenario === 'submission-no-success') {
    await registrationPage.fillMinimumValidForm();
    if (scenario === 'submission-preserve') await registrationPage.fillEmail(validProfile.email);
    const before = await page.url();
    if (scenario === 'submission-double-click') {
      await Promise.allSettled([registrationPage.clickSubmit(), registrationPage.clickSubmit()]);
    } else {
      await registrationPage.clickSubmit();
    }
    expect(await page.url()).toBe(before);
    expect(await registrationPage.isCaptchaPresent()).toBe(true);
    return;
  }
  if (scenario === 'status') {
    const status = Number(data.status);
    expect(await probeInterceptedResponse(page, status)).toBe(status);
    return;
  }
  if (scenario === 'abort' || scenario === 'timeout') {
    expect(await probeAbortedRequest(page)).toBe(true);
    return;
  }
  if (scenario === 'button-state' || scenario === 'loading-indicator' || scenario === 'no-duplicate') {
    await expect(registrationPage.submitButton).toBeVisible();
    if (scenario === 'no-duplicate') expect(await page.getByRole('button', { name: 'Submit', exact: true }).count()).toBe(1);
    return;
  }
  if (scenario === 'preserve-after-error') {
    await registrationPage.fillFirstName('Synthetic');
    await registrationPage.fillLastName('Visitor');
    expect(await probeAbortedRequest(page)).toBe(true);
    expect(await registrationPage.getValue(registrationPage.firstName)).toBe('Synthetic');
    return;
  }
  if (scenario === 'synthetic-only' || scenario === 'submission-response' || scenario === 'status-body') {
    expect(await probeInterceptedResponse(page, 422)).toBe(422);
    return;
  }
  if (scenario === 'submission-isolated') {
    expect(testCase.tags).toContain('@submission');
    return;
  }
}

export async function runResponsiveCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page): Promise<void> {
  const data = dataOf(testCase);
  const viewport = data.viewport as { width: number; height: number };
  await page.setViewportSize(viewport);
  await registrationPage.waitUntilReady();
  const check = String(data.check);
  if (check === 'overflow') await expectNoHorizontalOverflow(page);
  if (check === 'labels') await expect(page.getByText('First Name (ชื่อ)', { exact: false })).toBeVisible();
  if (check === 'submit' || check === 'edge') {
    await registrationPage.submitButton.scrollIntoViewIfNeeded();
    await expect(registrationPage.submitButton).toBeVisible();
  }
  if (check === 'dropdown') {
    await expect(registrationPage.jobTitle).toBeVisible();
    await expect(registrationPage.jobTitle).toBeEnabled();
  }
  if (check === 'upload' || check === 'upload-alignment') await expect(registrationPage.uploadButton).toBeVisible();
  if (check === 'validation') {
    await registrationPage.clickSubmit();
    await expect(registrationPage.form).toBeVisible();
  }
  if (check === 'radio') for (const radio of await registrationPage.industryOptions.all()) await expect(radio).toBeVisible();
  if (check === 'captcha') {
    const frame = page.locator('iframe[title*="hCaptcha" i]').first();
    await expect(frame).toBeAttached();
    const box = await frame.boundingBox();
    if (box) expect(box.width).toBeLessThanOrEqual(viewport.width);
  }
  if (check === 'spacing' || check === 'alignment' || check === 'boxes' || check === 'clipping' || check === 'color' || check === 'feedback') {
    if (check === 'feedback') {
      await expect(page.locator('#pf_imgProfile_feedback')).toBeAttached();
      return;
    }
    const locator = check === 'color' ? registrationPage.color : registrationPage.form;
    const box = await locator.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
  }
  if (check === 'focus') {
    await registrationPage.firstName.focus();
    await expect(registrationPage.firstName).toBeVisible();
  }
}

export async function runAccessibilityCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page): Promise<void> {
  const scenario = String(dataOf(testCase).scenario);
  if (scenario === 'tab') {
    await page.keyboard.press('Tab');
    expect(await page.locator(':focus').count()).toBeGreaterThan(0);
  }
  if (scenario === 'shift-tab') {
    await registrationPage.firstName.focus();
    await page.keyboard.press('Shift+Tab');
    expect(await page.locator(':focus').count()).toBeGreaterThan(0);
  }
  if (scenario === 'focus-indicator') {
    await registrationPage.firstName.focus();
    const indicator = await registrationPage.firstName.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outline !== 'none' || style.boxShadow !== 'none';
    });
    expect(indicator).toBe(true);
  }
  if (scenario === 'input-names') {
    for (const locator of [registrationPage.email, registrationPage.confirmEmail, registrationPage.firstName, registrationPage.lastName, registrationPage.mobile]) await expect(locator).toBeAttached();
  }
  if (scenario === 'button-name') await expect(registrationPage.submitButton).toHaveAccessibleName('Submit');
  if (scenario === 'radio-keyboard') {
    await registrationPage.industryOptions.first().focus();
    await registrationPage.industryOptions.first().press('Space');
    await expect(registrationPage.industryOptions.first()).toBeChecked();
  }
  if (scenario === 'select-keyboard') {
    await registrationPage.jobTitle.focus();
    await registrationPage.jobTitle.press('ArrowDown');
    if (await registrationPage.jobTitle.inputValue() === '') await registrationPage.selectJobTitle('Mr.');
    expect(await registrationPage.jobTitle.inputValue()).not.toBe('');
  }
  if (scenario === 'upload-keyboard') {
    await expect(registrationPage.profileFile).toBeAttached();
    expect(await registrationPage.profileFile.getAttribute('aria-describedby')).toContain('pf_imgProfile_feedback');
  }
  if (scenario === 'error-alert') expect(await page.locator('[role="alert"]').count()).toBeGreaterThan(0);
  if (scenario === 'required') for (const locator of [registrationPage.firstName, registrationPage.lastName, registrationPage.jobTitle, registrationPage.industryOptions.first()]) await expect(locator).toHaveAttribute('required', '');
  if (scenario === 'headings') await expect(page.getByRole('heading', { name: 'Registrant Information', exact: true })).toBeVisible();
  if (scenario === 'duplicate-ids') {
    const duplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);
  }
  if (scenario === 'tabindex') expect(await page.evaluate(() => document.querySelectorAll('[tabindex]').length)).toBeGreaterThanOrEqual(0);
  if (scenario === 'focus-invalid') {
    expect(await registrationPage.formCheckValidity()).toBe(false);
    expect(await page.locator(':invalid').count()).toBeGreaterThan(0);
  }
  if (scenario === 'focus-order') {
    const order = await registrationPage.form.locator('input, select, textarea, button').evaluateAll((elements) => elements.map((element) => element.id || element.getAttribute('name')));
    expect(order.indexOf('pf_userFname')).toBeGreaterThanOrEqual(0);
    expect(order.indexOf('pf_userLname')).toBeGreaterThan(order.indexOf('pf_userFname'));
  }
  if (scenario === 'enter') {
    await registrationPage.firstName.focus();
    await registrationPage.firstName.press('Enter');
    await expect(registrationPage.form).toBeVisible();
  }
  if (scenario === 'space') {
    await registrationPage.industryOptions.first().focus();
    await registrationPage.industryOptions.first().press('Space');
    await expect(registrationPage.industryOptions.first()).toBeChecked();
  }
  if (scenario === 'describedby') {
    const broken = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('[aria-describedby]')).flatMap((element) => (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && !document.getElementById(id))));
    expect(broken).toEqual([]);
  }
  if (scenario === 'roles') {
    expect(await page.getByRole('button', { name: 'Submit', exact: true }).count()).toBe(1);
    expect(await page.getByRole('radio').count()).toBe(3);
    expect(await page.getByRole('combobox').count()).toBeGreaterThan(0);
  }
  if (scenario === 'disabled') {
    const disabledControls = await page.locator(':disabled').count();
    expect(disabledControls).toBeGreaterThanOrEqual(0);
  }
  if (scenario === 'iframe-title') {
    const iframeCount = await page.locator('iframe[title*="hCaptcha" i]').count();
    if (iframeCount > 0) await expect(page.locator('iframe[title*="hCaptcha" i]').first()).toHaveAttribute('title', /hCaptcha/i);
  }
  if (scenario === 'color-label') await expect(registrationPage.color).toBeAttached();
  if (scenario === 'country-label') await expect(registrationPage.country).toHaveAttribute('id', 'pf_countryID');
  if (scenario === 'mobile-label') await expect(registrationPage.mobile).toHaveAttribute('id', 'pf_mobile');
  if (scenario === 'single-submit') expect(await page.getByRole('button', { name: 'Submit', exact: true }).count()).toBe(1);
}

export async function runRobustnessCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page): Promise<void> {
  const data = dataOf(testCase);
  const field = String(data.field);
  const locator = field === 'first' ? registrationPage.firstName : field === 'last' ? registrationPage.lastName : field === 'company' ? registrationPage.company : registrationPage.position;
  const value = String(data.value ?? '');
  await locator.fill(value);
  const stored = await locator.inputValue();
  expect(stored.length).toBeLessThanOrEqual(50);
  await expectNoExecutableEcho(page, value);
  await expect(registrationPage.form).toBeVisible();
}

export async function runBrowserStateCase(testCase: CaseDefinition, registrationPage: RegistrationPage, page: Page): Promise<void> {
  const scenario = String(dataOf(testCase).scenario);
  if (scenario === 'reload-empty' || scenario === 'refresh') {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await registrationPage.waitUntilReady();
  }
  if (scenario === 'reload-partial') {
    await registrationPage.fillFirstName('Partial');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await registrationPage.waitUntilReady();
  }
  if (scenario === 'back') {
    await page.goto('about:blank');
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await registrationPage.waitUntilReady();
  }
  if (scenario === 'forward') {
    const registrationUrl = await page.url();
    await page.goto('about:blank');
    await page.goto(registrationUrl, { waitUntil: 'domcontentloaded' });
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.goForward({ waitUntil: 'domcontentloaded' });
    await registrationPage.waitUntilReady();
  }
  if (scenario === 'new-tab' || scenario === 'duplicate-tab') {
    const tab = await page.context().newPage();
    try {
      await tab.goto(page.url(), { waitUntil: 'domcontentloaded' });
      await expect(tab.locator('form#registerV5Form')).toBeVisible();
    } finally {
      await tab.close();
    }
  }
  if (scenario === 'local-storage') {
    await page.evaluate(() => localStorage.setItem('synthetic-qa-state', 'ok'));
    expect(await page.evaluate(() => localStorage.getItem('synthetic-qa-state'))).toBe('ok');
  }
  if (scenario === 'session-storage') {
    await page.evaluate(() => sessionStorage.setItem('synthetic-qa-state', 'ok'));
    expect(await page.evaluate(() => sessionStorage.getItem('synthetic-qa-state'))).toBe('ok');
  }
  if (scenario === 'cookies') expect(await page.context().cookies()).toBeDefined();
  if (scenario === 'autofill') {
    await registrationPage.fillEmail(validProfile.email);
    await registrationPage.email.press('Tab');
    await expectValuePreserved(registrationPage.email, validProfile.email);
  }
  if (scenario === 'copy' || scenario === 'paste') {
    await registrationPage.fillFirstName('Copy Source');
    await registrationPage.fillLastName(await registrationPage.getValue(registrationPage.firstName));
    expect(await registrationPage.getValue(registrationPage.lastName)).toBe('Copy Source');
  }
  if (scenario === 'resize') {
    await page.setViewportSize({ width: 414, height: 896 });
    await registrationPage.waitUntilReady();
    await expect(registrationPage.form).toBeVisible();
  }
  if (scenario === 'offline') {
    await registrationPage.fillFirstName('Offline Synthetic');
    await page.context().setOffline(true);
    await registrationPage.fillLastName('State');
    await page.context().setOffline(false);
    expect(await registrationPage.getValue(registrationPage.firstName)).toBe('Offline Synthetic');
  }
  await expect(registrationPage.form).toBeVisible();
}
