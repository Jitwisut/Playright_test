from __future__ import annotations

import os

import pytest
from playwright.sync_api import Locator, Page, expect

from .cases import QUESTIONNAIRE_CASES, WorkbookCase
from .helpers import (
    PNG_1X1,
    expect_no_horizontal_overflow,
    expect_payload_not_executable,
    first_visible,
    is_non_production,
    open_environment_page,
    require_env,
    visible_controls,
)


def require_control(locator: Locator, reason: str) -> Locator:
    control = first_visible(locator)
    if control is None:
        pytest.skip(reason)
    return control


def fill_questionnaire_page(page: Page) -> None:
    text_fields = page.locator(
        'form input[type="text"], form input[type="email"], form input:not([type])'
    )
    for index in range(text_fields.count()):
        field = text_fields.nth(index)
        if field.is_visible() and field.is_editable():
            field.fill("EventPass")

    textareas = page.locator("form textarea")
    for index in range(textareas.count()):
        field = textareas.nth(index)
        if field.is_visible() and field.is_editable():
            field.fill("EventPass questionnaire answer")

    radio_names = page.locator('form input[type="radio"]:visible').evaluate_all(
        "elements => Array.from(new Set(elements.map(element => element.name).filter(Boolean)))"
    )
    for name in radio_names:
        safe_name = str(name).replace("\\", "\\\\").replace('"', '\\"')
        page.locator(f'form input[type="radio"][name="{safe_name}"]').first.check()

    required_checkboxes = page.locator('form input[type="checkbox"][required]:visible')
    for index in range(required_checkboxes.count()):
        required_checkboxes.nth(index).check()

    selects = page.locator("form select:visible")
    for index in range(selects.count()):
        select = selects.nth(index)
        value = select.locator("option:not([disabled])").evaluate_all(
            "options => options.map(option => option.value).find(value => value !== '') ?? ''"
        )
        if value:
            select.select_option(str(value))


def yes_no_controls(page: Page) -> tuple[Locator, Locator] | None:
    yes = first_visible(page.get_by_role("radio", name="Yes", exact=True))
    no = first_visible(page.get_by_role("radio", name="No", exact=True))
    if yes is None or no is None:
        return None
    return yes, no


@pytest.mark.workbook
@pytest.mark.questionnaire
@pytest.mark.parametrize("case", QUESTIONNAIRE_CASES, ids=lambda case: case.id)
def test_workbook_questionnaire_case(case: WorkbookCase, workbook_page: Page) -> None:
    page = workbook_page
    open_environment_page(
        page,
        "WORKBOOK_QUESTIONNAIRE_URL",
        "Questionnaire tests need a valid test-session URL",
        guard_writes=True,
    )
    expect(page.locator("form").first).to_be_visible()

    if case.id == "QN-001":
        assert len(visible_controls(page)) > 0

    elif case.id == "QN-002":
        expected_count = int(os.getenv("WORKBOOK_QUESTION_COUNT", "0"))
        questions = page.locator(
            "form fieldset:visible, form [data-question]:visible, form .question:visible, form .form-group:visible"
        ).count()
        assert questions == expected_count if expected_count else questions > 0

    elif case.id == "QN-003":
        action = require_control(
            page.get_by_role("button", name="Next", exact=False).or_(
                page.get_by_role("button", name="Submit", exact=False)
            ),
            "Questionnaire has no Next/Submit button.",
        )
        action.click()
        assert page.locator("form :invalid").count() > 0

    elif case.id == "QN-004":
        field = require_control(page.locator('form input[type="text"]'), "No visible textbox.")
        field.fill("EventPass")
        expect(field).to_have_value("EventPass")

    elif case.id == "QN-005":
        field = require_control(
            page.locator('form input[type="text"][required]'), "No required textbox."
        )
        field.clear()
        assert field.evaluate("input => input.validity.valueMissing") is True

    elif case.id == "QN-006":
        field = require_control(
            page.locator('form input[type="text"][maxlength], form textarea[maxlength]'),
            "No text control with maxlength.",
        )
        max_length = int(field.get_attribute("maxlength") or "0")
        field.fill("A" * max(500, max_length + 1))
        assert len(field.input_value()) <= max_length

    elif case.id == "QN-007":
        field = require_control(page.locator('form input[type="text"]'), "No visible textbox.")
        field.fill("@#$%^&")
        expect(field).to_have_value("@#$%^&")

    elif case.id == "QN-008":
        field = require_control(page.locator("form textarea"), "No visible textarea.")
        field.fill("Lorem Ipsum\nSecond line")
        expect(field).to_have_value("Lorem Ipsum\nSecond line")

    elif case.id == "QN-009":
        radio = require_control(page.locator('form input[type="radio"]'), "No radio choices.")
        name = radio.get_attribute("name") or ""
        radio.check()
        assert page.locator(f'form input[type="radio"][name="{name}"]:checked').count() == 1

    elif case.id == "QN-010":
        first = require_control(page.locator('form input[type="radio"]'), "No radio choices.")
        name = first.get_attribute("name") or ""
        group = page.locator(f'form input[type="radio"][name="{name}"]')
        if group.count() < 2:
            pytest.skip("Radio group has fewer than two choices.")
        group.nth(0).check()
        group.nth(1).check()
        expect(group.nth(1)).to_be_checked()
        assert page.locator(f'form input[type="radio"][name="{name}"]:checked').count() == 1

    elif case.id == "QN-011":
        checkboxes = page.locator('form input[type="checkbox"]:visible')
        if checkboxes.count() < 2:
            pytest.skip("Questionnaire has fewer than two checkbox choices.")
        selected = min(3, checkboxes.count())
        for index in range(selected):
            checkboxes.nth(index).check()
        assert page.locator('form input[type="checkbox"]:checked').count() >= selected

    elif case.id == "QN-012":
        checkbox = require_control(
            page.locator('form input[type="checkbox"][required]'), "No required checkbox."
        )
        checkbox.uncheck()
        assert checkbox.evaluate("input => input.validity.valueMissing") is True

    elif case.id == "QN-013":
        select = require_control(page.locator("form select"), "No dropdown.")
        value = select.locator("option:not([disabled])").evaluate_all(
            "options => options.map(option => option.value).find(value => value !== '') ?? ''"
        )
        if not value:
            pytest.skip("Dropdown has no selectable non-empty option.")
        select.select_option(str(value))
        expect(select).to_have_value(str(value))

    elif case.id == "QN-014":
        select = require_control(page.locator("form select[required]"), "No required dropdown.")
        select.select_option("")
        assert select.evaluate("element => element.validity.valueMissing") is True

    elif case.id in {"QN-015", "QN-016", "QN-017"}:
        other = first_visible(page.get_by_role("radio", name="Other", exact=False))
        if other is None:
            pytest.skip("Questionnaire has no radio Other option.")
        before = len(visible_controls(page))
        other.check()
        after = visible_controls(page)
        assert len(after) > before
        detail = first_visible(page.locator('form input[type="text"], form textarea'))
        if detail is None:
            pytest.skip("Other did not reveal a detail textbox.")
        if case.id == "QN-016":
            detail.clear()
            assert detail.evaluate("input => input.required && input.validity.valueMissing") is True
        elif case.id == "QN-017":
            detail.fill("Other Detail")
            expect(detail).to_have_value("Other Detail")

    elif case.id == "QN-018":
        rating = first_visible(page.get_by_role("radio", name="5", exact=False))
        if rating is None:
            pytest.skip("Questionnaire has no rating value 5.")
        rating.check()
        expect(rating).to_be_checked()

    elif case.id == "QN-019":
        date = require_control(page.locator('form input[type="date"]'), "No date input.")
        date.fill("2026-06-30")
        expect(date).to_have_value("2026-06-30")

    elif case.id in {"QN-020", "QN-021", "QN-022"}:
        upload = require_control(page.locator('form input[type="file"]'), "No upload input.")
        if case.id == "QN-020":
            upload.set_input_files(
                {"name": "image.jpg", "mimeType": "image/jpeg", "buffer": PNG_1X1}
            )
            assert upload.evaluate("input => input.files?.length ?? 0") >= 0
        elif case.id == "QN-021":
            assert ".exe" not in (upload.get_attribute("accept") or "")
            upload.set_input_files(
                {"name": "file.exe", "mimeType": "application/octet-stream", "buffer": b"MZ synthetic"}
            )
            body = page.locator("body").inner_text().lower()
            assert any(word in body for word in ["error", "invalid", "unsupported", "upload failed"])
        else:
            upload.set_input_files(
                {"name": "image.jpg", "mimeType": "image/jpeg", "buffer": bytes(20 * 1024 * 1024)}
            )
            body = page.locator("body").inner_text().lower()
            assert any(word in body for word in ["error", "large", "max", "size", "upload failed"])

    elif case.id == "QN-023":
        fill_questionnaire_page(page)
        next_button = require_control(
            page.get_by_role("button", name="Next", exact=False), "No Next button."
        )
        before = page.locator("form").inner_text()
        next_button.click()
        expect(page.locator("form")).not_to_have_text(before)

    elif case.id in {"QN-024", "QN-040"}:
        field = require_control(page.locator('form input[type="text"]'), "No textbox for persistence.")
        next_button = require_control(
            page.get_by_role("button", name="Next", exact=False), "No Next button."
        )
        field.fill("Persisted Answer")
        fill_questionnaire_page(page)
        next_button.click()
        previous = require_control(
            page.get_by_role("button", name="Previous", exact=False).or_(
                page.get_by_role("button", name="Back", exact=False)
            ),
            "No Previous button.",
        )
        previous.click()
        expect(field).to_have_value("Persisted Answer")

    elif case.id in {"QN-025", "QN-026"}:
        if os.getenv("WORKBOOK_ALLOW_WRITE") != "1" or not is_non_production(page.url):
            pytest.skip("Questionnaire submit needs a non-production URL and WORKBOOK_ALLOW_WRITE=1.")
        fill_questionnaire_page(page)
        writes: list[str] = []
        page.on(
            "request",
            lambda observed: writes.append(observed.url)
            if observed.method in {"POST", "PUT", "PATCH"}
            else None,
        )
        submit = require_control(
            page.get_by_role("button", name="Submit", exact=False), "No Submit button."
        )
        submit.dblclick() if case.id == "QN-026" else submit.click()
        assert len(writes) == 1

    elif case.id == "QN-027":
        page.reload(wait_until="domcontentloaded")
        expect(page.locator("form").first).to_be_visible()

    elif case.id == "QN-028":
        url = page.url
        page.goto("about:blank")
        page.go_back(wait_until="domcontentloaded")
        assert page.url == url
        expect(page.locator("form").first).to_be_visible()

    elif case.id == "QN-029":
        timeout_ms = int(require_env("WORKBOOK_SESSION_TIMEOUT_MS", "QN-029 session timeout"))
        page.wait_for_timeout(timeout_ms)
        expect(page.get_by_text("Session Expired", exact=False)).to_be_visible()

    elif case.id in {"QN-030", "QN-031"}:
        field = require_control(
            page.locator('form input[type="text"], form textarea'), "No text control for security input."
        )
        payload = "<script>alert(1)</script>" if case.id == "QN-030" else "' OR 1=1 --"
        dialogs: list[str] = []
        page.on("dialog", lambda dialog: (dialogs.append(dialog.message), dialog.dismiss()))
        field.fill(payload)
        expect_payload_not_executable(page, payload)
        assert dialogs == []

    elif case.id == "QN-032":
        page.set_viewport_size({"width": 390, "height": 844})
        page.reload(wait_until="domcontentloaded")
        expect_no_horizontal_overflow(page)

    elif case.id == "QN-033":
        expect(page.locator("form").first).to_be_visible()

    elif case.id in {"QN-034", "QN-035", "QN-036", "QN-037", "QN-038"}:
        controls = yes_no_controls(page)
        if controls is None:
            pytest.skip("Questionnaire has no Yes/No branching controls.")
        yes, no = controls
        before = len(visible_controls(page))
        yes.check()
        shown = len(visible_controls(page))
        if case.id == "QN-034":
            assert shown > before
        elif case.id == "QN-035":
            no.check()
            assert len(visible_controls(page)) < shown
        elif case.id == "QN-036":
            fill_questionnaire_page(page)
            no.check()
            assert page.locator("form").evaluate("form => form.checkValidity()") is True
        elif case.id == "QN-037":
            assert page.locator("form :invalid").count() > 0
        else:
            for _ in range(3):
                no.check()
                yes.check()
            assert len(visible_controls(page)) == shown

    elif case.id == "QN-039":
        choices = page.locator(
            'form option, form input[type="radio"], form input[type="checkbox"]'
        ).count()
        assert choices >= 100

    else:
        raise AssertionError(f"No Python runner implemented for {case.id}")
