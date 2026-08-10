import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runNetworkCase } from './test-helpers';

for (const testCase of casesBetween(266, 300)) {
  test(titleFor(testCase), async ({ page, registrationPage }) => {
    await test.step(testCase.title, async () => runNetworkCase(testCase, registrationPage, page));
  });
}
