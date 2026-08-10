import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runUploadCase } from './test-helpers';

for (const testCase of casesBetween(216, 250)) {
  test(titleFor(testCase), async ({ page, registrationPage }, testInfo) => {
    await test.step(testCase.title, async () => runUploadCase(testCase, registrationPage, page, testInfo));
  });
}
