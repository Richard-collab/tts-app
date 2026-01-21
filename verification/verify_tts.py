
from playwright.sync_api import sync_playwright

def verify_tts_editor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173")
            # Wait for the page to load
            page.wait_for_selector('text=语音合成')
            # Press Escape to close any potential popups
            page.keyboard.press('Escape')

            # Take a screenshot
            page.screenshot(path="verification/tts_editor.png")
            print("Screenshot taken successfully")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_tts_editor()
