import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runOptionalTextCase } from './test-helpers';

for (const testCase of casesBetween(81, 90)) {
  test(titleFor(testCase), async ({ page, registrationPage }) => {
    await test.step(testCase.title, async () => runOptionalTextCase(testCase, registrationPage, 'position', page));
  });
}
