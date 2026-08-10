# Bugs Found

## Bug ID: APP-001

- Related Test: `TC353 - ARIA describedby targets exist for core inputs`
- Severity: Medium
- Title: Country and Color controls reference missing `aria-describedby` targets
- Steps to Reproduce:
  1. Open the Visitor Registration URL.
  2. Inspect `select#pf_countryID` and `input#pf_color`.
  3. Read their `aria-describedby` attributes.
  4. Check whether the referenced elements exist in the document.
- Expected: Every ID in `aria-describedby` resolves to an existing description or error node.
- Actual: `pf_countryID` references `pf_countryID_err` and `pf_color` references `pf_color_err`, but those IDs were not present in the rendered DOM during inspection.
- Screenshot/Trace: Playwright artifact from TC353 in `test-results/` when the test is run.
- Notes: This may reduce screen-reader access to validation feedback for Country and Color. The test assertion intentionally remains strict so the defect is not hidden. Until the application is fixed, `TC353` is classified with Playwright `test.fail()` as an expected application failure.

## Execution Classification: ENV-001

- Related Test: `TC278 - Synthetic API 403 response can be intercepted`
- Classification: `ENVIRONMENT / NETWORK`
- Severity: Low
- Title: One full-run navigation timed out before the synthetic API probe
- Steps to Reproduce:
  1. Run the default Chromium suite against the public target.
  2. Observe one `page.goto` timeout while initializing TC278.
  3. Rerun TC278 in isolation.
- Expected: The target form loads within the configured navigation timeout.
- Actual: One full-run attempt exceeded the 30-second navigation timeout; the isolated rerun passed in 3.6 seconds and the API response was intercepted synthetically.
- Screenshot/Trace: Playwright artifact from the full-run TC278 attempt in `test-results/`.
- Notes: Classified as transient environment/network behavior, not an application API defect. No production submission was sent.
