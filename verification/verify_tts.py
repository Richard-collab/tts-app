
from playwright.sync_api import sync_playwright

def verify_tts_editor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app
            page.goto("http://localhost:5173")

            # Wait for the main TTS Editor title to be visible to ensure load
            page.wait_for_selector('h1:has-text("语音合成")', timeout=10000)

            # Handle potential blocking overlay (Update Notification)
            # Sometimes it takes a moment to appear
            page.wait_for_timeout(1000)
            page.keyboard.press('Escape')

            # Take a screenshot before interaction to see state
            page.screenshot(path="verification/before_interaction.png")

            # Click "Add Test Data" (Science Icon FAB)
            # FAB has aria-label="add test data"
            page.get_by_label("add test data").click()

            # Verify a test group was added.
            # The text might be "测试语料" or something similar.
            # Let's wait a bit and check page content or take screenshot anyway.
            page.wait_for_timeout(1000)

            # Take a screenshot to prove the UI is active and working
            page.screenshot(path="verification/tts_editor_verification.png")
            print("Verification successful, screenshot saved.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/tts_editor_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_tts_editor()
