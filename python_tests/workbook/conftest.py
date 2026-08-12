from __future__ import annotations

import os
import re
from pathlib import Path

import pytest
from playwright.sync_api import Browser, Page, Playwright, sync_playwright

from .excel_env import load_workbook_environment


SCREENSHOT_DIR = Path("screenshots/python-workbook")
VIEWPORT = {"width": 1440, "height": 900}
LOADED_EXCEL_ENV = load_workbook_environment()


def pytest_report_header() -> str | None:
    if not LOADED_EXCEL_ENV:
        return None
    names = ", ".join(LOADED_EXCEL_ENV)
    return f"workbook Excel defaults loaded (values hidden): {names}"


@pytest.fixture(scope="session")
def playwright_instance() -> Playwright:
    with sync_playwright() as playwright:
        yield playwright


@pytest.fixture(scope="session")
def workbook_browser(playwright_instance: Playwright) -> Browser:
    browser_name = os.getenv("PW_BROWSER", "chromium").lower()
    headless = os.getenv("PW_HEADLESS", "1") != "0"
    slow_mo = int(os.getenv("PW_SLOW_MO", "300")) if not headless else 0

    if browser_name == "firefox":
        browser_type = playwright_instance.firefox
        launch_options = {}
    elif browser_name in {"webkit", "safari"}:
        browser_type = playwright_instance.webkit
        launch_options = {}
    elif browser_name == "edge":
        browser_type = playwright_instance.chromium
        launch_options = {"channel": "msedge"}
    else:
        browser_type = playwright_instance.chromium
        launch_options = {}

    browser = browser_type.launch(headless=headless, slow_mo=slow_mo, **launch_options)
    yield browser
    browser.close()


@pytest.fixture()
def workbook_page(workbook_browser: Browser, request: pytest.FixtureRequest) -> Page:
    storage_state = os.getenv("WORKBOOK_STORAGE_STATE")
    context_options: dict[str, object] = {"viewport": VIEWPORT}
    if storage_state:
        context_options["storage_state"] = storage_state

    context = workbook_browser.new_context(**context_options)
    page = context.new_page()
    page.set_default_timeout(15_000)
    page.set_default_navigation_timeout(45_000)
    page.emulate_media(reduced_motion="reduce")

    yield page

    if page.url != "about:blank":
        SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", request.node.name)
        screenshot_path = SCREENSHOT_DIR / f"{safe_name}.png"
        try:
            page.screenshot(
                path=str(screenshot_path),
                full_page=True,
                animations="disabled",
                timeout=45_000,
            )
            print(f"\n[SCREENSHOT] {screenshot_path}")
        except Exception as error:
            print(f"\n[SCREENSHOT ERROR] {request.node.name}: {error}")

    context.close()
