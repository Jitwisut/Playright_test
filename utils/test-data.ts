import { generateLongString, generateThaiName } from './generators';

export const validProfile = {
  firstName: 'Test',
  lastName: 'Automation',
  company: 'Playwright QA Test',
  position: 'QA Engineer',
  email: 'qa.playwright@example.test',
  mobile: '812345678',
  country: 'THAILAND',
  color: '#336699',
  jobTitle: 'Mr.',
  industry: 'Energy',
};

export const industryOptions = [
  'Government & Public Services',
  'Energy',
  'Transportation',
];

export const jobTitleOptions = ['Mr.', 'Miss', 'Mrs.', 'Other'];

export const countryOptions = ['THAILAND', 'JAPAN', 'UNITED STATES OF AMERICA', 'SINGAPORE'];

export const validEmails = [
  'qa@example.test',
  'qa.playwright+case@example.test',
  'qa@mail.example.test',
  'QA.Automation@EXAMPLE.TEST',
  'a-b_c.d+e@example.test',
];

export const invalidEmails = [
  'plainaddress',
  'qa@',
  '@example.test',
  'qa@@example.test',
  'qa automation@example.test',
  ' qa@example.test',
  'qa@example.test ',
  'qa@example',
  'qa..automation@example.test',
  'ทดสอบ@example.test',
  'qa@ตัวอย่าง.ไทย',
  'qa!$%@example.test',
];

export const textRobustnessValues = [
  'normal value',
  'ภาษาไทย',
  'ไทย English',
  'éclair',
  'name-with-hyphen',
  "name's apostrophe",
  'name  with  spaces',
  '12345',
  'name@example.test',
  '<script>alert(1)</script>',
  "' OR '1'='1",
  '😀🧪',
  'שלום',
  'null',
  'undefined',
];

export const mobileValues = [
  '',
  '0812345678',
  '812345678',
  '+66812345678',
  '+1 202 555 0100',
  '123456789',
  '1234567890',
  '12345678901',
  '12345',
  '123456789012345',
  'abcdefghij',
  '081-234-5678',
  '(081) 234 5678',
  '+66-81-234-5678',
  '12.34',
  '-0812345678',
  '๐๘๑๒๓๔๕๖๗๘',
  ' 0812345678',
  '0812345678 ',
  '☎️0812345678',
];

export const robustnessValues = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "' OR '1'='1",
  '../../../../etc/passwd',
  '{{7*7}}',
  '${7*7}',
  '%00',
  '😀 Unicode',
  'مرحبا RTL',
  'line\nbreak',
  'tab\tvalue',
  'null',
  'undefined',
  'NaN',
  'Infinity',
  generateLongString(80),
  generateThaiName(),
  'a'.repeat(50),
  'a'.repeat(51),
  'a'.repeat(200),
  'safe & harmless',
  'semi;colon',
  'back\\slash',
  'quote"double',
  "quote'single",
];
