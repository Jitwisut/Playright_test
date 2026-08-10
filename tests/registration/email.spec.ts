import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runEmailCase } from './test-helpers';

for (const testCase of casesBetween(21, 40)) {
  test(titleFor(testCase), async ({ registrationPage }) => {
    await test.step(testCase.title, async () => runEmailCase(testCase, registrationPage));
  });
}
