import { expect, Locator, Page } from '@playwright/test';

export async function expectValuePreserved(locator: Locator, expected: string, maxLength?: number): Promise<void> {
  const actual = await locator.inputValue();
  if (maxLength !== undefined) {
    expect(actual.length).toBeLessThanOrEqual(maxLength);
  } else {
    expect(actual).toBe(expected);
  }
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

export async function expectNoExecutableEcho(page: Page, payload: string): Promise<void> {
  const securityLike = /[<>]/.test(payload)
    || /alert|onerror|onload|javascript:|etc\/passwd|\{\{|\}\}|\$\{|%00|\bOR\b/i.test(payload);
  if (payload.trim().length === 0 || !securityLike) return;
  const result = await page.evaluate((value) => {
    const scripts = Array.from(document.scripts).some((script) => script.textContent?.includes(value));
    const dangerousNodes = Array.from(document.querySelectorAll('[onerror], [onclick], [onload]')).some((node) =>
      node.outerHTML.includes(value),
    );
    return { scripts, dangerousNodes };
  }, payload);
  expect(result.scripts).toBe(false);
  expect(result.dangerousNodes).toBe(false);
}

export async function probeInterceptedResponse(page: Page, status: number): Promise<number> {
  const endpoint = new URL('/registrationv5/save_page/kiso26/ThqcXW', await page.url()).toString();
  let intercepted = false;
  await page.route('**/registrationv5/save_page/**', async (route) => {
    intercepted = true;
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ synthetic: true, status }) });
  });

  const observedStatus = await page.evaluate(async (url) => {
    const response = await fetch(url, { method: 'POST', body: new URLSearchParams({ synthetic: 'true' }) });
    return response.status;
  }, endpoint);

  expect(intercepted).toBe(true);
  return observedStatus;
}

export async function probeAbortedRequest(page: Page): Promise<boolean> {
  let aborted = false;
  await page.route('**/registrationv5/save_page/**', async (route) => {
    aborted = true;
    await route.abort('timedout');
  });
  await page.evaluate(async (url) => {
    try {
      await fetch(url, { method: 'POST', body: 'synthetic=true' });
    } catch {
      // Expected: this request is intentionally intercepted and aborted.
    }
  }, new URL('/registrationv5/save_page/kiso26/ThqcXW', await page.url()).toString());
  return aborted;
}
