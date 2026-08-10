import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runNameCase } from './test-helpers';

for (const testCase of casesBetween(41, 70)) {
  test(titleFor(testCase), async ({ page, registrationPage }) => {
    await test.step(testCase.title, async () => runNameCase(testCase, registrationPage, page));
  });
}
