from __future__ import annotations

import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

import pytest
from playwright.sync_api import Locator, Page, TimeoutError as PlaywrightTimeoutError, expect


REGISTRATION_URL = os.getenv(
    "WORKBOOK_REGISTRATION_URL",
    "https://registration.expopass.co/register/form/kiso26/ThqcXW",
)
SYNTHETIC_EMAIL = "qa.workbook@example.test"
PNG_1X1 = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c6360f8cfc000000301010018dd8db10000000049454e44"
    "ae426082"
)


def require_env(name: str, purpose: str) -> str:
    value = os.getenv(name)
    if not value:
        pytest.skip(f"{purpose}: set environment variable {name}")
    return value


def is_non_production(url: str) -> bool:
    hostname = (urlparse(url).hostname or "").lower()
    return not (
        hostname == "registration.expopass.co"
        or hostname.endswith(".expopass.co")
        or hostname == "eventpassinsight.co"
        or hostname.endswith(".eventpassinsight.co")
    )


def writable_registration_environment() -> bool:
    return (
        os.getenv("WORKBOOK_ALLOW_WRITE") == "1"
        and os.getenv("WORKBOOK_CAPTCHA_TEST_MODE") == "1"
        and is_non_production(REGISTRATION_URL)
    )


def install_registration_guards(page: Page) -> None:
    page.route("**/registrationv5/save_page/**", lambda route: route.abort("blockedbyclient"))
    page.route("**/registrationv5/upload", lambda route: route.abort("blockedbyclient"))


def guard_mutating_requests(page: Page, target_url: str) -> None:
    if os.getenv("WORKBOOK_ALLOW_WRITE") == "1" and is_non_production(target_url):
        return

    def guard(route) -> None:
        if route.request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            route.abort("blockedbyclient")
        else:
            route.continue_()

    page.route("**/*", guard)


def open_registration(page: Page, guarded: bool = True):
    if guarded:
        install_registration_guards(page)
    response = None
    for attempt in range(2):
        try:
            response = page.goto(REGISTRATION_URL, wait_until="domcontentloaded")
            break
        except PlaywrightTimeoutError:
            if attempt == 1:
                raise
            page.goto("about:blank", wait_until="commit", timeout=5_000)
    expect(page.locator("#registerV5Form")).to_be_visible()
    return response


def validity(locator: Locator) -> dict[str, bool]:
    return locator.evaluate(
        """element => ({
          valid: element.validity.valid,
          valueMissing: element.validity.valueMissing,
          typeMismatch: element.validity.typeMismatch,
          patternMismatch: element.validity.patternMismatch
        })"""
    )


def fill_required_registration(page: Page) -> None:
    page.locator("#pf_userFname").fill("Workbook")
    page.locator("#pf_userLname").fill("Automation")
    page.locator("#pf_userTitle").select_option(label="Mr.")
    page.get_by_role("radio", name="Energy", exact=True).check()


def fill_full_registration(page: Page) -> None:
    page.locator("#pf_userEmail").fill(SYNTHETIC_EMAIL)
    page.locator("#pf_userEmail_confirm").fill(SYNTHETIC_EMAIL)
    fill_required_registration(page)
    page.locator("#pf_companyName").fill("Synthetic QA Company")
    page.locator("#pf_position").fill("QA Engineer")
    page.locator("#pf_mobile").fill("812345678")
    page.locator("#pf_countryID").select_option(label="THAILAND")
    page.locator("#pf_color").fill("#336699")


def expect_no_horizontal_overflow(page: Page) -> None:
    dimensions = page.evaluate(
        "() => ({clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth})"
    )
    assert dimensions["scrollWidth"] <= dimensions["clientWidth"] + 1


def expect_payload_not_executable(page: Page, payload: str) -> None:
    result = page.evaluate(
        """value => ({
          scriptEcho: Array.from(document.scripts).some(script => script.textContent?.includes(value)),
          handlerEcho: Array.from(document.querySelectorAll('[onerror], [onload], [onclick]'))
            .some(element => element.outerHTML.includes(value))
        })""",
        payload,
    )
    assert result == {"scriptEcho": False, "handlerEcho": False}


def first_visible(locator: Locator) -> Locator | None:
    for index in range(locator.count()):
        candidate = locator.nth(index)
        if candidate.is_visible():
            return candidate
    return None


def visible_controls(page: Page) -> list[Locator]:
    controls = page.locator(
        'form input:not([type="hidden"]):not([type="submit"]):not([type="button"]), form textarea, form select'
    )
    return [controls.nth(index) for index in range(controls.count()) if controls.nth(index).is_visible()]


def open_environment_page(page: Page, env_name: str, purpose: str, guard_writes: bool = False) -> str:
    url = require_env(env_name, purpose)
    if guard_writes:
        guard_mutating_requests(page, url)
    page.goto(url, wait_until="domcontentloaded")
    return url


def read_mail_fixture() -> dict[str, str]:
    fixture_path = Path(require_env("WORKBOOK_EMAIL_FIXTURE", "Email validation needs a JSON message fixture"))
    message = json.loads(fixture_path.read_text(encoding="utf-8"))
    assert message.get("subject")
    assert message.get("fromEmail")
    assert message.get("fromName")
    return message


def expect_registration_mail(message: dict[str, str]) -> None:
    assert "Your Pet Fair South-East Asia 2026 Regist" in message["subject"]
    assert message["fromEmail"].lower() == "support@eventthai.com"
    assert "Pet Fair South East" in message["fromName"]


def digits(value: str) -> str:
    return re.sub(r"\D", "", value)
