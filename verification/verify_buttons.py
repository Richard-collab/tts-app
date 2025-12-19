from playwright.sync_api import sync_playwright

def verify_buttons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the home page
            page.goto("http://localhost:5173")

            # Wait for content to load
            page.wait_for_timeout(2000)

            # Find a button and hover over it to test the hover effect
            # We'll need to find a button on the home page.
            # Looking at Home.jsx (implied), or we can navigate to /tts-editor where we know there are buttons.

            page.goto("http://localhost:5173/tts-editor")
            page.wait_for_timeout(2000)

            # Take a screenshot of the initial state
            page.screenshot(path="verification/initial_state.png")

            # Find a contained button (e.g., "确认导入" or similar if text matches, or by class)
            # The theme applies to MuiButton-contained.
            # Let's find any button.
            buttons = page.locator("button")
            count = buttons.count()
            print(f"Found {count} buttons")

            if count > 0:
                first_button = buttons.first
                # Hover
                first_button.hover()
                # Wait for transition
                page.wait_for_timeout(500)
                # Take screenshot of hover state
                page.screenshot(path="verification/hover_state.png")

                print("Screenshots taken.")
            else:
                print("No buttons found to test.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_buttons()
