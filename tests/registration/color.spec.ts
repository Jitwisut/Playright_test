import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runSelectionCase } from './test-helpers';

for (const testCase of casesBetween(196, 202)) {
  test(titleFor(testCase), async ({ page, registrationPage }) => {
    await test.step(testCase.title, async () => runSelectionCase(testCase, registrationPage, page));
  });
}
