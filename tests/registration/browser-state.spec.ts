import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runBrowserStateCase } from './test-helpers';

for (const testCase of casesBetween(386, 400)) {
  test(titleFor(testCase), async ({ page, registrationPage }) => {
    await test.step(testCase.title, async () => runBrowserStateCase(testCase, registrationPage, page));
  });
}
