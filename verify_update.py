from playwright.sync_api import Page, expect, sync_playwright
import os

def verify_update_dialog(page: Page):
    # Navigate to app
    page.goto("http://localhost:5173/tts-editor")

    # Clear localStorage to ensure dialog appears
    # Note: simple navigation might trigger it if not set, but explicit clear is safer.
    # We need to set context before reload? Or just clear it.

    # To clear local storage for the domain, we need to be on the domain.
    page.evaluate("localStorage.removeItem('update_acknowledged_version')")
    page.reload()

    # Wait for dialog
    # Title: 系统更新说明
    dialog_title = page.get_by_text("系统更新说明")
    expect(dialog_title).to_be_visible()

    # Check for content
    expect(page.get_by_text("新增了更新提示功能")).to_be_visible()

    # Check for checkbox
    # Note: get_by_label matches the text associated with the checkbox input
    checkbox = page.get_by_label("本次更新不再提示")
    expect(checkbox).to_be_visible()
    expect(checkbox).to_be_checked() # Requirement: defaults to true

    # Screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/update_dialog.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_update_dialog(page)
        except Exception as e:
            print(f"Error: {e}")
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
