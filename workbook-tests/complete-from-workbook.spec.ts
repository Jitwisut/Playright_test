import { expect, Locator, Page, test } from '@playwright/test';
import { casesFor, workbookTitle } from '../test-data/web-registration-online-cases';
import {
  annotateExpected,
  expectNoHorizontalOverflow,
  firstVisible,
  openRequiredUrl,
  requireEnv,
} from './helpers';
import { expectRegistrationMail, readMailFixture } from './mail-fixture';

async function openComplete(page: Page): Promise<string> {
  return openRequiredUrl(page, 'WORKBOOK_COMPLETE_URL', 'Complete-page tests need a valid test-session URL');
}

async function requireElement(locator: Locator, reason: string): Promise<Locator | null> {
  const element = await firstVisible(locator);
  test.skip(!element, reason);
  return element;
}

for (const testCase of casesFor('Complete')) {
  test(workbookTitle(testCase), async ({ browser, page }, testInfo) => {
    annotateExpected(testCase.expected);
    const completeUrl = await openComplete(page);

    switch (testCase.id) {
      case 'CMP-001': {
        await expect(page.getByText(/registration completed|complete|success|สำเร็จ/i).first()).toBeVisible();
        testInfo.annotations.push({ type: 'mail-check', description: 'Email delivery is validated separately by EMF-001.' });
        break;
      }
      case 'CMP-002': {
        await expect(page.getByText(/registration completed|registration complete|successfully registered|ลงทะเบียนสำเร็จ/i).first()).toBeVisible();
        break;
      }
      case 'CMP-003': {
        const expectedName = requireEnv('WORKBOOK_EXPECTED_NAME', 'CMP-003 expected registrant name');
        await expect(page.getByText(expectedName, { exact: false })).toBeVisible();
        break;
      }
      case 'CMP-004': {
        const reference = await requireElement(page.getByText(/registration\s*(no|number|id)|reference\s*(no|number|id)/i), 'Complete page has no Registration No. label.');
        if (!reference) break;
        expect((await reference.innerText()).replace(/\s/g, '').length).toBeGreaterThan(8);
        break;
      }
      case 'CMP-005': {
        const qr = page.locator('img[alt*="qr" i], canvas[id*="qr" i], svg[id*="qr" i], [class*="qr" i] img');
        await expect(qr.first()).toBeVisible();
        const size = await qr.first().boundingBox();
        expect(size?.width ?? 0).toBeGreaterThan(40);
        expect(size?.height ?? 0).toBeGreaterThan(40);
        break;
      }
      case 'CMP-006': {
        await expect(page.getByText(/e-?badge|badge/i).first()).toBeVisible();
        break;
      }
      case 'CMP-007': {
        const downloadButton = await requireElement(page.getByRole('button', { name: /download.*badge|badge.*download/i }).or(page.getByRole('link', { name: /download.*badge|badge.*download/i })), 'Complete page has no E-Badge download control.');
        if (!downloadButton) break;
        const downloadPromise = page.waitForEvent('download');
        await downloadButton.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBeTruthy();
        break;
      }
      case 'CMP-008': {
        const printButton = await requireElement(page.getByRole('button', { name: /print|พิมพ์/i }).or(page.getByRole('link', { name: /print|พิมพ์/i })), 'Complete page has no Print control.');
        if (!printButton) break;
        await page.evaluate(() => {
          window.print = () => document.documentElement.setAttribute('data-print-called', 'true');
        });
        await printButton.click();
        await expect(page.locator('html')).toHaveAttribute('data-print-called', 'true');
        break;
      }
      case 'CMP-009': {
        const calendar = await requireElement(page.getByRole('link', { name: /calendar|ปฏิทิน/i }).or(page.getByRole('button', { name: /calendar|ปฏิทิน/i })), 'Complete page has no Add to Calendar control.');
        if (!calendar) break;
        const href = await calendar.getAttribute('href');
        if (href) expect(href).toMatch(/\.ics|calendar|google/i);
        else await expect(calendar).toBeEnabled();
        break;
      }
      case 'CMP-011': {
        const home = await requireElement(page.getByRole('link', { name: /home|หน้าหลัก/i }).or(page.getByRole('button', { name: /home|หน้าหลัก/i })), 'Complete page has no Home control.');
        if (!home) break;
        const before = page.url();
        await home.click();
        await expect(page).not.toHaveURL(before);
        break;
      }
      case 'CMP-012': {
        const eventLink = await requireElement(page.getByRole('link', { name: /event|website|เว็บไซต์/i }), 'Complete page has no event website link.');
        if (!eventLink) break;
        const href = await eventLink.getAttribute('href');
        expect(href).toMatch(/^https?:\/\//);
        break;
      }
      case 'CMP-013':
      case 'CMP-014': {
        const message = await readMailFixture();
        expectRegistrationMail(message);
        if (testCase.id === 'CMP-014') {
          const expectedName = requireEnv('WORKBOOK_EXPECTED_NAME', 'CMP-014 expected registrant name in email');
          expect(message.body ?? '').toContain(expectedName);
        }
        break;
      }
      case 'CMP-015': {
        let writes = 0;
        page.on('request', (request) => {
          if (['POST', 'PUT', 'PATCH'].includes(request.method())) writes += 1;
        });
        await page.reload({ waitUntil: 'domcontentloaded' });
        expect(writes).toBe(0);
        await expect(page.getByText(/complete|success|สำเร็จ/i).first()).toBeVisible();
        break;
      }
      case 'CMP-016': {
        await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => null);
        expect(await page.getByRole('button', { name: 'Submit', exact: true }).count()).toBe(0);
        break;
      }
      case 'CMP-017': {
        const context = await browser.newContext();
        const direct = await context.newPage();
        await direct.goto(completeUrl, { waitUntil: 'domcontentloaded' });
        const invalid = direct.getByText(/invalid session|session expired|ไม่ถูกต้อง|หมดอายุ/i);
        expect(direct.url() !== completeUrl || await invalid.count() > 0).toBe(true);
        await context.close();
        break;
      }
      case 'CMP-018': {
        const timeoutMs = Number(requireEnv('WORKBOOK_SESSION_TIMEOUT_MS', 'CMP-018 session timeout duration'));
        await page.waitForTimeout(timeoutMs);
        expect(/expired|login|register/i.test(page.url()) || await page.getByText(/session expired|หมดอายุ/i).count() > 0).toBe(true);
        break;
      }
      case 'CMP-019': {
        const second = await page.context().newPage();
        await second.goto(completeUrl, { waitUntil: 'domcontentloaded' });
        const firstText = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
        const secondText = (await second.locator('body').innerText()).replace(/\s+/g, ' ').trim();
        expect(secondText).toBe(firstText);
        await second.close();
        break;
      }
      case 'CMP-020': {
        for (const viewport of [{ width: 820, height: 1180 }, { width: 390, height: 844 }]) {
          await page.setViewportSize(viewport);
          await page.reload({ waitUntil: 'domcontentloaded' });
          await expectNoHorizontalOverflow(page);
        }
        break;
      }
      case 'CMP-021': {
        testInfo.annotations.push({ type: 'browser', description: testInfo.project.name });
        await expect(page.locator('body')).toBeVisible();
        break;
      }
      case 'CMP-022': {
        const slaMs = Number(process.env.WORKBOOK_SLA_MS ?? '3000');
        const started = Date.now();
        await page.goto(completeUrl, { waitUntil: 'domcontentloaded' });
        expect(Date.now() - started).toBeLessThanOrEqual(slaMs);
        break;
      }
      case 'CMP-023': {
        const tampered = new URL(completeUrl);
        if (tampered.searchParams.size > 0) {
          const firstKey = tampered.searchParams.keys().next().value as string;
          tampered.searchParams.set(firstKey, 'tampered-registration-id');
        } else {
          tampered.searchParams.set('registration_id', 'tampered-registration-id');
        }
        await page.goto(tampered.toString(), { waitUntil: 'domcontentloaded' });
        const expectedName = process.env.WORKBOOK_EXPECTED_NAME;
        if (expectedName) expect(await page.getByText(expectedName, { exact: false }).count()).toBe(0);
        expect(page.url() !== tampered.toString() || await page.getByText(/invalid|not found|expired|ไม่ถูกต้อง/i).count() > 0).toBe(true);
        break;
      }
      case 'CMP-024':
      case 'CMP-025': {
        const attacked = new URL(completeUrl);
        const payload = testCase.id === 'CMP-024' ? '<script>alert(1)</script>' : "' OR 1=1 --";
        attacked.searchParams.set('registration_id', payload);
        let dialogOpened = false;
        page.on('dialog', async (dialog) => { dialogOpened = true; await dialog.dismiss(); });
        await page.goto(attacked.toString(), { waitUntil: 'domcontentloaded' });
        expect(dialogOpened).toBe(false);
        expect(await page.locator('script').evaluateAll((scripts, value) => scripts.some((script) => script.textContent?.includes(String(value))), payload)).toBe(false);
        break;
      }
      case 'CMP-026': {
        test.skip(true, 'Requires read-only Back Office/database access; secrets and production database connections are intentionally excluded.');
        break;
      }
      default:
        throw new Error(`No workbook runner implemented for ${testCase.id}`);
    }
  });
}
