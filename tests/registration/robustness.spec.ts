import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runRobustnessCase } from './test-helpers';

for (const testCase of casesBetween(361, 385)) {
  test(titleFor(testCase), async ({ page, registrationPage }) => {
    await test.step(testCase.title, async () => runRobustnessCase(testCase, registrationPage, page));
  });
}
