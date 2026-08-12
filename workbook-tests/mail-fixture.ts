import { readFile } from 'node:fs/promises';
import { expect } from '@playwright/test';
import { requireEnv } from './helpers';

export type MailFixture = {
  subject: string;
  fromEmail: string;
  fromName: string;
  to?: string;
  body?: string;
  receivedAt?: string;
};

export async function readMailFixture(): Promise<MailFixture> {
  const fixturePath = requireEnv('WORKBOOK_EMAIL_FIXTURE', 'Email validation needs a JSON message exported from the test mailbox');
  const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as Partial<MailFixture>;
  expect(fixture.subject, 'Mail fixture subject').toBeTruthy();
  expect(fixture.fromEmail, 'Mail fixture sender email').toBeTruthy();
  expect(fixture.fromName, 'Mail fixture sender name').toBeTruthy();
  return fixture as MailFixture;
}

export function expectRegistrationMail(message: MailFixture): void {
  expect(message.subject).toContain('Your Pet Fair South-East Asia 2026 Regist');
  expect(message.fromEmail.toLowerCase()).toBe('support@eventthai.com');
  expect(message.fromName).toContain('Pet Fair South East');
}
