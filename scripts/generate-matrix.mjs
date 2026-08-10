import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'test-data/registration-cases.ts'), 'utf8');
const categoryRanges = [
  [1, 20, 'Smoke / Page / Basic Behavior'],
  [21, 130, 'Field Validation'],
  [131, 180, 'Cross-field / Business Validation'],
  [181, 215, 'Dropdown / Selection Controls'],
  [216, 250, 'File Upload'],
  [251, 265, 'Verification / CAPTCHA'],
  [266, 300, 'Submit / Network / Error Handling'],
  [301, 335, 'UI / Responsive / Layout'],
  [336, 360, 'Accessibility / Keyboard'],
  [361, 385, 'Input Robustness / Safe Security Validation'],
  [386, 400, 'Browser State / Navigation'],
];

function categoryFor(number) {
  return categoryRanges.find(([first, last]) => number >= first && number <= last)?.[2] ?? 'Unknown';
}

const rows = [];
for (const line of source.split('\n')) {
  if (!line.includes("{ title: '") || !line.includes("kind: '") || !line.includes("expected: '") || !line.includes('tags: [')) continue;
  const match = line.match(/^\s*\{ title: '([^']*)', kind: '([^']+)', data: (.*), expected: '([^']*)', tags: \[([^\]]*)\], automated: (true|false) \},$/);
  if (!match) continue;
  const number = rows.length + 1;
  const tags = match[5].split(',').map((tag) => tag.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean).join(' ');
  rows.push({
    id: `TC${String(number).padStart(3, '0')}`,
    category: categoryFor(number),
    title: match[1],
    kind: match[2],
    tags,
    automated: match[6] === 'true' ? 'Yes' : 'No',
    expected: match[4],
  });
}

if (rows.length !== 400) {
  throw new Error(`Could not parse exactly 400 case definitions; parsed ${rows.length}`);
}

const lines = [
  '# Test Case Matrix',
  '',
  'Generated from `test-data/registration-cases.ts` with ' + rows.length + ' logical cases.',
  '',
  '| ID | Category | Test Scenario | Preconditions | Steps | Test Data | Expected Result | Automated | Tag |',
  '| -- | -------- | ------------- | ------------- | ----- | --------- | --------------- | --------- | --- |',
];

for (const row of rows) {
  const preconditions = 'Target URL available; production side-effect routes guarded';
  const steps = `Open page; execute ${row.kind} scenario; assert the expected DOM/client behavior`;
  const data = row.kind === 'verification' ? 'Synthetic DOM state; CAPTCHA is not solved' : 'Synthetic values / DOM-derived options';
  lines.push(`| ${row.id} | ${row.category} | ${row.title} | ${preconditions} | ${steps} | ${data} | ${row.expected} | ${row.automated} | ${row.tags} |`);
}

await writeFile(path.join(root, 'docs/test-case-matrix.md'), `${lines.join('\n')}\n`);
console.log(`Wrote docs/test-case-matrix.md with ${rows.length} rows`);
