from __future__ import annotations

import os
import time
from urllib.parse import urlsplit

import pytest
from playwright.sync_api import Page, expect

from .cases import REGISTRATION_CASES, WorkbookCase
from .helpers import (
    PNG_1X1,
    REGISTRATION_URL,
    SYNTHETIC_EMAIL,
    digits,
    expect_no_horizontal_overflow,
    expect_payload_not_executable,
    fill_full_registration,
    fill_required_registration,
    install_registration_guards,
    open_registration,
    require_env,
    validity,
    writable_registration_environment,
)


EXPECTED_FAILURES = {
    "REG-004": "Live First Name field has no English-only pattern.",
    "REG-007": "Live Last Name field has no English-only pattern.",
    "REG-013": "Live Mobile field has no 8/15-digit validity constraint.",
    "REG-017": "Other detail textbox is not required on the live form.",
    "REG-021": "Current event form has no PDPA checkbox.",
    "REG-022": "Current event form has no PDPA checkbox.",
}


@pytest.mark.workbook
@pytest.mark.registration
@pytest.mark.parametrize("case", REGISTRATION_CASES, ids=lambda case: case.id)
def test_workbook_registration_case(
    case: WorkbookCase,
    workbook_page: Page,
    request: pytest.FixtureRequest,
) -> None:
    page = workbook_page
    if case.id in EXPECTED_FAILURES:
        request.node.add_marker(
            pytest.mark.xfail(reason=EXPECTED_FAILURES[case.id], strict=True)
        )

    if case.id == "REG-001":
        response = open_registration(page)
        assert response is not None and response.status == 200
        expect(page).to_have_title("Visitor Pre-Registration")
        expect(page.get_by_role("heading", name="Registrant Information")).to_be_visible()

    elif case.id == "REG-002":
        install_registration_guards(page)
        parts = urlsplit(REGISTRATION_URL)
        invalid_url = f"{parts.scheme}://{parts.netloc}/invalid-workbook-registration-url"
        response = page.goto(invalid_url, wait_until="domcontentloaded")
        body = page.locator("body").inner_text()
        assert (response is not None and response.status == 404) or any(
            text in body.lower() for text in ["404", "not found", "invalid", "ไม่พบ", "ไม่ถูกต้อง"]
        )

    elif case.id == "REG-003":
        open_registration(page)
        page.get_by_role("button", name="Submit", exact=True).click()
        assert page.locator("#registerV5Form :invalid").count() >= 4

    elif case.id == "REG-004":
        open_registration(page)
        field = page.locator("#pf_userFname")
        field.fill("John")
        assert validity(field)["valid"] is True
        field.fill("สมชาย")
        assert validity(field)["patternMismatch"] is True

    elif case.id == "REG-005":
        open_registration(page)
        field = page.locator("#pf_userFname")
        assert field.get_attribute("required") is not None
        assert validity(field)["valueMissing"] is True

    elif case.id == "REG-006":
        open_registration(page)
        field = page.locator("#pf_userFname")
        max_length = int(field.get_attribute("maxlength") or "0")
        assert max_length > 0
        field.fill("A" * 256)
        assert len(field.input_value()) <= max_length

    elif case.id == "REG-007":
        open_registration(page)
        field = page.locator("#pf_userLname")
        field.fill("Automation")
        assert validity(field)["valid"] is True
        field.fill("ใจดี")
        assert validity(field)["patternMismatch"] is True

    elif case.id == "REG-008":
        open_registration(page)
        email = page.locator("#pf_userEmail")
        email.fill("test@test.com")
        assert validity(email)["valid"] is True

    elif case.id == "REG-009":
        open_registration(page)
        email = page.locator("#pf_userEmail")
        email.fill("test@")
        assert validity(email)["typeMismatch"] is True

    elif case.id == "REG-010":
        if not writable_registration_environment():
            pytest.skip("Duplicate email needs non-production CAPTCHA test mode and write permission.")
        duplicate = require_env("WORKBOOK_DUPLICATE_EMAIL", "REG-010 duplicate account")
        open_registration(page, guarded=False)
        fill_full_registration(page)
        page.locator("#pf_userEmail").fill(duplicate)
        page.locator("#pf_userEmail_confirm").fill(duplicate)
        page.get_by_role("button", name="Submit", exact=True).click()
        expect(page.get_by_text("This account already exists.", exact=False)).to_be_visible()

    elif case.id == "REG-011":
        open_registration(page)
        mobile = page.locator("#pf_mobile")
        mobile.fill("812345678")
        assert digits(mobile.input_value()) == "812345678"

    elif case.id == "REG-012":
        open_registration(page)
        mobile = page.locator("#pf_mobile")
        mobile.fill("ABC123")
        state = mobile.evaluate("element => ({value: element.value, valid: element.validity.valid})")
        assert not (any(character.isalpha() for character in state["value"]) and state["valid"])

    elif case.id == "REG-013":
        open_registration(page)
        mobile = page.locator("#pf_mobile")
        mobile.fill("12345678")
        assert validity(mobile)["valid"] is False

    elif case.id == "REG-014":
        open_registration(page)
        dropdown = page.locator("#pf_userTitle")
        dropdown.select_option(label="Mr.")
        selected = dropdown.evaluate("select => select.selectedOptions[0]?.textContent?.trim()")
        assert selected == "Mr."

    elif case.id == "REG-015":
        open_registration(page)
        dropdown = page.locator("#pf_userTitle")
        assert dropdown.get_attribute("required") is not None
        assert validity(dropdown)["valueMissing"] is True

    elif case.id == "REG-016":
        open_registration(page)
        page.locator("#pf_userTitle").select_option(label="Other")
        expect(page.locator("#pf_userTitle_other")).to_be_visible()

    elif case.id == "REG-017":
        open_registration(page)
        fill_required_registration(page)
        page.locator("#pf_userTitle").select_option(label="Other")
        other = page.locator("#pf_userTitle_other")
        other.clear()
        assert other.evaluate("input => input.required && input.validity.valueMissing") is True

    elif case.id == "REG-018":
        open_registration(page)
        upload = page.locator("#pf_imgProfile")
        requests: list[str] = []
        page.on(
            "request",
            lambda observed: requests.append(observed.url)
            if "/registrationv5/upload" in observed.url
            else None,
        )
        upload.set_input_files(
            {"name": "image.png", "mimeType": "image/png", "buffer": PNG_1X1}
        )
        count = upload.evaluate("input => input.files?.length ?? 0")
        assert count == 1 or requests
        assert ".png" in (upload.get_attribute("accept") or "")

    elif case.id == "REG-019":
        open_registration(page)
        upload = page.locator("#pf_imgProfile")
        assert ".pdf" not in (upload.get_attribute("accept") or "")
        upload.set_input_files(
            {"name": "file.pdf", "mimeType": "application/pdf", "buffer": b"%PDF-1.4 synthetic"}
        )
        retained = upload.evaluate("input => input.files?.[0]?.name === 'file.pdf'")
        body = page.locator("body").inner_text().lower()
        assert not retained or any(word in body for word in ["upload failed", "invalid", "unsupported", "error"])

    elif case.id == "REG-020":
        open_registration(page)
        upload = page.locator("#pf_imgProfile")
        upload.set_input_files(
            {"name": "large.jpg", "mimeType": "image/jpeg", "buffer": bytes(20 * 1024 * 1024)}
        )
        cleared = upload.evaluate("input => (input.files?.length ?? 0) === 0")
        body = page.locator("body").inner_text().lower()
        assert cleared or any(word in body for word in ["upload failed", "large", "max", "size", "error"])

    elif case.id in {"REG-021", "REG-022"}:
        open_registration(page)
        consent = page.locator(
            'input[type="checkbox"][name*="consent" i], input[type="checkbox"][name*="pdpa" i]'
        ).first
        expect(consent).to_be_visible()
        if case.id == "REG-022":
            consent.check()

    elif case.id in {"REG-023", "REG-024"}:
        if not writable_registration_environment():
            pytest.skip("Real submit is restricted to an approved non-production CAPTCHA test environment.")
        open_registration(page, guarded=False)
        fill_full_registration(page)
        writes: list[str] = []
        page.on(
            "request",
            lambda observed: writes.append(observed.url)
            if "/registrationv5/save_page/" in observed.url
            else None,
        )
        submit = page.get_by_role("button", name="Submit", exact=True)
        submit.dblclick() if case.id == "REG-024" else submit.click()
        assert len(writes) == 1
        assert "question" in page.url.lower()

    elif case.id == "REG-025":
        timeout_ms = int(require_env("WORKBOOK_SESSION_TIMEOUT_MS", "REG-025 session timeout"))
        open_registration(page)
        page.wait_for_timeout(timeout_ms)
        expect(page.get_by_text("Session Expired", exact=False)).to_be_visible()

    elif case.id == "REG-026":
        open_registration(page)
        page.locator("#pf_userFname").fill("Workbook")
        page.reload(wait_until="domcontentloaded")
        expect(page.locator("#registerV5Form")).to_be_visible()

    elif case.id in {"REG-027", "REG-028", "REG-029", "REG-030"}:
        required_browser = {
            "REG-027": "chromium",
            "REG-028": "edge",
            "REG-029": "firefox",
            "REG-030": "webkit",
        }[case.id]
        configured = os.getenv("PW_BROWSER", "chromium").lower()
        if configured == "safari":
            configured = "webkit"
        if configured != required_browser:
            pytest.skip(f"Run this case with PW_BROWSER={required_browser}")
        open_registration(page)
        expect(page.locator("#registerV5Form")).to_be_visible()

    elif case.id == "REG-031":
        page.set_viewport_size({"width": 390, "height": 844})
        open_registration(page)
        expect_no_horizontal_overflow(page)

    elif case.id == "REG-032":
        open_registration(page)
        payload = "' OR 1=1 --"
        page.locator("#pf_companyName").fill(payload)
        expect(page.locator("#pf_companyName")).to_have_value(payload)
        expect_payload_not_executable(page, payload)

    elif case.id == "REG-033":
        open_registration(page)
        payload = "<script>alert(1)</script>"
        dialogs: list[str] = []
        page.on("dialog", lambda dialog: (dialogs.append(dialog.message), dialog.dismiss()))
        page.locator("#pf_companyName").fill(payload)
        expect_payload_not_executable(page, payload)
        assert dialogs == []

    elif case.id == "REG-034":
        open_registration(page)
        fill_required_registration(page)
        sla_ms = int(os.getenv("WORKBOOK_SLA_MS", "3000"))
        started = time.perf_counter()
        page.get_by_role("button", name="Submit", exact=True).click()
        elapsed_ms = (time.perf_counter() - started) * 1000
        assert elapsed_ms <= sla_ms

    elif case.id == "REG-035":
        open_registration(page)
        page.get_by_role("button", name="Submit", exact=True).click()
        for selector in ["#pf_userFname", "#pf_userTitle", "#pf_userLname"]:
            assert validity(page.locator(selector))["valid"] is False
        assert validity(page.get_by_role("radio").first)["valid"] is False

    elif case.id == "REG-036":
        open_registration(page)
        fields = {
            "#pf_userEmail": "Enter email address",
            "#pf_userFname": "Enter first name",
            "#pf_userLname": "Enter last name",
            "#pf_companyName": "Enter company name",
            "#pf_position": "Enter position",
            "#pf_mobile": "Enter mobile number",
        }
        for selector, placeholder in fields.items():
            expect(page.locator(selector)).to_have_attribute("placeholder", placeholder)

    elif case.id == "REG-037":
        open_registration(page)
        order = page.locator(
            '#registerV5Form input:not([type="hidden"]), #registerV5Form select, #registerV5Form button'
        ).evaluate_all(
            "elements => elements.filter(element => !element.disabled).map(element => element.id || element.name || element.textContent?.trim())"
        )
        assert order.index("pf_userFname") < order.index("pf_userLname")
        assert order.index("pf_userLname") < order.index("pf_companyName")

    elif case.id == "REG-038":
        open_registration(page)
        origin = f"{urlsplit(REGISTRATION_URL).scheme}://{urlsplit(REGISTRATION_URL).netloc}"
        page.context.grant_permissions(["clipboard-read", "clipboard-write"], origin=origin)
        source = page.locator("#pf_companyName")
        target = page.locator("#pf_position")
        source.fill("Copy Paste Test")
        source.select_text()
        page.keyboard.press("ControlOrMeta+C")
        target.focus()
        page.keyboard.press("ControlOrMeta+V")
        expect(target).to_have_value("Copy Paste Test")

    elif case.id == "REG-039":
        open_registration(page)
        field = page.locator("#pf_companyName")
        for value in ["English", "ภาษาไทย", "@#$%^&"]:
            field.fill(value)
            expect(field).to_have_value(value)
            expect_payload_not_executable(page, value)

    elif case.id == "REG-040":
        install_registration_guards(page)
        for viewport in [
            {"width": 1440, "height": 900},
            {"width": 820, "height": 1180},
            {"width": 390, "height": 844},
        ]:
            page.set_viewport_size(viewport)
            page.goto(REGISTRATION_URL, wait_until="domcontentloaded")
            expect(page.locator("#registerV5Form")).to_be_visible()
            expect_no_horizontal_overflow(page)

    elif case.id == "REG-041":
        pytest.skip("Needs a successful test registration and mailbox fixture; covered by EMF-001.")

    elif case.id == "REG-042":
        pytest.skip("Needs read-only test database or Back Office API access.")

    elif case.id == "REG-043":
        closed_url = require_env("WORKBOOK_CLOSED_EVENT_URL", "REG-043 closed/expired event URL")
        install_registration_guards(page)
        page.goto(closed_url, wait_until="domcontentloaded")
        body = page.locator("body").inner_text().lower()
        assert any(
            text in body
            for text in ["closed", "not open", "expired", "ปิดรับสมัคร", "ยังไม่เปิด", "หมดอายุ"]
        )

    else:
        raise AssertionError(f"No Python runner implemented for {case.id}")
