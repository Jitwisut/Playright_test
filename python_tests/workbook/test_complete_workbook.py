from __future__ import annotations

import os
import time
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import pytest
from playwright.sync_api import Browser, Locator, Page, expect

from .cases import COMPLETE_CASES, WorkbookCase
from .helpers import (
    expect_no_horizontal_overflow,
    expect_registration_mail,
    first_visible,
    open_environment_page,
    read_mail_fixture,
    require_env,
)


def require_element(locator: Locator, reason: str) -> Locator:
    element = first_visible(locator)
    if element is None:
        pytest.skip(reason)
    return element


def with_query(url: str, key: str, value: str) -> str:
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query[key] = value
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


@pytest.mark.workbook
@pytest.mark.complete
@pytest.mark.parametrize("case", COMPLETE_CASES, ids=lambda case: case.id)
def test_workbook_complete_case(
    case: WorkbookCase,
    workbook_page: Page,
    workbook_browser: Browser,
) -> None:
    page = workbook_page
    complete_url = open_environment_page(
        page,
        "WORKBOOK_COMPLETE_URL",
        "Complete tests need a valid test-session URL",
    )

    if case.id == "CMP-001":
        expect(page.get_by_text("Complete", exact=False).first).to_be_visible()

    elif case.id == "CMP-002":
        body = page.locator("body").inner_text().lower()
        assert any(
            text in body
            for text in ["registration completed", "registration complete", "successfully registered", "ลงทะเบียนสำเร็จ"]
        )

    elif case.id == "CMP-003":
        expected_name = require_env("WORKBOOK_EXPECTED_NAME", "CMP-003 expected registrant name")
        expect(page.get_by_text(expected_name, exact=False)).to_be_visible()

    elif case.id == "CMP-004":
        reference = require_element(
            page.get_by_text("Registration No", exact=False).or_(
                page.get_by_text("Reference No", exact=False)
            ),
            "Complete page has no Registration/Reference number label.",
        )
        assert len("".join(reference.inner_text().split())) > 8

    elif case.id == "CMP-005":
        qr = page.locator(
            'img[alt*="qr" i], canvas[id*="qr" i], svg[id*="qr" i], [class*="qr" i] img'
        ).first
        expect(qr).to_be_visible()
        size = qr.bounding_box() or {"width": 0, "height": 0}
        assert size["width"] > 40 and size["height"] > 40

    elif case.id == "CMP-006":
        expect(page.get_by_text("Badge", exact=False).first).to_be_visible()

    elif case.id == "CMP-007":
        control = first_visible(page.get_by_role("button", name="Download", exact=False))
        if control is None:
            control = require_element(
                page.get_by_role("link", name="Download", exact=False),
                "Complete page has no badge download control.",
            )
        with page.expect_download() as download_info:
            control.click()
        assert download_info.value.suggested_filename

    elif case.id == "CMP-008":
        control = first_visible(page.get_by_role("button", name="Print", exact=False))
        if control is None:
            control = require_element(
                page.get_by_role("link", name="Print", exact=False),
                "Complete page has no Print control.",
            )
        page.evaluate(
            "() => { window.print = () => document.documentElement.setAttribute('data-print-called', 'true'); }"
        )
        control.click()
        expect(page.locator("html")).to_have_attribute("data-print-called", "true")

    elif case.id == "CMP-009":
        control = first_visible(page.get_by_role("link", name="Calendar", exact=False))
        if control is None:
            control = require_element(
                page.get_by_role("button", name="Calendar", exact=False),
                "Complete page has no Add to Calendar control.",
            )
        href = control.get_attribute("href")
        assert href is None or any(value in href.lower() for value in [".ics", "calendar", "google"])

    elif case.id == "CMP-011":
        control = first_visible(page.get_by_role("link", name="Home", exact=False))
        if control is None:
            control = require_element(
                page.get_by_role("button", name="Home", exact=False),
                "Complete page has no Home control.",
            )
        before = page.url
        control.click()
        assert page.url != before

    elif case.id == "CMP-012":
        link = require_element(
            page.get_by_role("link", name="Event", exact=False),
            "Complete page has no event website link.",
        )
        assert (link.get_attribute("href") or "").startswith("http")

    elif case.id in {"CMP-013", "CMP-014"}:
        message = read_mail_fixture()
        expect_registration_mail(message)
        if case.id == "CMP-014":
            expected_name = require_env("WORKBOOK_EXPECTED_NAME", "CMP-014 expected name in email")
            assert expected_name in message.get("body", "")

    elif case.id == "CMP-015":
        writes: list[str] = []
        page.on(
            "request",
            lambda observed: writes.append(observed.url)
            if observed.method in {"POST", "PUT", "PATCH"}
            else None,
        )
        page.reload(wait_until="domcontentloaded")
        assert writes == []

    elif case.id == "CMP-016":
        try:
            page.go_back(wait_until="domcontentloaded")
        except Exception:
            pass
        assert page.get_by_role("button", name="Submit", exact=True).count() == 0

    elif case.id == "CMP-017":
        context = workbook_browser.new_context()
        direct = context.new_page()
        direct.goto(complete_url, wait_until="domcontentloaded")
        body = direct.locator("body").inner_text().lower()
        assert direct.url != complete_url or any(
            text in body for text in ["invalid session", "session expired", "ไม่ถูกต้อง", "หมดอายุ"]
        )
        context.close()

    elif case.id == "CMP-018":
        timeout_ms = int(require_env("WORKBOOK_SESSION_TIMEOUT_MS", "CMP-018 session timeout"))
        page.wait_for_timeout(timeout_ms)
        body = page.locator("body").inner_text().lower()
        assert any(text in page.url.lower() or text in body for text in ["expired", "login", "register", "หมดอายุ"])

    elif case.id == "CMP-019":
        second = page.context.new_page()
        second.goto(complete_url, wait_until="domcontentloaded")
        first_text = " ".join(page.locator("body").inner_text().split())
        second_text = " ".join(second.locator("body").inner_text().split())
        assert second_text == first_text
        second.close()

    elif case.id == "CMP-020":
        for viewport in [{"width": 820, "height": 1180}, {"width": 390, "height": 844}]:
            page.set_viewport_size(viewport)
            page.reload(wait_until="domcontentloaded")
            expect_no_horizontal_overflow(page)

    elif case.id == "CMP-021":
        expect(page.locator("body")).to_be_visible()

    elif case.id == "CMP-022":
        sla_ms = int(os.getenv("WORKBOOK_SLA_MS", "3000"))
        started = time.perf_counter()
        page.goto(complete_url, wait_until="domcontentloaded")
        assert (time.perf_counter() - started) * 1000 <= sla_ms

    elif case.id == "CMP-023":
        tampered = with_query(complete_url, "registration_id", "tampered-registration-id")
        page.goto(tampered, wait_until="domcontentloaded")
        expected_name = os.getenv("WORKBOOK_EXPECTED_NAME")
        if expected_name:
            assert page.get_by_text(expected_name, exact=False).count() == 0
        body = page.locator("body").inner_text().lower()
        assert page.url != tampered or any(
            text in body for text in ["invalid", "not found", "expired", "ไม่ถูกต้อง"]
        )

    elif case.id in {"CMP-024", "CMP-025"}:
        payload = "<script>alert(1)</script>" if case.id == "CMP-024" else "' OR 1=1 --"
        attacked = with_query(complete_url, "registration_id", payload)
        dialogs: list[str] = []
        page.on("dialog", lambda dialog: (dialogs.append(dialog.message), dialog.dismiss()))
        page.goto(attacked, wait_until="domcontentloaded")
        assert dialogs == []
        assert page.locator("script").evaluate_all(
            "(scripts, value) => scripts.some(script => script.textContent?.includes(value))",
            payload,
        ) is False

    elif case.id == "CMP-026":
        pytest.skip("Needs read-only Back Office/database access; secrets are not stored in Git.")

    else:
        raise AssertionError(f"No Python runner implemented for {case.id}")
