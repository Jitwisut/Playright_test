import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runConfirmEmailCase, runCrossFieldCase } from './test-helpers';

for (const testCase of casesBetween(111, 130)) {
  test(titleFor(testCase), async ({ registrationPage }) => {
    await test.step(testCase.title, async () => runConfirmEmailCase(testCase, registrationPage));
  });
}

for (const testCase of casesBetween(131, 180)) {
  test(titleFor(testCase), async ({ registrationPage }) => {
    await test.step(testCase.title, async () => runCrossFieldCase(testCase, registrationPage));
  });
}
