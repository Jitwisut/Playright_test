import { generateLongString } from '../utils/generators';
import { invalidEmails, mobileValues, robustnessValues, textRobustnessValues, validEmails } from '../utils/test-data';

export type CaseKind =
  | 'page'
  | 'email'
  | 'name'
  | 'company'
  | 'position'
  | 'mobile'
  | 'confirm-email'
  | 'cross-field'
  | 'job-title'
  | 'country'
  | 'color'
  | 'industry'
  | 'upload'
  | 'verification'
  | 'network'
  | 'responsive'
  | 'accessibility'
  | 'robustness'
  | 'browser-state';

export type CaseDefinition = {
  id: string;
  category: string;
  title: string;
  kind: CaseKind;
  data?: Record<string, unknown>;
  expected: string;
  tags: string[];
  automated: boolean;
};

type CaseSpec = Omit<CaseDefinition, 'id' | 'category'>;

function range(start: number, category: string, specs: CaseSpec[]): CaseDefinition[] {
  return specs.map((spec, index) => ({
    ...spec,
    id: `TC${String(start + index).padStart(3, '0')}`,
    category,
  }));
}

const smoke = range(1, 'Smoke / Page / Basic Behavior', [
  { title: 'Registration URL opens successfully', kind: 'page', data: { action: 'url' }, expected: 'The target URL loads without navigation failure.', tags: ['@smoke', '@critical'], automated: true },
  { title: 'Loaded URL remains on the registration route', kind: 'page', data: { action: 'route' }, expected: 'The browser remains on the expected registration route.', tags: ['@smoke'], automated: true },
  { title: 'Page title is present and meaningful', kind: 'page', data: { action: 'title' }, expected: 'The title is Visitor Pre-Registration.', tags: ['@smoke'], automated: true },
  { title: 'Registration form is rendered', kind: 'page', data: { action: 'form' }, expected: 'The registerV5Form element is visible.', tags: ['@smoke', '@critical'], automated: true },
  { title: 'Registrant Information heading is visible', kind: 'page', data: { action: 'heading' }, expected: 'The main form heading is visible.', tags: ['@smoke'], automated: true },
  { title: 'Email controls are available', kind: 'page', data: { action: 'email' }, expected: 'Email and confirmation controls are visible.', tags: ['@smoke'], automated: true },
  { title: 'Required controls are marked in the DOM', kind: 'page', data: { action: 'required' }, expected: 'First name, last name, job title and industry expose required semantics.', tags: ['@smoke', '@validation'], automated: true },
  { title: 'Submit button is visible', kind: 'page', data: { action: 'submit' }, expected: 'A named Submit button is visible.', tags: ['@smoke', '@critical'], automated: true },
  { title: 'Submit button is enabled in the initial state', kind: 'page', data: { action: 'submit-enabled' }, expected: 'The button is enabled and client validation controls the incomplete form.', tags: ['@smoke'], automated: true },
  { title: 'Reload keeps the form usable', kind: 'page', data: { action: 'reload' }, expected: 'The form is visible after reload.', tags: ['@smoke'], automated: true },
  { title: 'Direct navigation renders the form', kind: 'page', data: { action: 'direct-navigation' }, expected: 'Navigating directly to the target URL renders the form.', tags: ['@smoke'], automated: true },
  { title: 'Back and forward navigation recover the form', kind: 'page', data: { action: 'history' }, expected: 'The form is usable after browser history navigation.', tags: ['@smoke'], automated: true },
  { title: 'Visible labels map to their controls', kind: 'page', data: { action: 'labels' }, expected: 'Core fields have associated labels.', tags: ['@smoke', '@accessibility'], automated: true },
  { title: 'Core placeholders are present', kind: 'page', data: { action: 'placeholders' }, expected: 'Core text fields expose helpful placeholders.', tags: ['@smoke'], automated: true },
  { title: 'No critical page error is recorded during load', kind: 'page', data: { action: 'health' }, expected: 'No first-party page error is recorded during the initial load.', tags: ['@smoke', '@critical'], automated: true },
  { title: 'Page rendering contains the expected control groups', kind: 'page', data: { action: 'structure' }, expected: 'The form has the expected inputs, select controls, radio group and upload control.', tags: ['@smoke'], automated: true },
  { title: 'Initial required fields are invalid before entry', kind: 'page', data: { action: 'initial-validity' }, expected: 'The required form is not valid while required values are empty.', tags: ['@smoke', '@validation'], automated: true },
  { title: 'Keyboard focus can enter the registration form', kind: 'page', data: { action: 'keyboard-entry' }, expected: 'Keyboard focus reaches an interactive form control.', tags: ['@smoke', '@accessibility'], automated: true },
  { title: 'The page remains usable after a second reload', kind: 'page', data: { action: 'second-reload' }, expected: 'The form remains visible after repeated reload.', tags: ['@smoke'], automated: true },
  { title: 'Form method and action are configured', kind: 'page', data: { action: 'form-contract' }, expected: 'The form exposes POST and the expected registration endpoint.', tags: ['@smoke'], automated: true },
]);

const email = range(21, 'Field Validation', [
  { title: 'Optional email accepts an empty value', kind: 'email', data: { value: '', expectation: 'valid' }, expected: 'An empty optional email does not create a type or pattern error.', tags: ['@validation'], automated: true },
  { title: 'Email accepts a standard synthetic address', kind: 'email', data: { value: validEmails[0], expectation: 'valid' }, expected: 'The standard synthetic address is accepted by client constraints.', tags: ['@validation'], automated: true },
  { title: 'Email accepts plus addressing', kind: 'email', data: { value: validEmails[1], expectation: 'valid' }, expected: 'Plus addressing is handled without a page error.', tags: ['@validation'], automated: true },
  { title: 'Email accepts a subdomain', kind: 'email', data: { value: validEmails[2], expectation: 'valid' }, expected: 'A subdomain address is accepted.', tags: ['@validation'], automated: true },
  { title: 'Email accepts uppercase characters', kind: 'email', data: { value: validEmails[3], expectation: 'valid' }, expected: 'Uppercase email text is handled.', tags: ['@validation'], automated: true },
  { title: 'Email rejects a value without an at sign', kind: 'email', data: { value: invalidEmails[0], expectation: 'invalid' }, expected: 'The browser reports an email type or pattern mismatch.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email rejects a missing domain', kind: 'email', data: { value: invalidEmails[1], expectation: 'invalid' }, expected: 'The browser reports an invalid email value.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email rejects a missing username', kind: 'email', data: { value: invalidEmails[2], expectation: 'invalid' }, expected: 'The browser reports an invalid email value.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email rejects multiple at signs', kind: 'email', data: { value: invalidEmails[3], expectation: 'invalid' }, expected: 'The browser reports an invalid email value.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles an embedded space', kind: 'email', data: { value: invalidEmails[4], expectation: 'invalid' }, expected: 'The value is rejected or clearly marked invalid.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles leading whitespace', kind: 'email', data: { value: invalidEmails[5], expectation: 'handled' }, expected: 'Whitespace is not executed and the field remains stable.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles trailing whitespace', kind: 'email', data: { value: invalidEmails[6], expectation: 'handled' }, expected: 'Whitespace is not executed and the field remains stable.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles a missing top-level domain', kind: 'email', data: { value: invalidEmails[7], expectation: 'invalid' }, expected: 'The value is rejected by the email constraint.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles a Unicode local part', kind: 'email', data: { value: invalidEmails[9], expectation: 'handled' }, expected: 'Unicode input does not crash the form.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles Thai characters safely', kind: 'email', data: { value: invalidEmails[10], expectation: 'handled' }, expected: 'Thai input is handled safely without executable rendering.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles special characters safely', kind: 'email', data: { value: invalidEmails[11], expectation: 'invalid' }, expected: 'Unsupported special characters are rejected or marked invalid.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles newline input safely', kind: 'email', data: { value: 'qa@example.test\n', expectation: 'handled' }, expected: 'Newline input does not break the form.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email respects the maximum length attribute', kind: 'email', data: { value: generateLongString(70), expectation: 'max' }, expected: 'The stored value does not exceed maxlength 50.', tags: ['@validation'], automated: true },
  { title: 'Email handles a local part longer than the field limit', kind: 'email', data: { value: `qa${generateLongString(70)}@example.test`, expectation: 'max' }, expected: 'The field remains bounded by its maxlength.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email handles a long domain safely', kind: 'email', data: { value: `qa@${generateLongString(70)}.test`, expectation: 'max' }, expected: 'The field remains bounded and the page does not crash.', tags: ['@validation', '@negative'], automated: true },
]);

const names = range(41, 'Field Validation', [
  { title: 'First Name rejects an empty required value', kind: 'name', data: { field: 'first', value: '', expectation: 'invalid' }, expected: 'The required first-name control reports valueMissing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Last Name rejects an empty required value', kind: 'name', data: { field: 'last', value: '', expectation: 'invalid' }, expected: 'The required last-name control reports valueMissing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'First Name rejects one character at minlength boundary', kind: 'name', data: { field: 'first', value: 'A', expectation: 'invalid' }, expected: 'One character is shorter than minlength 2.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Last Name rejects one character at minlength boundary', kind: 'name', data: { field: 'last', value: 'B', expectation: 'invalid' }, expected: 'One character is shorter than minlength 2.', tags: ['@validation', '@negative'], automated: true },
  { title: 'First Name accepts two characters', kind: 'name', data: { field: 'first', value: 'QA', expectation: 'valid' }, expected: 'Two non-space characters meet the minimum.', tags: ['@validation'], automated: true },
  { title: 'Last Name accepts two characters', kind: 'name', data: { field: 'last', value: 'QA', expectation: 'valid' }, expected: 'Two non-space characters meet the minimum.', tags: ['@validation'], automated: true },
  { title: 'First Name accepts normal English text', kind: 'name', data: { field: 'first', value: 'Test', expectation: 'valid' }, expected: 'Normal English text is accepted.', tags: ['@validation'], automated: true },
  { title: 'First Name accepts Thai text', kind: 'name', data: { field: 'first', value: 'ทดสอบ', expectation: 'valid' }, expected: 'Thai text is accepted by the Unicode-aware pattern.', tags: ['@validation'], automated: true },
  { title: 'First Name accepts mixed Thai and English', kind: 'name', data: { field: 'first', value: 'Test ทดสอบ', expectation: 'valid' }, expected: 'Mixed language text is handled.', tags: ['@validation'], automated: true },
  { title: 'First Name accepts accented Latin characters', kind: 'name', data: { field: 'first', value: 'Élodie', expectation: 'valid' }, expected: 'Accented characters are handled.', tags: ['@validation'], automated: true },
  { title: 'First Name accepts a hyphenated value', kind: 'name', data: { field: 'first', value: 'Anne-Marie', expectation: 'valid' }, expected: 'Hyphenated text is accepted.', tags: ['@validation'], automated: true },
  { title: 'First Name handles an apostrophe', kind: 'name', data: { field: 'first', value: "O'Connor", expectation: 'handled' }, expected: 'An apostrophe does not crash or execute markup.', tags: ['@validation'], automated: true },
  { title: 'First Name handles leading spaces', kind: 'name', data: { field: 'first', value: ' Test', expectation: 'handled' }, expected: 'Leading spaces are handled consistently.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Last Name handles trailing spaces', kind: 'name', data: { field: 'last', value: 'Automation ', expectation: 'handled' }, expected: 'Trailing spaces are handled consistently.', tags: ['@validation', '@negative'], automated: true },
  { title: 'First Name handles repeated spaces', kind: 'name', data: { field: 'first', value: 'Test  User', expectation: 'handled' }, expected: 'Repeated spaces do not break the form.', tags: ['@validation'], automated: true },
  { title: 'First Name handles numeric text', kind: 'name', data: { field: 'first', value: '12345', expectation: 'handled' }, expected: 'Numeric text is handled by the client validation layer.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Last Name handles punctuation', kind: 'name', data: { field: 'last', value: 'Name.', expectation: 'handled' }, expected: 'Punctuation does not crash the form.', tags: ['@validation', '@negative'], automated: true },
  { title: 'First Name handles emoji safely', kind: 'name', data: { field: 'first', value: 'QA 😀', expectation: 'handled' }, expected: 'Emoji input remains non-executable and the page stays usable.', tags: ['@validation', '@negative'], automated: true },
  { title: 'First Name handles HTML-like text safely', kind: 'name', data: { field: 'first', value: '<b>Test</b>', expectation: 'handled' }, expected: 'HTML-like text is not rendered as markup.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Last Name handles script-like text safely', kind: 'name', data: { field: 'last', value: '<script>alert(1)</script>', expectation: 'handled' }, expected: 'Script-like text does not execute.', tags: ['@validation', '@negative'], automated: true },
  { title: 'First Name handles SQL-like text safely', kind: 'name', data: { field: 'first', value: "' OR '1'='1", expectation: 'handled' }, expected: 'SQL-like text is treated as data.', tags: ['@validation', '@negative'], automated: true },
  { title: 'First Name accepts exactly 50 characters', kind: 'name', data: { field: 'first', value: generateLongString(50), expectation: 'max' }, expected: 'The field respects maxlength 50.', tags: ['@validation'], automated: true },
  { title: 'First Name bounds 51 characters', kind: 'name', data: { field: 'first', value: generateLongString(51), expectation: 'max' }, expected: 'The stored value does not exceed maxlength 50.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Last Name bounds an extremely long value', kind: 'name', data: { field: 'last', value: generateLongString(200), expectation: 'max' }, expected: 'The field remains bounded and usable.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Last Name accepts Thai text', kind: 'name', data: { field: 'last', value: 'ระบบ', expectation: 'valid' }, expected: 'Thai last-name text is accepted.', tags: ['@validation'], automated: true },
  { title: 'Last Name accepts English text', kind: 'name', data: { field: 'last', value: 'Automation', expectation: 'valid' }, expected: 'English last-name text is accepted.', tags: ['@validation'], automated: true },
  { title: 'Last Name accepts mixed language text', kind: 'name', data: { field: 'last', value: 'Automation ระบบ', expectation: 'valid' }, expected: 'Mixed language last-name text is handled.', tags: ['@validation'], automated: true },
  { title: 'Last Name handles accented characters', kind: 'name', data: { field: 'last', value: 'Müller', expectation: 'valid' }, expected: 'Accented last-name text is handled.', tags: ['@validation'], automated: true },
  { title: 'Last Name handles a hyphenated value', kind: 'name', data: { field: 'last', value: 'Lee-Wong', expectation: 'valid' }, expected: 'Hyphenated last-name text is handled.', tags: ['@validation'], automated: true },
  { title: 'First Name handles newline input safely', kind: 'name', data: { field: 'first', value: 'Test\nUser', expectation: 'handled' }, expected: 'Newline input does not break the form.', tags: ['@validation', '@negative'], automated: true },
]);

const company = range(71, 'Field Validation', [
  { title: 'Optional Company accepts empty input', kind: 'company', data: { value: '', expectation: 'valid' }, expected: 'An empty optional company field is valid.', tags: ['@validation'], automated: true },
  { title: 'Company accepts Thai text', kind: 'company', data: { value: 'บริษัททดสอบ', expectation: 'handled' }, expected: 'Thai company text is retained safely.', tags: ['@validation'], automated: true },
  { title: 'Company accepts English text', kind: 'company', data: { value: 'Playwright QA Test', expectation: 'handled' }, expected: 'English company text is retained.', tags: ['@validation'], automated: true },
  { title: 'Company handles numeric text', kind: 'company', data: { value: '12345 Company', expectation: 'handled' }, expected: 'Numeric company text is treated as data.', tags: ['@validation'], automated: true },
  { title: 'Company handles symbols and ampersand', kind: 'company', data: { value: 'A & B Co., Ltd.', expectation: 'handled' }, expected: 'Common company punctuation is handled.', tags: ['@validation'], automated: true },
  { title: 'Company respects maxlength 50', kind: 'company', data: { value: generateLongString(80), expectation: 'max' }, expected: 'Company value is bounded by maxlength.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Company handles leading and trailing spaces', kind: 'company', data: { value: ' Test Company ', expectation: 'handled' }, expected: 'Whitespace is handled consistently.', tags: ['@validation'], automated: true },
  { title: 'Company handles a multiline attempt', kind: 'company', data: { value: 'Line 1\nLine 2', expectation: 'handled' }, expected: 'Multiline input does not break the single-line control.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Company handles HTML-like text safely', kind: 'company', data: { value: '<img src=x>', expectation: 'handled' }, expected: 'HTML-like text is not rendered as executable markup.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Company handles an empty-space value', kind: 'company', data: { value: '   ', expectation: 'handled' }, expected: 'Whitespace-only input is handled without a page crash.', tags: ['@validation', '@negative'], automated: true },
]);

const position = range(81, 'Field Validation', [
  { title: 'Optional Position accepts empty input', kind: 'position', data: { value: '', expectation: 'valid' }, expected: 'An empty optional position field is valid.', tags: ['@validation'], automated: true },
  { title: 'Position accepts Thai text', kind: 'position', data: { value: 'ผู้จัดการ', expectation: 'handled' }, expected: 'Thai position text is retained safely.', tags: ['@validation'], automated: true },
  { title: 'Position accepts English text', kind: 'position', data: { value: 'QA Engineer', expectation: 'handled' }, expected: 'English position text is retained.', tags: ['@validation'], automated: true },
  { title: 'Position handles spaces', kind: 'position', data: { value: 'Senior QA Engineer', expectation: 'handled' }, expected: 'Spaces are handled.', tags: ['@validation'], automated: true },
  { title: 'Position handles symbols', kind: 'position', data: { value: 'QA / SDET', expectation: 'handled' }, expected: 'Position symbols are handled as data.', tags: ['@validation'], automated: true },
  { title: 'Position respects maxlength 50', kind: 'position', data: { value: generateLongString(80), expectation: 'max' }, expected: 'Position value is bounded by maxlength.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Position handles leading and trailing spaces', kind: 'position', data: { value: ' QA Engineer ', expectation: 'handled' }, expected: 'Whitespace is handled consistently.', tags: ['@validation'], automated: true },
  { title: 'Position handles optional behavior with one character', kind: 'position', data: { value: 'X', expectation: 'handled' }, expected: 'Optional input remains usable at a short boundary.', tags: ['@validation'], automated: true },
  { title: 'Position handles punctuation safely', kind: 'position', data: { value: 'QA (Automation)', expectation: 'handled' }, expected: 'Parentheses are treated as data.', tags: ['@validation'], automated: true },
  { title: 'Position handles script-like text safely', kind: 'position', data: { value: '<script>qa</script>', expectation: 'handled' }, expected: 'Script-like text is not executable.', tags: ['@validation', '@negative'], automated: true },
]);

const mobile = range(91, 'Field Validation', [
  { title: 'Mobile accepts an empty optional value', kind: 'mobile', data: { value: mobileValues[0] }, expected: 'The optional mobile field accepts empty input.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles a Thai local number', kind: 'mobile', data: { value: mobileValues[1] }, expected: 'A synthetic Thai-format number is handled.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles a nine-digit local value', kind: 'mobile', data: { value: mobileValues[2] }, expected: 'A nine-digit synthetic value is handled.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles an international plus-six-six value', kind: 'mobile', data: { value: mobileValues[3] }, expected: 'An international value is handled.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles an international US-style value', kind: 'mobile', data: { value: mobileValues[4] }, expected: 'An international formatted value is handled.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles a nine-digit boundary', kind: 'mobile', data: { value: mobileValues[5] }, expected: 'The nine-digit boundary does not crash the form.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles a ten-digit boundary', kind: 'mobile', data: { value: mobileValues[6] }, expected: 'The ten-digit boundary does not crash the form.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles an eleven-digit boundary', kind: 'mobile', data: { value: mobileValues[7] }, expected: 'The eleven-digit boundary does not crash the form.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles a too-short value', kind: 'mobile', data: { value: mobileValues[8] }, expected: 'The too-short value is handled without a page crash.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Mobile handles a too-long value', kind: 'mobile', data: { value: mobileValues[9] }, expected: 'The too-long value is handled without a page crash.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Mobile handles alphabetic input', kind: 'mobile', data: { value: mobileValues[10] }, expected: 'Alphabetic input is handled by the phone control.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Mobile handles hyphenated input', kind: 'mobile', data: { value: mobileValues[11] }, expected: 'Hyphenated input is handled.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles parentheses', kind: 'mobile', data: { value: mobileValues[12] }, expected: 'Parentheses are handled.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles a plus sign and separators', kind: 'mobile', data: { value: mobileValues[13] }, expected: 'Plus sign and separators do not break the control.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles decimal-like input', kind: 'mobile', data: { value: mobileValues[14] }, expected: 'Decimal-like input remains safe.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Mobile handles negative-like input', kind: 'mobile', data: { value: mobileValues[15] }, expected: 'Negative-like input remains safe.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Mobile handles Unicode numerals', kind: 'mobile', data: { value: mobileValues[16] }, expected: 'Unicode numerals do not crash the page.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Mobile handles leading whitespace', kind: 'mobile', data: { value: mobileValues[17] }, expected: 'Leading whitespace is handled.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles trailing whitespace', kind: 'mobile', data: { value: mobileValues[18] }, expected: 'Trailing whitespace is handled.', tags: ['@validation'], automated: true },
  { title: 'Mobile handles copy-like emoji input', kind: 'mobile', data: { value: mobileValues[19] }, expected: 'Emoji and phone text remain safe input.', tags: ['@validation', '@negative'], automated: true },
]);

const confirmEmail = range(111, 'Field Validation', [
  { title: 'Confirm Email accepts both fields empty', kind: 'confirm-email', data: { email: '', confirm: '', expectation: 'same' }, expected: 'Both optional fields remain empty without a crash.', tags: ['@validation'], automated: true },
  { title: 'Confirm Email accepts an identical synthetic address', kind: 'confirm-email', data: { email: validEmails[0], confirm: validEmails[0], expectation: 'same' }, expected: 'The confirmation value matches the original.', tags: ['@validation'], automated: true },
  { title: 'Confirm Email detects a different address', kind: 'confirm-email', data: { email: validEmails[0], confirm: validEmails[1], expectation: 'different' }, expected: 'The two values remain distinguishable for mismatch validation.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles case difference', kind: 'confirm-email', data: { email: 'qa@example.test', confirm: 'QA@EXAMPLE.TEST', expectation: 'different' }, expected: 'Case difference is handled explicitly.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles whitespace difference', kind: 'confirm-email', data: { email: validEmails[0], confirm: ` ${validEmails[0]}`, expectation: 'handled' }, expected: 'Whitespace difference is normalized or handled safely.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles a malformed original', kind: 'confirm-email', data: { email: invalidEmails[0], confirm: invalidEmails[0], expectation: 'same' }, expected: 'Malformed values do not crash confirmation logic.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles a malformed confirmation', kind: 'confirm-email', data: { email: validEmails[0], confirm: invalidEmails[0], expectation: 'different' }, expected: 'Malformed confirmation input is handled safely.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email preserves the original after confirmation entry', kind: 'confirm-email', data: { email: validEmails[1], confirm: validEmails[1], expectation: 'preserve' }, expected: 'Typing the confirmation does not overwrite the original.', tags: ['@validation'], automated: true },
  { title: 'Confirm Email detects an original changed after confirmation', kind: 'confirm-email', data: { email: validEmails[0], confirm: validEmails[0], changedEmail: validEmails[1], expectation: 'changed' }, expected: 'Changing the original leaves a mismatch that can be validated.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles clearing the confirmation', kind: 'confirm-email', data: { email: validEmails[0], confirm: '', expectation: 'empty-confirm' }, expected: 'Clearing confirmation is handled without a crash.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles clearing the original', kind: 'confirm-email', data: { email: '', confirm: validEmails[0], expectation: 'empty-original' }, expected: 'Clearing the original is handled without a crash.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles a paste-like value', kind: 'confirm-email', data: { email: validEmails[2], confirm: validEmails[2], expectation: 'same' }, expected: 'A pasted-equivalent value is retained.', tags: ['@validation'], automated: true },
  { title: 'Confirm Email handles a long confirmation value', kind: 'confirm-email', data: { email: validEmails[0], confirm: generateLongString(70), expectation: 'bounded' }, expected: 'The confirmation field respects maxlength 50.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles plus addressing consistently', kind: 'confirm-email', data: { email: validEmails[1], confirm: validEmails[1], expectation: 'same' }, expected: 'Plus-addressing confirmation remains stable.', tags: ['@validation'], automated: true },
  { title: 'Confirm Email handles Unicode input safely', kind: 'confirm-email', data: { email: 'ทดสอบ@example.test', confirm: 'ทดสอบ@example.test', expectation: 'same' }, expected: 'Unicode values do not break the form.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email handles a newline safely', kind: 'confirm-email', data: { email: validEmails[0], confirm: `${validEmails[0]}\n`, expectation: 'handled' }, expected: 'Newline input is handled safely.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Confirm Email remains optional in the DOM', kind: 'confirm-email', data: { email: '', confirm: '', expectation: 'optional' }, expected: 'The confirmation input does not expose required=true.', tags: ['@validation'], automated: true },
  { title: 'Confirm Email exposes its own accessible name', kind: 'confirm-email', data: { email: '', confirm: '', expectation: 'label' }, expected: 'The confirmation control is reachable by its label.', tags: ['@validation', '@accessibility'], automated: true },
  { title: 'Confirm Email survives clear and retype', kind: 'confirm-email', data: { email: validEmails[0], confirm: validEmails[0], expectation: 'retype' }, expected: 'Clearing and retyping confirmation is stable.', tags: ['@validation'], automated: true },
  { title: 'Confirm Email handles two different malformed values', kind: 'confirm-email', data: { email: invalidEmails[1], confirm: invalidEmails[2], expectation: 'different' }, expected: 'Two malformed values remain safe input.', tags: ['@validation', '@negative'], automated: true },
]);

const crossField = range(131, 'Cross-field / Business Validation', [
  { title: 'Email and confirmation match exactly', kind: 'cross-field', data: { scenario: 'email-same' }, expected: 'Matching values remain equal.', tags: ['@validation'], automated: true },
  { title: 'Email and confirmation mismatch', kind: 'cross-field', data: { scenario: 'email-mismatch' }, expected: 'Mismatch remains visible to client validation.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email and confirmation differ only by case', kind: 'cross-field', data: { scenario: 'email-case' }, expected: 'Case difference is handled explicitly.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Email and confirmation differ by whitespace', kind: 'cross-field', data: { scenario: 'email-whitespace' }, expected: 'Whitespace mismatch is handled safely.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Changing the original email after match creates mismatch', kind: 'cross-field', data: { scenario: 'email-change' }, expected: 'The original and confirmation values no longer match.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Removing confirmation leaves the original intact', kind: 'cross-field', data: { scenario: 'remove-confirm' }, expected: 'The original email remains unchanged.', tags: ['@validation'], automated: true },
  { title: 'Both malformed email values are handled', kind: 'cross-field', data: { scenario: 'both-malformed' }, expected: 'Malformed values do not crash the form.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Both email values empty follow optional semantics', kind: 'cross-field', data: { scenario: 'both-empty' }, expected: 'The optional email pair remains empty.', tags: ['@validation'], automated: true },
  { title: 'First Name alone leaves other required controls incomplete', kind: 'cross-field', data: { scenario: 'only-first' }, expected: 'The form remains invalid because other required fields are missing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Last Name alone leaves other required controls incomplete', kind: 'cross-field', data: { scenario: 'only-last' }, expected: 'The form remains invalid because other required fields are missing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Job Title alone leaves other required controls incomplete', kind: 'cross-field', data: { scenario: 'only-title' }, expected: 'The form remains invalid because other required fields are missing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Industry alone leaves other required controls incomplete', kind: 'cross-field', data: { scenario: 'only-industry' }, expected: 'The form remains invalid because other required fields are missing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Missing First Name is detected', kind: 'cross-field', data: { scenario: 'missing-first' }, expected: 'The form is invalid when first name is missing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Missing Last Name is detected', kind: 'cross-field', data: { scenario: 'missing-last' }, expected: 'The form is invalid when last name is missing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Missing Job Title is detected', kind: 'cross-field', data: { scenario: 'missing-title' }, expected: 'The form is invalid when job title is missing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Missing Industry is detected', kind: 'cross-field', data: { scenario: 'missing-industry' }, expected: 'The form is invalid when industry is missing.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Two missing required fields remain invalid', kind: 'cross-field', data: { scenario: 'missing-two' }, expected: 'The form remains invalid with two missing required values.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Multiple missing required fields remain invalid', kind: 'cross-field', data: { scenario: 'missing-multiple' }, expected: 'The form remains invalid with multiple missing values.', tags: ['@validation', '@negative'], automated: true },
  { title: 'All browser-required profile fields can be completed', kind: 'cross-field', data: { scenario: 'all-required' }, expected: 'All HTML-required profile controls are complete before verification.', tags: ['@validation', '@critical'], automated: true },
  { title: 'Thai name with English company is handled', kind: 'cross-field', data: { scenario: 'thai-name-english-company' }, expected: 'The mixed-language combination remains stable.', tags: ['@validation'], automated: true },
  { title: 'English name with Thai company is handled', kind: 'cross-field', data: { scenario: 'english-name-thai-company' }, expected: 'The mixed-language combination remains stable.', tags: ['@validation'], automated: true },
  { title: 'International phone with Thailand country is handled', kind: 'cross-field', data: { scenario: 'international-phone-thailand' }, expected: 'The phone and country controls remain independent and stable.', tags: ['@validation'], automated: true },
  { title: 'Thai phone with a foreign country is handled', kind: 'cross-field', data: { scenario: 'thai-phone-foreign-country' }, expected: 'The cross-field combination does not crash the form.', tags: ['@validation'], automated: true },
  { title: 'Long values across multiple fields remain bounded', kind: 'cross-field', data: { scenario: 'long-values' }, expected: 'Text controls preserve their individual maxlength constraints.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Special characters across fields remain safe', kind: 'cross-field', data: { scenario: 'special-values' }, expected: 'Special characters are handled as data.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Optional Company does not block required completion', kind: 'cross-field', data: { scenario: 'company-empty' }, expected: 'Company can remain empty while required controls are complete.', tags: ['@validation'], automated: true },
  { title: 'Optional Position does not block required completion', kind: 'cross-field', data: { scenario: 'position-empty' }, expected: 'Position can remain empty while required controls are complete.', tags: ['@validation'], automated: true },
  { title: 'Optional Country does not block required completion', kind: 'cross-field', data: { scenario: 'country-empty' }, expected: 'Country can remain empty while required controls are complete.', tags: ['@validation'], automated: true },
  { title: 'Optional Color does not block required completion', kind: 'cross-field', data: { scenario: 'color-empty' }, expected: 'Color can remain empty while required controls are complete.', tags: ['@validation'], automated: true },
  { title: 'Optional Mobile does not block required completion', kind: 'cross-field', data: { scenario: 'mobile-empty' }, expected: 'Mobile can remain empty while required controls are complete.', tags: ['@validation'], automated: true },
  { title: 'Changing Job Title does not clear First Name', kind: 'cross-field', data: { scenario: 'title-preserves-name' }, expected: 'Existing first-name data is preserved after a selection change.', tags: ['@validation'], automated: true },
  { title: 'Changing Industry does not clear Last Name', kind: 'cross-field', data: { scenario: 'industry-preserves-name' }, expected: 'Existing last-name data is preserved after a selection change.', tags: ['@validation'], automated: true },
  { title: 'Changing Country does not clear Mobile', kind: 'cross-field', data: { scenario: 'country-preserves-mobile' }, expected: 'Mobile text remains available after country selection.', tags: ['@validation'], automated: true },
  { title: 'Changing Color does not clear Company', kind: 'cross-field', data: { scenario: 'color-preserves-company' }, expected: 'Company text remains available after color entry.', tags: ['@validation'], automated: true },
  { title: 'Selecting Other Job Title reveals its companion input', kind: 'cross-field', data: { scenario: 'other-reveals-input' }, expected: 'The custom title input becomes visible for Other.', tags: ['@validation'], automated: true },
  { title: 'Leaving Other Job Title custom text empty is observable', kind: 'cross-field', data: { scenario: 'other-empty' }, expected: 'The custom title control can be inspected when Other is selected.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Switching from Other hides or resets custom title behavior', kind: 'cross-field', data: { scenario: 'other-switch' }, expected: 'Changing away from Other updates custom-title visibility.', tags: ['@validation'], automated: true },
  { title: 'Radio selection leaves one industry checked', kind: 'cross-field', data: { scenario: 'single-industry' }, expected: 'The industry group maintains one checked option.', tags: ['@validation'], automated: true },
  { title: 'Country selection leaves the selected label readable', kind: 'cross-field', data: { scenario: 'country-readable' }, expected: 'The selected country can be read from the native control.', tags: ['@validation'], automated: true },
  { title: 'Mobile country code starts at Thailand plus-six-six', kind: 'cross-field', data: { scenario: 'mobile-default-code' }, expected: 'The default dial code is +66.', tags: ['@validation'], automated: true },
  { title: 'Email and phone can both be populated synthetically', kind: 'cross-field', data: { scenario: 'email-phone' }, expected: 'Independent optional contact values coexist.', tags: ['@validation'], automated: true },
  { title: 'Name and position can contain mixed scripts', kind: 'cross-field', data: { scenario: 'mixed-name-position' }, expected: 'Mixed-script text is retained safely.', tags: ['@validation'], automated: true },
  { title: 'Company and position maxlength values are independent', kind: 'cross-field', data: { scenario: 'independent-maxlength' }, expected: 'Each optional field applies its own 50-character bound.', tags: ['@validation'], automated: true },
  { title: 'Clearing all optional fields leaves required data intact', kind: 'cross-field', data: { scenario: 'clear-optionals' }, expected: 'Clearing optional fields does not clear required fields.', tags: ['@validation'], automated: true },
  { title: 'Repeated selection changes are stable', kind: 'cross-field', data: { scenario: 'repeated-selection' }, expected: 'Repeated control changes do not corrupt other values.', tags: ['@validation'], automated: true },
  { title: 'Long email pair remains within both maxlength attributes', kind: 'cross-field', data: { scenario: 'long-email-pair' }, expected: 'Both email controls remain bounded.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Empty optional values do not create false required errors', kind: 'cross-field', data: { scenario: 'optional-no-error' }, expected: 'Optional controls remain optional in the DOM.', tags: ['@validation'], automated: true },
  { title: 'Required controls expose distinct validation targets', kind: 'cross-field', data: { scenario: 'required-targets' }, expected: 'Required controls have distinct ids or names for reporting.', tags: ['@validation', '@accessibility'], automated: true },
  { title: 'Complete profile preserves all entered values before verification', kind: 'cross-field', data: { scenario: 'complete-preserve' }, expected: 'Synthetic profile data is preserved before the verification step.', tags: ['@validation', '@critical'], automated: true },
  { title: 'Required and optional data can coexist', kind: 'cross-field', data: { scenario: 'required-optional-coexist' }, expected: 'Optional synthetic contact data can coexist with completed required controls.', tags: ['@validation'], automated: true },
]);

const selection = range(181, 'Dropdown / Selection Controls', [
  { title: 'Job Title starts at its placeholder option', kind: 'job-title', data: { scenario: 'default' }, expected: 'Enter Job Title is selected initially.', tags: ['@validation'], automated: true },
  { title: 'Job Title selects Mr.', kind: 'job-title', data: { scenario: 'select', label: 'Mr.' }, expected: 'Mr. becomes the selected option.', tags: ['@validation'], automated: true },
  { title: 'Job Title selects Miss', kind: 'job-title', data: { scenario: 'select', label: 'Miss' }, expected: 'Miss becomes the selected option.', tags: ['@validation'], automated: true },
  { title: 'Job Title selects Mrs.', kind: 'job-title', data: { scenario: 'select', label: 'Mrs.' }, expected: 'Mrs. becomes the selected option.', tags: ['@validation'], automated: true },
  { title: 'Job Title selects Other', kind: 'job-title', data: { scenario: 'other' }, expected: 'Other becomes selected and the custom control is observable.', tags: ['@validation'], automated: true },
  { title: 'Job Title changes from Mr. to Miss', kind: 'job-title', data: { scenario: 'change' }, expected: 'The selected title changes without clearing the form.', tags: ['@validation'], automated: true },
  { title: 'Job Title can be selected through keyboard', kind: 'job-title', data: { scenario: 'keyboard' }, expected: 'Keyboard selection updates the native select.', tags: ['@validation', '@accessibility'], automated: true },
  { title: 'Country starts with no selection', kind: 'country', data: { scenario: 'default' }, expected: 'Select country is the initial selected option.', tags: ['@validation'], automated: true },
  { title: 'Country selects Thailand', kind: 'country', data: { scenario: 'select', label: 'THAILAND' }, expected: 'Thailand is selected in the native country control.', tags: ['@validation'], automated: true },
  { title: 'Country selects Japan', kind: 'country', data: { scenario: 'select', label: 'JAPAN' }, expected: 'Japan is selected.', tags: ['@validation'], automated: true },
  { title: 'Country selects the United States option', kind: 'country', data: { scenario: 'select', label: 'UNITED STATES OF AMERICA' }, expected: 'The United States option is selected.', tags: ['@validation'], automated: true },
  { title: 'Country selection can be changed', kind: 'country', data: { scenario: 'change' }, expected: 'Changing country updates the native value.', tags: ['@validation'], automated: true },
  { title: 'Country native select supports keyboard selection', kind: 'country', data: { scenario: 'keyboard' }, expected: 'Keyboard interaction changes the selected country.', tags: ['@validation', '@accessibility'], automated: true },
  { title: 'Country can be cleared to its placeholder', kind: 'country', data: { scenario: 'clear' }, expected: 'The country returns to Select country.', tags: ['@validation'], automated: true },
  { title: 'Visible country combobox exposes a search affordance', kind: 'country', data: { scenario: 'search' }, expected: 'The Select2 search control is present and usable.', tags: ['@validation'], automated: true },
  { title: 'Color starts empty and optional', kind: 'color', data: { scenario: 'empty' }, expected: 'Color has no required attribute and starts empty.', tags: ['@validation'], automated: true },
  { title: 'Color accepts a three-digit hex value', kind: 'color', data: { scenario: 'valid', value: '#abc' }, expected: 'The short hex value satisfies the color pattern.', tags: ['@validation'], automated: true },
  { title: 'Color accepts a six-digit hex value', kind: 'color', data: { scenario: 'valid', value: '#336699' }, expected: 'The six-digit hex value satisfies the color pattern.', tags: ['@validation'], automated: true },
  { title: 'Color accepts an eight-digit hex value', kind: 'color', data: { scenario: 'valid', value: '#336699ff' }, expected: 'The eight-digit hex value satisfies the color pattern.', tags: ['@validation'], automated: true },
  { title: 'Color rejects a non-hex value', kind: 'color', data: { scenario: 'invalid', value: 'not-a-color' }, expected: 'The color pattern reports invalid input.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Color value can be changed', kind: 'color', data: { scenario: 'change' }, expected: 'The text color value updates from one hex value to another.', tags: ['@validation'], automated: true },
  { title: 'Color preview is present for the picker affordance', kind: 'color', data: { scenario: 'preview' }, expected: 'The visible preview control is available.', tags: ['@validation'], automated: true },
  { title: 'Industry starts with no checked option', kind: 'industry', data: { scenario: 'default' }, expected: 'No industry radio is checked initially.', tags: ['@validation'], automated: true },
  { title: 'Industry selects Government & Public Services', kind: 'industry', data: { scenario: 'select', label: 'Government & Public Services' }, expected: 'The Government option is checked.', tags: ['@validation'], automated: true },
  { title: 'Industry selects Energy', kind: 'industry', data: { scenario: 'select', label: 'Energy' }, expected: 'Energy is checked.', tags: ['@validation'], automated: true },
  { title: 'Industry selects Transportation', kind: 'industry', data: { scenario: 'select', label: 'Transportation' }, expected: 'Transportation is checked.', tags: ['@validation'], automated: true },
  { title: 'Industry changes from Energy to Transportation', kind: 'industry', data: { scenario: 'change' }, expected: 'Only the latest industry remains checked.', tags: ['@validation'], automated: true },
  { title: 'Industry radios support keyboard control', kind: 'industry', data: { scenario: 'keyboard' }, expected: 'Keyboard interaction selects an industry.', tags: ['@validation', '@accessibility'], automated: true },
  { title: 'Industry required semantics are exposed', kind: 'industry', data: { scenario: 'required' }, expected: 'The radio group has required semantics.', tags: ['@validation'], automated: true },
  { title: 'Industry checked state is readable', kind: 'industry', data: { scenario: 'checked' }, expected: 'The selected radio exposes checked=true.', tags: ['@validation', '@accessibility'], automated: true },
  { title: 'Industry selection does not select two radios', kind: 'industry', data: { scenario: 'single' }, expected: 'The radio group contains exactly one checked option after selection.', tags: ['@validation'], automated: true },
  { title: 'Industry labels match their radio accessible names', kind: 'industry', data: { scenario: 'labels' }, expected: 'All rendered industry labels are readable by role.', tags: ['@validation', '@accessibility'], automated: true },
  { title: 'Industry remains selected after optional field entry', kind: 'industry', data: { scenario: 'preserve' }, expected: 'Entering optional data does not clear the selected industry.', tags: ['@validation'], automated: true },
  { title: 'Job Title required state is observable', kind: 'job-title', data: { scenario: 'required' }, expected: 'The title select exposes required=true.', tags: ['@validation'], automated: true },
  { title: 'Country option list contains Thailand and multiple countries', kind: 'country', data: { scenario: 'options' }, expected: 'The real DOM contains Thailand and a broad country list.', tags: ['@validation'], automated: true },
]);

const upload = range(216, 'File Upload', [
  { title: 'Upload accepts a synthetic JPG file', kind: 'upload', data: { scenario: 'valid', kind: 'jpg' }, expected: 'The file input accepts one synthetic JPG selection.', tags: ['@upload'], automated: true },
  { title: 'Upload accepts a synthetic JPEG file', kind: 'upload', data: { scenario: 'valid', kind: 'jpeg' }, expected: 'The file input accepts one synthetic JPEG selection.', tags: ['@upload'], automated: true },
  { title: 'Upload accepts a synthetic PNG file', kind: 'upload', data: { scenario: 'valid', kind: 'png' }, expected: 'The file input accepts one synthetic PNG selection.', tags: ['@upload'], automated: true },
  { title: 'Upload accepts a synthetic GIF file', kind: 'upload', data: { scenario: 'valid', kind: 'gif' }, expected: 'The file input accepts one synthetic GIF selection.', tags: ['@upload'], automated: true },
  { title: 'Upload handles a very small image', kind: 'upload', data: { scenario: 'small', kind: 'png' }, expected: 'The one-pixel synthetic image does not crash the form.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload handles a normal-size synthetic image', kind: 'upload', data: { scenario: 'normal', kind: 'png' }, expected: 'A synthetic image selection is handled safely.', tags: ['@upload'], automated: true },
  { title: 'Upload accepts a JPEG filename with uppercase extension', kind: 'upload', data: { scenario: 'case', kind: 'jpg', fileName: 'PHOTO.JPG' }, expected: 'The accept list is case-insensitive or the control handles the filename safely.', tags: ['@upload'], automated: true },
  { title: 'Upload accepts a PNG filename with uppercase extension', kind: 'upload', data: { scenario: 'case', kind: 'png', fileName: 'PHOTO.PNG' }, expected: 'The control handles an uppercase PNG filename safely.', tags: ['@upload'], automated: true },
  { title: 'Upload rejects or flags a PDF extension', kind: 'upload', data: { scenario: 'invalid', kind: 'pdf' }, expected: 'The control exposes an image-only accept policy and does not crash.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload rejects or flags a text file', kind: 'upload', data: { scenario: 'invalid', kind: 'txt' }, expected: 'A text file is outside the image accept policy.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload rejects or flags a DOCX file', kind: 'upload', data: { scenario: 'invalid', kind: 'docx' }, expected: 'A document file is outside the image accept policy.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload rejects or flags an SVG file', kind: 'upload', data: { scenario: 'invalid', kind: 'svg' }, expected: 'SVG is outside the configured raster-image accept list.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload handles a harmless executable dummy file', kind: 'upload', data: { scenario: 'invalid', kind: 'exe' }, expected: 'A harmless dummy file does not execute or crash the page.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload handles a renamed or corrupted image', kind: 'upload', data: { scenario: 'corrupt', kind: 'corrupt', fileName: 'renamed.png' }, expected: 'Corrupt bytes are handled without script execution.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload handles a fake MIME type', kind: 'upload', data: { scenario: 'mime', kind: 'png', fileName: 'fake-mime.jpg' }, expected: 'The browser-side file selection remains safe for MIME mismatch testing.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload handles a zero-byte file', kind: 'upload', data: { scenario: 'zero', kind: 'zero', fileName: 'empty.png' }, expected: 'Zero-byte input does not crash the form.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload exposes its supported extension list', kind: 'upload', data: { scenario: 'accept' }, expected: 'The accept attribute includes jpg, jpeg, png and gif.', tags: ['@upload'], automated: true },
  { title: 'Upload allows only one file', kind: 'upload', data: { scenario: 'single' }, expected: 'The file input does not expose multiple=true.', tags: ['@upload'], automated: true },
  { title: 'Upload handles a Thai filename', kind: 'upload', data: { scenario: 'filename', kind: 'png', fileName: 'รูปทดสอบ.png' }, expected: 'A Thai filename is handled as data.', tags: ['@upload'], automated: true },
  { title: 'Upload handles an English filename', kind: 'upload', data: { scenario: 'filename', kind: 'png', fileName: 'profile-test.png' }, expected: 'An English filename is handled.', tags: ['@upload'], automated: true },
  { title: 'Upload handles spaces in a filename', kind: 'upload', data: { scenario: 'filename', kind: 'png', fileName: 'profile test.png' }, expected: 'Spaces in a filename are handled.', tags: ['@upload'], automated: true },
  { title: 'Upload handles special filename characters', kind: 'upload', data: { scenario: 'filename', kind: 'png', fileName: 'profile_(qa)-1.png' }, expected: 'Special filename characters are handled.', tags: ['@upload'], automated: true },
  { title: 'Upload handles a long filename', kind: 'upload', data: { scenario: 'filename', kind: 'png', fileName: `${'a'.repeat(80)}.png` }, expected: 'A long filename does not crash the form.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload replaces a selected file', kind: 'upload', data: { scenario: 'replace', first: 'png', second: 'jpg' }, expected: 'The file control reflects the latest selection or gives a clear validation result.', tags: ['@upload'], automated: true },
  { title: 'Upload handles selecting the same file twice', kind: 'upload', data: { scenario: 'same-twice', kind: 'png' }, expected: 'Repeated selection does not crash the page.', tags: ['@upload'], automated: true },
  { title: 'Upload preview behavior is observable if implemented', kind: 'upload', data: { scenario: 'preview', kind: 'png' }, expected: 'A preview or safe file state is observable after selection.', tags: ['@upload'], automated: true },
  { title: 'Upload feedback area has an accessible role', kind: 'upload', data: { scenario: 'feedback' }, expected: 'The upload feedback region uses role=alert.', tags: ['@upload', '@accessibility'], automated: true },
  { title: 'Upload button has an accessible name', kind: 'upload', data: { scenario: 'button' }, expected: 'The upload control is reachable by its visible name.', tags: ['@upload', '@accessibility'], automated: true },
  { title: 'Upload input is keyboard reachable', kind: 'upload', data: { scenario: 'keyboard' }, expected: 'The file input is present in the form and can be inspected by keyboard semantics.', tags: ['@upload', '@accessibility'], automated: true },
  { title: 'Upload drag-drop capability matches the DOM configuration', kind: 'upload', data: { scenario: 'drag-drop' }, expected: 'The DOM reports whether drag/drop is supported without forcing a drag.', tags: ['@upload'], automated: true },
  { title: 'Upload does not advertise an unsafe executable type', kind: 'upload', data: { scenario: 'security-accept' }, expected: 'The accept attribute is limited to the configured image extensions.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload preserves the form after a blocked synthetic upload request', kind: 'upload', data: { scenario: 'blocked-request', kind: 'png' }, expected: 'Blocking the external upload endpoint does not destroy the form.', tags: ['@upload', '@network'], automated: true },
  { title: 'Upload handles a second replacement with a different extension', kind: 'upload', data: { scenario: 'replace-extension', first: 'jpg', second: 'gif' }, expected: 'A second safe synthetic selection remains stable.', tags: ['@upload'], automated: true },
  { title: 'Upload feedback remains available after invalid input', kind: 'upload', data: { scenario: 'invalid-feedback', kind: 'txt' }, expected: 'The feedback region remains available for an invalid-file message.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Upload control remains visible after file handling', kind: 'upload', data: { scenario: 'visible-after', kind: 'png' }, expected: 'The upload control remains usable after file selection.', tags: ['@upload'], automated: true },
]);

const verification = range(251, 'Verification / CAPTCHA', [
  { title: 'Verification iframe is present', kind: 'verification', data: { scenario: 'present' }, expected: 'An hCaptcha iframe is rendered.', tags: ['@network', '@accessibility'], automated: true },
  { title: 'Verification checkbox has an accessible name', kind: 'verification', data: { scenario: 'accessible-name' }, expected: 'The checkbox is named I am human inside the widget frame.', tags: ['@accessibility'], automated: true },
  { title: 'Verification widget exposes a loading-safe page state', kind: 'verification', data: { scenario: 'loading' }, expected: 'The host form remains visible while the widget loads.', tags: ['@network'], automated: true },
  { title: 'Verification iframe has the expected hCaptcha title', kind: 'verification', data: { scenario: 'title' }, expected: 'The checkbox iframe is titled as an hCaptcha security challenge.', tags: ['@accessibility'], automated: true },
  { title: 'Verification network failure is isolated with a route', kind: 'verification', data: { scenario: 'network-failure' }, expected: 'A synthetic client-side abort does not crash the host form.', tags: ['@network', '@negative'], automated: true },
  { title: 'Verification form data survives a widget wait', kind: 'verification', data: { scenario: 'preserve' }, expected: 'Synthetic form values remain after waiting for the widget.', tags: ['@network'], automated: true },
  { title: 'Verification retry surface is inspectable without solving', kind: 'verification', data: { scenario: 'retry' }, expected: 'The widget remains present for a possible retry path.', tags: ['@network'], automated: true },
  { title: 'Verification layout is present at mobile width', kind: 'verification', data: { scenario: 'mobile' }, expected: 'The widget iframe remains visible at a mobile viewport.', tags: ['@responsive'], automated: true },
  { title: 'Verification layout is present at desktop width', kind: 'verification', data: { scenario: 'desktop' }, expected: 'The widget iframe remains visible at a desktop viewport.', tags: ['@responsive'], automated: true },
  { title: 'Verification checkbox is keyboard addressable', kind: 'verification', data: { scenario: 'keyboard' }, expected: 'The checkbox can be located by accessible role without clicking it.', tags: ['@accessibility'], automated: true },
  { title: 'Verification timeout-safe host form remains visible', kind: 'verification', data: { scenario: 'timeout' }, expected: 'The host form stays visible when the widget is not solved.', tags: ['@network', '@negative'], automated: true },
  { title: 'Verification third-party frame is not bypassed by tests', kind: 'verification', data: { scenario: 'no-bypass' }, expected: 'The suite only inspects the widget and does not solve it.', tags: ['@network', '@critical'], automated: true },
  { title: 'Verification failure does not erase entered first name', kind: 'verification', data: { scenario: 'preserve-first' }, expected: 'Synthetic first-name data remains after widget state inspection.', tags: ['@network'], automated: true },
  { title: 'Verification component can be reloaded with the page', kind: 'verification', data: { scenario: 'reload' }, expected: 'The widget is rendered again after host page reload.', tags: ['@network'], automated: true },
  { title: 'Verification failure is treated as a blocked external dependency', kind: 'verification', data: { scenario: 'classification' }, expected: 'The test records the dependency without trying to bypass it.', tags: ['@network', '@critical'], automated: true },
]);

const network = range(266, 'Submit / Network / Error Handling', [
  { title: 'Empty submit is stopped by client validation', kind: 'network', data: { scenario: 'empty-submit' }, expected: 'The incomplete form remains on the page.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Submit with missing First Name is stopped', kind: 'network', data: { scenario: 'missing-first' }, expected: 'Required validation prevents a registration request.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Submit with missing Last Name is stopped', kind: 'network', data: { scenario: 'missing-last' }, expected: 'Required validation prevents a registration request.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Submit with missing Job Title is stopped', kind: 'network', data: { scenario: 'missing-title' }, expected: 'Required validation prevents a registration request.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Submit with missing Industry is stopped', kind: 'network', data: { scenario: 'missing-industry' }, expected: 'Required validation prevents a registration request.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Submit with malformed email is stopped', kind: 'network', data: { scenario: 'invalid-email' }, expected: 'Client email validation keeps the form on the page.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Submit with mismatched email confirmation is stopped', kind: 'network', data: { scenario: 'email-mismatch' }, expected: 'Mismatch remains visible and no real submission is made.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Submit with invalid mobile text is handled safely', kind: 'network', data: { scenario: 'invalid-mobile' }, expected: 'The form does not crash on invalid phone text.', tags: ['@validation', '@negative'], automated: true },
  { title: 'Submit with invalid upload is handled safely', kind: 'network', data: { scenario: 'invalid-upload' }, expected: 'The file control and form remain usable.', tags: ['@upload', '@negative'], automated: true },
  { title: 'Submit with incomplete verification remains gated', kind: 'network', data: { scenario: 'captcha-incomplete' }, expected: 'The test does not bypass the CAPTCHA and the host page remains visible.', tags: ['@network', '@negative', '@critical'], automated: true },
  { title: 'Synthetic API 400 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 400 }, expected: 'The route stub returns 400 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 401 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 401 }, expected: 'The route stub returns 401 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 403 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 403 }, expected: 'The route stub returns 403 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 404 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 404 }, expected: 'The route stub returns 404 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 409 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 409 }, expected: 'The route stub returns 409 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 422 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 422 }, expected: 'The route stub returns 422 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 429 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 429 }, expected: 'The route stub returns 429 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 500 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 500 }, expected: 'The route stub returns 500 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 502 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 502 }, expected: 'The route stub returns 502 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic API 503 response can be intercepted', kind: 'network', data: { scenario: 'status', status: 503 }, expected: 'The route stub returns 503 without contacting production.', tags: ['@network'], automated: true },
  { title: 'Synthetic connection abort is observable', kind: 'network', data: { scenario: 'abort' }, expected: 'The intercepted request aborts safely.', tags: ['@network', '@negative'], automated: true },
  { title: 'Synthetic timeout path is observable', kind: 'network', data: { scenario: 'timeout' }, expected: 'A client-side timeout-style failure is handled without a page crash.', tags: ['@network', '@negative'], automated: true },
  { title: 'Submit button state remains readable during incomplete validation', kind: 'network', data: { scenario: 'button-state' }, expected: 'The Submit button remains locatable and has a stable state.', tags: ['@network'], automated: true },
  { title: 'Double-clicking incomplete Submit does not navigate', kind: 'network', data: { scenario: 'double-click' }, expected: 'Repeated safe clicks do not leave the registration page.', tags: ['@network', '@negative'], automated: true },
  { title: 'Form data is preserved after a synthetic network failure', kind: 'network', data: { scenario: 'preserve-after-error' }, expected: 'Synthetic values remain after the route is intercepted.', tags: ['@network'], automated: true },
  { title: 'A loading indicator is inspectable if the page exposes one', kind: 'network', data: { scenario: 'loading-indicator' }, expected: 'The suite records the initial Submit/loading state without forcing a real request.', tags: ['@network'], automated: true },
  { title: 'API errors do not create duplicate submit controls', kind: 'network', data: { scenario: 'no-duplicate' }, expected: 'The form contains one named Submit button.', tags: ['@network'], automated: true },
  { title: 'API error probe runs against a synthetic request only', kind: 'network', data: { scenario: 'synthetic-only' }, expected: 'The stubbed request is intercepted before external transmission.', tags: ['@network', '@critical'], automated: true },
  { title: 'Successful registration scenarios are isolated under @submission', kind: 'network', data: { scenario: 'submission-isolated' }, expected: 'Submission-tagged tests remain excluded from the default run.', tags: ['@network', '@submission'], automated: true },
  { title: 'Submission does not bypass hCaptcha', kind: 'network', data: { scenario: 'submission-captcha' }, expected: 'The test stops at the verification gate.', tags: ['@submission', '@critical'], automated: true },
  { title: 'Submission preserves synthetic values before the gate', kind: 'network', data: { scenario: 'submission-preserve' }, expected: 'Synthetic values remain visible and no real registration is created.', tags: ['@submission'], automated: true },
  { title: 'Submission duplicate-click behavior is isolated', kind: 'network', data: { scenario: 'submission-double-click' }, expected: 'The test remains gated and does not send repeated registrations.', tags: ['@submission'], automated: true },
  { title: 'Submission network response handling is synthetic', kind: 'network', data: { scenario: 'submission-response' }, expected: 'Any response contract is tested with a route stub only.', tags: ['@submission'], automated: true },
  { title: 'Submission success is not attempted without verification', kind: 'network', data: { scenario: 'submission-no-success' }, expected: 'The suite records verification blocking rather than solving CAPTCHA.', tags: ['@submission', '@critical'], automated: true },
  { title: 'Synthetic API response body is readable', kind: 'network', data: { scenario: 'status-body' }, expected: 'A stubbed response body can be read without contacting production.', tags: ['@network'], automated: true },
]);

const responsive = range(301, 'UI / Responsive / Layout', [
  { title: 'No horizontal overflow at 320x568', kind: 'responsive', data: { viewport: { width: 320, height: 568 }, check: 'overflow' }, expected: 'The document fits within a 320px viewport.', tags: ['@responsive'], automated: true },
  { title: 'Labels remain visible at 320x568', kind: 'responsive', data: { viewport: { width: 320, height: 568 }, check: 'labels' }, expected: 'Core labels remain visible.', tags: ['@responsive'], automated: true },
  { title: 'Submit remains visible at 320x568', kind: 'responsive', data: { viewport: { width: 320, height: 568 }, check: 'submit' }, expected: 'The Submit control remains visible after scrolling.', tags: ['@responsive', '@critical'], automated: true },
  { title: 'No horizontal overflow at 360x800', kind: 'responsive', data: { viewport: { width: 360, height: 800 }, check: 'overflow' }, expected: 'The document fits within a 360px viewport.', tags: ['@responsive'], automated: true },
  { title: 'Dropdown controls remain usable at 360x800', kind: 'responsive', data: { viewport: { width: 360, height: 800 }, check: 'dropdown' }, expected: 'Job Title and Country controls remain visible and enabled.', tags: ['@responsive'], automated: true },
  { title: 'Upload control remains usable at 360x800', kind: 'responsive', data: { viewport: { width: 360, height: 800 }, check: 'upload' }, expected: 'The upload control remains visible.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 375x667', kind: 'responsive', data: { viewport: { width: 375, height: 667 }, check: 'overflow' }, expected: 'The document fits within a 375px viewport.', tags: ['@responsive'], automated: true },
  { title: 'Long validation target remains within the viewport', kind: 'responsive', data: { viewport: { width: 375, height: 667 }, check: 'validation' }, expected: 'A validation target remains visible without layout breakage.', tags: ['@responsive', '@validation'], automated: true },
  { title: 'No horizontal overflow at 390x844', kind: 'responsive', data: { viewport: { width: 390, height: 844 }, check: 'overflow' }, expected: 'The document fits within a 390px viewport.', tags: ['@responsive'], automated: true },
  { title: 'Industry radios remain usable at 390x844', kind: 'responsive', data: { viewport: { width: 390, height: 844 }, check: 'radio' }, expected: 'All industry options remain visible or scrollable.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 393x852', kind: 'responsive', data: { viewport: { width: 393, height: 852 }, check: 'overflow' }, expected: 'The document fits within a 393px viewport.', tags: ['@responsive'], automated: true },
  { title: 'Verification widget remains within 393px layout', kind: 'responsive', data: { viewport: { width: 393, height: 852 }, check: 'captcha' }, expected: 'The widget iframe is present and not wider than the viewport.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 414x896', kind: 'responsive', data: { viewport: { width: 414, height: 896 }, check: 'overflow' }, expected: 'The document fits within a 414px viewport.', tags: ['@responsive'], automated: true },
  { title: 'Mobile field spacing remains readable at 414x896', kind: 'responsive', data: { viewport: { width: 414, height: 896 }, check: 'spacing' }, expected: 'Core controls have non-zero layout boxes.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 768x1024', kind: 'responsive', data: { viewport: { width: 768, height: 1024 }, check: 'overflow' }, expected: 'The document fits within a tablet viewport.', tags: ['@responsive'], automated: true },
  { title: 'Form alignment remains stable at 768x1024', kind: 'responsive', data: { viewport: { width: 768, height: 1024 }, check: 'alignment' }, expected: 'The form remains visible with meaningful width.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 820x1180', kind: 'responsive', data: { viewport: { width: 820, height: 1180 }, check: 'overflow' }, expected: 'The document fits within a large tablet viewport.', tags: ['@responsive'], automated: true },
  { title: 'Upload layout remains aligned at 820x1180', kind: 'responsive', data: { viewport: { width: 820, height: 1180 }, check: 'upload-alignment' }, expected: 'The upload area has a visible layout box.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 1024x768', kind: 'responsive', data: { viewport: { width: 1024, height: 768 }, check: 'overflow' }, expected: 'The document fits within a laptop viewport.', tags: ['@responsive'], automated: true },
  { title: 'Submit is reachable at 1024x768', kind: 'responsive', data: { viewport: { width: 1024, height: 768 }, check: 'submit' }, expected: 'Submit can be scrolled into view.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 1280x720', kind: 'responsive', data: { viewport: { width: 1280, height: 720 }, check: 'overflow' }, expected: 'The document fits within a desktop viewport.', tags: ['@responsive'], automated: true },
  { title: 'Form alignment remains stable at 1280x720', kind: 'responsive', data: { viewport: { width: 1280, height: 720 }, check: 'alignment' }, expected: 'The form remains aligned and visible.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 1366x768', kind: 'responsive', data: { viewport: { width: 1366, height: 768 }, check: 'overflow' }, expected: 'The document fits within a desktop viewport.', tags: ['@responsive'], automated: true },
  { title: 'Dropdown remains usable at 1366x768', kind: 'responsive', data: { viewport: { width: 1366, height: 768 }, check: 'dropdown' }, expected: 'Native selection controls remain enabled.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 1440x900', kind: 'responsive', data: { viewport: { width: 1440, height: 900 }, check: 'overflow' }, expected: 'The document fits within a large desktop viewport.', tags: ['@responsive'], automated: true },
  { title: 'Verification layout remains present at 1440x900', kind: 'responsive', data: { viewport: { width: 1440, height: 900 }, check: 'captcha' }, expected: 'The verification frame remains present.', tags: ['@responsive'], automated: true },
  { title: 'No horizontal overflow at 1920x1080', kind: 'responsive', data: { viewport: { width: 1920, height: 1080 }, check: 'overflow' }, expected: 'The document fits within a full HD viewport.', tags: ['@responsive'], automated: true },
  { title: 'Form does not overlap the page edge at 1920x1080', kind: 'responsive', data: { viewport: { width: 1920, height: 1080 }, check: 'edge' }, expected: 'The form has a visible bounding box within the viewport.', tags: ['@responsive'], automated: true },
  { title: 'Field text is not clipped at mobile width', kind: 'responsive', data: { viewport: { width: 375, height: 667 }, check: 'clipping' }, expected: 'Core text controls have non-zero visible boxes.', tags: ['@responsive'], automated: true },
  { title: 'Validation feedback region remains attached at mobile width', kind: 'responsive', data: { viewport: { width: 390, height: 844 }, check: 'feedback' }, expected: 'The validation feedback region remains attached for client messages.', tags: ['@responsive', '@validation'], automated: true },
  { title: 'Color control remains visible on mobile', kind: 'responsive', data: { viewport: { width: 414, height: 896 }, check: 'color' }, expected: 'The color text control remains visible.', tags: ['@responsive'], automated: true },
  { title: 'Mobile keyboard-safe focus can reach a field', kind: 'responsive', data: { viewport: { width: 375, height: 667 }, check: 'focus' }, expected: 'A focused field is scrolled into a visible viewport area.', tags: ['@responsive', '@accessibility'], automated: true },
  { title: 'Form spacing remains non-negative across breakpoints', kind: 'responsive', data: { viewport: { width: 768, height: 1024 }, check: 'boxes' }, expected: 'Core control boxes are measurable and non-overlapping with the page edge.', tags: ['@responsive'], automated: true },
  { title: 'Radio controls remain visible on desktop', kind: 'responsive', data: { viewport: { width: 1440, height: 900 }, check: 'radio' }, expected: 'All rendered industry radios remain visible.', tags: ['@responsive'], automated: true },
  { title: 'Registration form remains visible after breakpoint evaluation', kind: 'responsive', data: { viewport: { width: 1024, height: 768 }, check: 'form-visible' }, expected: 'The registration form remains visible after responsive evaluation.', tags: ['@responsive'], automated: true },
]);

const accessibility = range(336, 'Accessibility / Keyboard', [
  { title: 'Tab navigation reaches the first form control', kind: 'accessibility', data: { scenario: 'tab' }, expected: 'Keyboard focus reaches a form control.', tags: ['@accessibility'], automated: true },
  { title: 'Shift+Tab can move focus backwards', kind: 'accessibility', data: { scenario: 'shift-tab' }, expected: 'Reverse keyboard navigation does not crash the page.', tags: ['@accessibility'], automated: true },
  { title: 'Focused controls expose a focus indicator', kind: 'accessibility', data: { scenario: 'focus-indicator' }, expected: 'The focused control has a non-empty computed outline or box-shadow.', tags: ['@accessibility'], automated: true },
  { title: 'Core inputs have accessible names', kind: 'accessibility', data: { scenario: 'input-names' }, expected: 'Core text inputs can be located by label.', tags: ['@accessibility', '@critical'], automated: true },
  { title: 'Submit has an accessible name', kind: 'accessibility', data: { scenario: 'button-name' }, expected: 'The Submit button has an accessible name.', tags: ['@accessibility'], automated: true },
  { title: 'Radio options are keyboard selectable', kind: 'accessibility', data: { scenario: 'radio-keyboard' }, expected: 'Industry radios support keyboard selection.', tags: ['@accessibility'], automated: true },
  { title: 'Native select supports keyboard selection', kind: 'accessibility', data: { scenario: 'select-keyboard' }, expected: 'Job Title responds to keyboard selection.', tags: ['@accessibility'], automated: true },
  { title: 'Upload control has a keyboard-accessible input', kind: 'accessibility', data: { scenario: 'upload-keyboard' }, expected: 'The file input is present with an accessible label or description.', tags: ['@accessibility'], automated: true },
  { title: 'Error regions use alert semantics', kind: 'accessibility', data: { scenario: 'error-alert' }, expected: 'Rendered feedback regions use role=alert.', tags: ['@accessibility'], automated: true },
  { title: 'Required controls expose required semantics', kind: 'accessibility', data: { scenario: 'required' }, expected: 'Required controls have required attributes.', tags: ['@accessibility'], automated: true },
  { title: 'Heading structure includes the form heading', kind: 'accessibility', data: { scenario: 'headings' }, expected: 'The page has a meaningful Registrant Information heading.', tags: ['@accessibility'], automated: true },
  { title: 'The document has no duplicate element ids', kind: 'accessibility', data: { scenario: 'duplicate-ids' }, expected: 'Each id is unique in the rendered document.', tags: ['@accessibility'], automated: true },
  { title: 'Tabindex values are not unexpectedly positive', kind: 'accessibility', data: { scenario: 'tabindex' }, expected: 'The form does not introduce positive tabindex values.', tags: ['@accessibility'], automated: true },
  { title: 'Validation can focus the first invalid required control', kind: 'accessibility', data: { scenario: 'focus-invalid' }, expected: 'The browser can identify the first invalid required control.', tags: ['@accessibility'], automated: true },
  { title: 'Focus order follows the form DOM order', kind: 'accessibility', data: { scenario: 'focus-order' }, expected: 'Core controls appear in a logical DOM order.', tags: ['@accessibility'], automated: true },
  { title: 'Enter key does not crash the incomplete form', kind: 'accessibility', data: { scenario: 'enter' }, expected: 'Enter handling leaves the page usable.', tags: ['@accessibility', '@negative'], automated: true },
  { title: 'Space key selects a radio option', kind: 'accessibility', data: { scenario: 'space' }, expected: 'Space selection updates an industry radio.', tags: ['@accessibility'], automated: true },
  { title: 'ARIA describedby targets exist for core inputs', kind: 'accessibility', data: { scenario: 'describedby' }, expected: 'Referenced descriptions resolve or are intentionally absent.', tags: ['@accessibility'], automated: true },
  { title: 'Role names are correct for button and radios', kind: 'accessibility', data: { scenario: 'roles' }, expected: 'The core controls expose button, combobox and radio roles.', tags: ['@accessibility'], automated: true },
  { title: 'Disabled state semantics are consistent if present', kind: 'accessibility', data: { scenario: 'disabled' }, expected: 'Any disabled controls expose disabled semantics.', tags: ['@accessibility'], automated: true },
  { title: 'Verification iframe has an accessible title', kind: 'accessibility', data: { scenario: 'iframe-title' }, expected: 'The hCaptcha iframe title is present.', tags: ['@accessibility'], automated: true },
  { title: 'Color input has an accessible text label', kind: 'accessibility', data: { scenario: 'color-label' }, expected: 'The color text control is reachable by label.', tags: ['@accessibility'], automated: true },
  { title: 'Country control has an accessible label', kind: 'accessibility', data: { scenario: 'country-label' }, expected: 'Country is associated with its label.', tags: ['@accessibility'], automated: true },
  { title: 'Mobile field has an accessible label', kind: 'accessibility', data: { scenario: 'mobile-label' }, expected: 'Mobile is associated with its label.', tags: ['@accessibility'], automated: true },
  { title: 'Form has a single primary submit action', kind: 'accessibility', data: { scenario: 'single-submit' }, expected: 'The form exposes one named Submit button.', tags: ['@accessibility', '@critical'], automated: true },
]);

const robustness = range(361, 'Input Robustness / Safe Security Validation', [
  { title: 'Robustness handles script text in First Name', kind: 'robustness', data: { field: 'first', value: robustnessValues[0] }, expected: 'The string remains data and no script is injected.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles image-handler text in Last Name', kind: 'robustness', data: { field: 'last', value: robustnessValues[1] }, expected: 'The string remains data and no handler is created.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles SQL-like Company text', kind: 'robustness', data: { field: 'company', value: robustnessValues[2] }, expected: 'SQL-like text is treated as input data.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles path-like Position text', kind: 'robustness', data: { field: 'position', value: robustnessValues[3] }, expected: 'Path-like text does not access local files or crash the form.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles template-expression text', kind: 'robustness', data: { field: 'company', value: robustnessValues[4] }, expected: 'Template-like text is not evaluated.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles dollar-expression text', kind: 'robustness', data: { field: 'position', value: robustnessValues[5] }, expected: 'Expression-like text is not evaluated.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles percent-null text', kind: 'robustness', data: { field: 'first', value: robustnessValues[6] }, expected: 'Null-like text does not break input handling.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles emoji and Unicode', kind: 'robustness', data: { field: 'last', value: robustnessValues[7] }, expected: 'Unicode remains safe input.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles RTL text', kind: 'robustness', data: { field: 'company', value: robustnessValues[8] }, expected: 'RTL text does not break the form layout.', tags: ['@negative', '@responsive'], automated: true },
  { title: 'Robustness handles newline text', kind: 'robustness', data: { field: 'position', value: robustnessValues[9] }, expected: 'Newline text is handled without executable rendering.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles tab text', kind: 'robustness', data: { field: 'first', value: robustnessValues[10] }, expected: 'Tab text does not break the form.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles the literal null string', kind: 'robustness', data: { field: 'last', value: robustnessValues[11] }, expected: 'The literal string null remains safe.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles the literal undefined string', kind: 'robustness', data: { field: 'company', value: robustnessValues[12] }, expected: 'The literal string undefined remains safe.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles NaN text', kind: 'robustness', data: { field: 'position', value: robustnessValues[13] }, expected: 'NaN text is treated as data.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles Infinity text', kind: 'robustness', data: { field: 'first', value: robustnessValues[14] }, expected: 'Infinity text is treated as data.', tags: ['@negative'], automated: true },
  { title: 'Robustness bounds an 80-character value', kind: 'robustness', data: { field: 'last', value: robustnessValues[15] }, expected: 'The target field remains within maxlength.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles Thai name input', kind: 'robustness', data: { field: 'first', value: robustnessValues[16] }, expected: 'Thai input remains stable.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles exactly 50 characters', kind: 'robustness', data: { field: 'company', value: robustnessValues[17] }, expected: 'The exact maxlength boundary is handled.', tags: ['@negative'], automated: true },
  { title: 'Robustness bounds 51 characters', kind: 'robustness', data: { field: 'position', value: robustnessValues[18] }, expected: 'The value is bounded by maxlength.', tags: ['@negative'], automated: true },
  { title: 'Robustness bounds a 200-character value', kind: 'robustness', data: { field: 'first', value: robustnessValues[19] }, expected: 'The required field remains bounded and usable.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles ampersand text', kind: 'robustness', data: { field: 'company', value: robustnessValues[20] }, expected: 'Ampersand text is retained as data.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles semicolon text', kind: 'robustness', data: { field: 'position', value: robustnessValues[21] }, expected: 'Punctuation remains safe.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles backslash text', kind: 'robustness', data: { field: 'first', value: robustnessValues[22] }, expected: 'Backslash text does not escape the page.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles double quotes', kind: 'robustness', data: { field: 'last', value: robustnessValues[23] }, expected: 'Double quotes remain safe input.', tags: ['@negative'], automated: true },
  { title: 'Robustness handles single quotes', kind: 'robustness', data: { field: 'company', value: robustnessValues[24] }, expected: 'Single quotes remain safe input.', tags: ['@negative'], automated: true },
]);

const browserState = range(386, 'Browser State / Navigation', [
  { title: 'Reload preserves an empty form state', kind: 'browser-state', data: { scenario: 'reload-empty' }, expected: 'The form is visible after reloading the empty page.', tags: ['@smoke'], automated: true },
  { title: 'Reload handles a partially completed form', kind: 'browser-state', data: { scenario: 'reload-partial' }, expected: 'The page remains usable after partial input and reload.', tags: ['@smoke'], automated: true },
  { title: 'Back navigation returns to the registration page', kind: 'browser-state', data: { scenario: 'back' }, expected: 'The registration page can be recovered from history.', tags: ['@smoke'], automated: true },
  { title: 'Forward navigation returns to the registration page', kind: 'browser-state', data: { scenario: 'forward' }, expected: 'Forward navigation remains usable.', tags: ['@smoke'], automated: true },
  { title: 'A new tab can open the registration route', kind: 'browser-state', data: { scenario: 'new-tab' }, expected: 'A synthetic new tab renders the form and is closed after the test.', tags: ['@smoke'], automated: true },
  { title: 'Explicit page refresh keeps the form usable', kind: 'browser-state', data: { scenario: 'refresh' }, expected: 'The form is usable after refresh.', tags: ['@smoke'], automated: true },
  { title: 'Duplicate-tab behavior is isolated', kind: 'browser-state', data: { scenario: 'duplicate-tab' }, expected: 'Opening a second synthetic tab does not alter the first test page.', tags: ['@smoke'], automated: true },
  { title: 'LocalStorage access is stable for synthetic state', kind: 'browser-state', data: { scenario: 'local-storage' }, expected: 'The page can read/write isolated synthetic localStorage state.', tags: ['@smoke'], automated: true },
  { title: 'SessionStorage access is stable for synthetic state', kind: 'browser-state', data: { scenario: 'session-storage' }, expected: 'The page can read/write isolated synthetic sessionStorage state.', tags: ['@smoke'], automated: true },
  { title: 'Cookies can be inspected without sensitive data', kind: 'browser-state', data: { scenario: 'cookies' }, expected: 'Cookie inspection does not crash the page.', tags: ['@smoke'], automated: true },
  { title: 'Autofill-like input remains in the target control', kind: 'browser-state', data: { scenario: 'autofill' }, expected: 'Synthetic autofill-style input is retained.', tags: ['@smoke'], automated: true },
  { title: 'Copy-like value transfer remains stable', kind: 'browser-state', data: { scenario: 'copy' }, expected: 'Synthetic values can be copied between controls without page breakage.', tags: ['@smoke'], automated: true },
  { title: 'Paste-like value transfer remains stable', kind: 'browser-state', data: { scenario: 'paste' }, expected: 'Synthetic pasted values remain in the target control.', tags: ['@smoke'], automated: true },
  { title: 'Browser resize keeps the form visible', kind: 'browser-state', data: { scenario: 'resize' }, expected: 'The form remains visible after viewport resize.', tags: ['@responsive'], automated: true },
  { title: 'Temporary offline state can recover without data loss', kind: 'browser-state', data: { scenario: 'offline' }, expected: 'Synthetic form data remains available after offline/online transition.', tags: ['@network', '@negative'], automated: true },
]);

export const CASE_CATALOG: CaseDefinition[] = [
  ...smoke,
  ...email,
  ...names,
  ...company,
  ...position,
  ...mobile,
  ...confirmEmail,
  ...crossField,
  ...selection,
  ...upload,
  ...verification,
  ...network,
  ...responsive,
  ...accessibility,
  ...robustness,
  ...browserState,
];

export function casesBetween(first: number, last: number): CaseDefinition[] {
  return CASE_CATALOG.filter((testCase) => {
    const number = Number(testCase.id.slice(2));
    return number >= first && number <= last;
  });
}

export function titleFor(testCase: CaseDefinition): string {
  return `${testCase.id} - ${testCase.title} ${testCase.tags.join(' ')}`.trim();
}

export function validateCatalog(): void {
  if (CASE_CATALOG.length !== 400) {
    throw new Error(`Expected 400 test cases, found ${CASE_CATALOG.length}`);
  }
  const ids = CASE_CATALOG.map((testCase) => testCase.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== 400 || ids.some((id, index) => id !== `TC${String(index + 1).padStart(3, '0')}`)) {
    throw new Error('Test case IDs must be unique and contiguous from TC001 to TC400');
  }
}

validateCatalog();
