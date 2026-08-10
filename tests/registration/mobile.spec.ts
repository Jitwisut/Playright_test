import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runMobileCase } from './test-helpers';

for (const testCase of casesBetween(91, 110)) {
  test(titleFor(testCase), async ({ registrationPage }) => {
    await test.step(testCase.title, async () => runMobileCase(testCase, registrationPage));
  });
}
