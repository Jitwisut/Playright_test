import { expect, Locator, Page } from '@playwright/test';
import { TARGET_URL } from '../playwright.config';

export type FormValidity = {
  valid: boolean;
  valueMissing: boolean;
  typeMismatch: boolean;
  patternMismatch: boolean;
  tooLong: boolean;
  tooShort: boolean;
  validationMessage: string;
};

export type FileState = {
  accept: string | null;
  multiple: boolean;
  count: number;
  names: string[];
  feedback: string;
};

export class RegistrationPage {
  readonly page: Page;
  readonly form: Locator;
  readonly email: Locator;
  readonly confirmEmail: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly jobTitle: Locator;
  readonly jobTitleOther: Locator;
  readonly company: Locator;
  readonly position: Locator;
  readonly mobile: Locator;
  readonly mobileCountryCode: Locator;
  readonly country: Locator;
  readonly countryCombobox: Locator;
  readonly color: Locator;
  readonly colorPreview: Locator;
  readonly industryOptions: Locator;
  readonly profileFile: Locator;
  readonly uploadButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('form#registerV5Form');
    this.email = page.getByLabel('Email (อีเมล)', { exact: true });
    this.confirmEmail = page.getByLabel('Confirm Email', { exact: true });
    this.firstName = page.locator('#pf_userFname');
    this.lastName = page.locator('#pf_userLname');
    this.jobTitle = page.locator('#pf_userTitle');
    this.jobTitleOther = page.locator('#pf_userTitle_other');
    this.company = page.locator('#pf_companyName');
    this.position = page.locator('#pf_position');
    this.mobile = page.locator('#pf_mobile');
    this.mobileCountryCode = page.getByRole('combobox', { name: 'Telephone country code' });
    this.country = page.locator('#pf_countryID');
    this.countryCombobox = page.getByRole('combobox', { name: '-- Select --' });
    this.color = page.locator('#pf_color');
    this.colorPreview = page.locator('[data-for="color"] [title="click to change color"]');
    this.industryOptions = page.getByRole('radio');
    this.profileFile = page.locator('input[type="file"][name="imgProfile"]');
    this.uploadButton = page.getByRole('button', { name: /Upload Profile Only 1 pic/ });
    this.submitButton = page.getByRole('button', { name: 'Submit', exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await this.form.waitFor({ state: 'visible' });
  }

  async waitUntilReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.form.waitFor({ state: 'visible' });
  }

  async fillEmail(value: string): Promise<void> {
    await this.email.fill(value);
  }

  async fillConfirmEmail(value: string): Promise<void> {
    await this.confirmEmail.fill(value);
  }

  async fillFirstName(value: string): Promise<void> {
    await this.firstName.fill(value);
  }

  async fillLastName(value: string): Promise<void> {
    await this.lastName.fill(value);
  }

  async fillCompany(value: string): Promise<void> {
    await this.company.fill(value);
  }

  async fillPosition(value: string): Promise<void> {
    await this.position.fill(value);
  }

  async fillMobile(value: string): Promise<void> {
    await this.mobile.fill(value);
  }

  async selectJobTitle(label: string): Promise<void> {
    await this.jobTitle.selectOption({ label });
    if (label === 'Other' && await this.jobTitleOther.isVisible()) {
      await this.jobTitleOther.fill('Synthetic QA title');
    }
  }

  async selectCountry(label: string): Promise<void> {
    await this.country.selectOption({ label });
  }

  async clearCountry(): Promise<void> {
    await this.country.selectOption({ label: 'Select country' });
  }

  async selectColor(value: string): Promise<void> {
    await this.color.fill(value);
  }

  async selectIndustry(label: string): Promise<void> {
    await this.page.getByRole('radio', { name: label, exact: true }).check();
  }

  async uploadProfile(file: string | { name: string; mimeType: string; buffer: Buffer } | Array<string>): Promise<void> {
    await this.profileFile.setInputFiles(file);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async fillMinimumValidForm(): Promise<void> {
    await this.fillFirstName('Test');
    await this.fillLastName('Automation');
    await this.selectJobTitle('Mr.');
    await this.selectIndustry('Energy');
  }

  async getValidity(locator: Locator): Promise<FormValidity> {
    return locator.evaluate((element) => {
      const input = element as HTMLInputElement | HTMLSelectElement;
      const validity = input.validity;
      return {
        valid: validity.valid,
        valueMissing: validity.valueMissing,
        typeMismatch: validity.typeMismatch,
        patternMismatch: validity.patternMismatch,
        tooLong: validity.tooLong,
        tooShort: validity.tooShort,
        validationMessage: input.validationMessage,
      };
    });
  }

  async getValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  async getFormValues(): Promise<Record<string, string>> {
    return this.form.evaluate((form) => {
      const result: Record<string, string> = {};
      for (const element of Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[name]'))) {
        if (element.type === 'radio' && !(element as HTMLInputElement).checked) continue;
        result[element.name] = element.value;
      }
      return result;
    });
  }

  async getFieldFeedback(id: string): Promise<string> {
    const feedback = this.page.locator(`#${id}`);
    if (await feedback.count() === 0) return '';
    return (await feedback.first().textContent())?.trim() ?? '';
  }

  async getVisibleAlerts(): Promise<string[]> {
    return this.form.locator('[role="alert"]').evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = window.getComputedStyle(element);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
        .map((element) => element.textContent?.trim() ?? '')
        .filter(Boolean),
    );
  }

  async getFileState(): Promise<FileState> {
    return this.profileFile.evaluate((element) => {
      const input = element as HTMLInputElement;
      const feedback = document.querySelector('#pf_imgProfile_feedback')?.textContent?.trim() ?? '';
      return {
        accept: input.getAttribute('accept'),
        multiple: input.multiple,
        count: input.files?.length ?? 0,
        names: input.files ? Array.from(input.files).map((file) => file.name) : [],
        feedback,
      };
    });
  }

  async isCaptchaPresent(): Promise<boolean> {
    return await this.page.locator('iframe[title*="hCaptcha" i]').count() > 0;
  }

  captchaCheckbox(): Locator {
    return this.page
      .frameLocator('iframe[title*="checkbox for hCaptcha" i]')
      .getByRole('checkbox', { name: /I am human/i });
  }

  async hasHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  }

  async formCheckValidity(): Promise<boolean> {
    return this.form.evaluate((form) => (form as HTMLFormElement).checkValidity());
  }

  async assertFormVisible(): Promise<void> {
    await expect(this.form).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
