import { test } from '../../fixtures/registration.fixture';
import { casesBetween, titleFor } from '../../test-data/registration-cases';
import { runAccessibilityCase } from './test-helpers';

for (const testCase of casesBetween(336, 360)) {
  test(titleFor(testCase), async ({ page, registrationPage }) => {
    test.fail(testCase.id === 'TC353', 'Known application defect APP-001: missing aria-describedby targets for Country and Color.');
    await test.step(testCase.title, async () => runAccessibilityCase(testCase, registrationPage, page));
  });
}
