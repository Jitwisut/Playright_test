# Coverage Summary

## Planned logical coverage

| Category | Planned cases |
| --- | ---: |
| Smoke / Page / Basic Behavior | 20 |
| Field Validation | 110 |
| Cross-field / Business Validation | 50 |
| Dropdown / Selection Controls | 35 |
| File Upload | 35 |
| Verification / CAPTCHA | 15 |
| Submit / Network / Error Handling | 35 |
| UI / Responsive / Layout | 35 |
| Accessibility / Keyboard | 25 |
| Input Robustness / Safe Security Validation | 25 |
| Browser State / Navigation | 15 |
| **Total logical test cases** | **400** |

## Execution policy

- Default command: `npm test` / `npx playwright test --project=chromium`.
- Default execution excludes `@submission` and uses one worker.
- `@submission` cases are isolated and retain the endpoint safety guard; they never solve hCaptcha or create a real registration.
- Firefox and WebKit are opt-in through `CROSS_BROWSER=1` and intended for smoke/critical subsets first.

## Results

Chromium default regression was executed with one worker on 2026-08-10. The default run discovers 394 cases because the six `@submission` cases are excluded by configuration.

| Metric | Result |
| --- | ---: |
| Implemented | 400 |
| Default cases executed | 394 |
| Passed in final full run | 392 |
| Failed in final full run | 2 |
| Skipped | 0 |
| Logical coverage | 400 / 400 (100%) |

Failure classification and targeted confirmation:

- `TC353`: `APPLICATION_BUG` — strict accessibility assertion failed because two `aria-describedby` targets are missing; documented in `docs/bugs-found.md`.
- `TC278`: `ENVIRONMENT / NETWORK` — one production-page navigation timeout occurred in the full run; isolated rerun passed in 3.6 seconds.
- Corrective targeted reruns: required-field validation `TC267-TC270` passed 4/4; verification `TC251-TC265` passed 15/15; `TC278` passed 1/1.
- Isolated submission suite: `TC294-TC299` passed 6/6 with the production submit/upload route guard active.
- `TC353` is registered with Playwright `test.fail()` as an expected application failure, so the strict defect assertion remains active while the suite exits successfully; the Accessibility suite passed 42/42.

Considering the isolated rerun for the transient TC278 timeout, the latest evidence is 393/394 default cases passing with one confirmed application defect; including the six isolated submission cases, 399/400 logical cases have a passing execution.

## Known automation boundaries

- CAPTCHA challenge solving is intentionally not automated.
- Real successful registration cannot be validated without an approved test environment or a non-production verification fixture.
- Server-side upload response schemas are covered through route interception; public upload transmission is blocked.
- hCaptcha is a third-party dependency; when its iframe is unavailable, tests verify that the host form remains usable and record the dependency without bypassing it.
