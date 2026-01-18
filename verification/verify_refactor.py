
from playwright.sync_api import sync_playwright

def verify_tts_editor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to the TTS Editor page
            page.goto("http://localhost:3000")

            # Wait for the main content to load
            page.wait_for_selector('text=语音合成', timeout=10000)

            # Check if the page loaded successfully without errors
            print("Page loaded successfully.")

            # Take a screenshot to verify UI is intact
            page.screenshot(path="verification/tts_editor.png")
            print("Screenshot saved to verification/tts_editor.png")

        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_tts_editor()
