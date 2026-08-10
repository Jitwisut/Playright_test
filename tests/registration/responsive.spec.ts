import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runResponsiveCase } from './test-helpers';

for (const testCase of casesBetween(301, 335)) {
  test(titleFor(testCase), async ({ page, registrationPage }) => {
    await test.step(testCase.title, async () => runResponsiveCase(testCase, registrationPage, page));
  });
}
