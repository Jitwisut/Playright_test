import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { readSheet } from 'read-excel-file/node';

const WORKBOOK_FILENAME = 'Trainee BU3_ Manage Expopass.xlsx';
const WORKSHEET_NAME = 'Web Registration Online';
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PASSWORD_PATTERN = /(?:password|รหัสผ่าน)\s*[:=]?\s*([^\s]+)/i;
const URL_PATTERN = /https?:\/\/[^\s]+/i;

function discoverWorkbookPath(): string | undefined {
  if (process.env.WORKBOOK_XLSX_PATH) {
    const configured = resolve(process.env.WORKBOOK_XLSX_PATH);
    if (!existsSync(configured)) {
      throw new Error(`WORKBOOK_XLSX_PATH does not exist: ${configured}`);
    }
    return configured;
  }

  return [
    resolve(homedir(), 'Downloads', WORKBOOK_FILENAME),
    resolve(process.cwd(), WORKBOOK_FILENAME),
  ].find(existsSync);
}

function setDefault(name: string, value: string | undefined, loaded: string[]): void {
  if (value && !process.env[name]) {
    process.env[name] = value;
    loaded.push(name);
  }
}

export async function loadExcelEnvironment(): Promise<string[]> {
  if (process.env.WORKBOOK_AUTOLOAD_EXCEL === '0') return [];

  const workbookPath = discoverWorkbookPath();
  if (!workbookPath) return [];

  const rows = await readSheet(workbookPath, WORKSHEET_NAME);
  const conferenceText = String(rows[112]?.[5] ?? '');
  const inviteText = String(rows[119]?.[5] ?? '');
  const loaded: string[] = [];

  setDefault('WORKBOOK_CONFERENCE_USER', conferenceText.match(EMAIL_PATTERN)?.[0], loaded);
  setDefault('WORKBOOK_CONFERENCE_PASSWORD', conferenceText.match(PASSWORD_PATTERN)?.[1], loaded);
  setDefault('WORKBOOK_INVITE_URL', inviteText.match(URL_PATTERN)?.[0]?.replace(/[.,);\]]+$/, ''), loaded);
  return loaded;
}

export default async function globalSetup(): Promise<void> {
  const loaded = await loadExcelEnvironment();
  if (loaded.length > 0) {
    console.log(`[workbook] Excel defaults loaded; values hidden: ${loaded.join(', ')}`);
  }
}
