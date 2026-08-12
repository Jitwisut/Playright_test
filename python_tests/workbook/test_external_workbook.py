from __future__ import annotations

import pytest
from playwright.sync_api import Locator, Page, expect

from .cases import CONFERENCE_CASES, EMAIL_CASES, INVITE_CASES, WorkbookCase
from .helpers import (
    expect_registration_mail,
    first_visible,
    read_mail_fixture,
    require_env,
)


def required(locator: Locator, reason: str) -> Locator:
    element = first_visible(locator)
    if element is None:
        pytest.skip(reason)
    return element


def login_conference(page: Page) -> None:
    url = require_env("WORKBOOK_CONFERENCE_URL", "Conference login URL")
    username = require_env("WORKBOOK_CONFERENCE_USER", "Conference username")
    password = require_env("WORKBOOK_CONFERENCE_PASSWORD", "Conference password")
    page.goto(url, wait_until="domcontentloaded")

    username_field = required(
        page.get_by_label("Email", exact=False).or_(
            page.get_by_label("Username", exact=False)
        ).or_(page.locator('input[type="email"], input[name*="user" i]')),
        "Conference page has no username/email field.",
    )
    password_field = required(
        page.get_by_label("Password", exact=False).or_(page.locator('input[type="password"]')),
        "Conference page has no password field.",
    )
    login = required(
        page.get_by_role("button", name="Login", exact=False).or_(
            page.get_by_role("button", name="Sign in", exact=False)
        ),
        "Conference page has no Login button.",
    )
    username_field.fill(username)
    password_field.fill(password)
    login.click()
    expect(
        page.get_by_text("My Profile", exact=False)
        .or_(page.get_by_text("Profile", exact=False))
        .or_(page.get_by_text("Dashboard", exact=False))
        .first
    ).to_be_visible()


@pytest.mark.workbook
@pytest.mark.external
@pytest.mark.parametrize("case", CONFERENCE_CASES, ids=lambda case: case.id)
def test_workbook_conference_case(case: WorkbookCase, workbook_page: Page) -> None:
    page = workbook_page
    login_conference(page)

    if case.id == "CFR-001":
        expect(page.get_by_text("Profile", exact=False).first).to_be_visible()
        return

    profile_menu = required(
        page.get_by_text("My Profile", exact=False).first,
        "Conference page has no My Profile menu.",
    )
    profile_menu.click()

    if case.id == "CFR-002":
        expect(page.get_by_text("My Profile", exact=False).first).to_be_visible()
        expect(page.get_by_text("My Booking", exact=False).first).to_be_visible()
    elif case.id == "CFR-003":
        my_profile = required(
            page.get_by_text("My Profile", exact=False).last,
            "Profile menu has no My Profile item.",
        )
        my_profile.click()
        expect(page.get_by_text("My Profile", exact=False).first).to_be_visible()
    elif case.id == "CFR-004":
        booking = required(
            page.get_by_text("My Booking", exact=False).first,
            "Profile menu has no My Booking item.",
        )
        booking.click()
        expect(page.get_by_text("My Booking", exact=False).first).to_be_visible()
    else:
        raise AssertionError(f"No Python runner implemented for {case.id}")


@pytest.mark.workbook
@pytest.mark.external
@pytest.mark.parametrize("case", EMAIL_CASES, ids=lambda case: case.id)
def test_workbook_email_case(case: WorkbookCase) -> None:
    assert case.id == "EMF-001"
    expect_registration_mail(read_mail_fixture())


@pytest.mark.workbook
@pytest.mark.external
@pytest.mark.parametrize("case", INVITE_CASES, ids=lambda case: case.id)
def test_workbook_invite_url(case: WorkbookCase, workbook_page: Page) -> None:
    assert case.id == "INF-001"
    page = workbook_page
    invite_url = require_env("WORKBOOK_INVITE_URL", "INF-001 needs the URL in Excel cell F120")
    response = page.goto(invite_url, wait_until="domcontentloaded")
    assert response is not None
    assert response.status < 400
    assert page.locator("body").inner_text().strip()
