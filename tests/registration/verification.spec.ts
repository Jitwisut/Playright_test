import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runVerificationCase } from './test-helpers';

for (const testCase of casesBetween(251, 265)) {
  test(titleFor(testCase), async ({ page, registrationPage }, testInfo) => {
    await test.step(testCase.title, async () => runVerificationCase(testCase, registrationPage, page, testInfo));
  });
}
