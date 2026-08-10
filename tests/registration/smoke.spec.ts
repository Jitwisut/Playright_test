import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runSmokeCase } from './test-helpers';

for (const testCase of casesBetween(1, 20)) {
  test(titleFor(testCase), async ({ page, registrationPage, browserHealth }) => {
    await test.step(testCase.title, async () => runSmokeCase(testCase, registrationPage, page, browserHealth));
  });
}
