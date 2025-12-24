from playwright.sync_api import sync_playwright, expect
import time

def verify_ui_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for clipboard if needed, though simple copy-paste might not need it for this test
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        print("Navigating to page...")
        page.goto("http://localhost:5173")

        # 1. Verify Login FAB (Logged Out State)
        print("Verifying Login FAB (Logged Out)...")
        login_fab = page.locator('button[aria-label="login"]')
        expect(login_fab).to_be_visible()
        # Screenshot 1: Logged Out
        page.screenshot(path="verification_logged_out.png")

        # 2. Verify Floating Progress Bar Expand/Collapse
        # Mock baizeDataRef to show the progress bar (needs audioGroups + baizeData)
        # We can use the "Test Data" FAB to generate this state.
        print("Clicking Test Data FAB...")
        test_data_fab = page.locator('button[aria-label="add test data"]')
        test_data_fab.click()

        # Wait for progress bar to appear
        progress_bar = page.locator('text=目标话术')
        expect(progress_bar).to_be_visible()

        # Check Default State: Expanded
        print("Verifying Default Expanded State...")
        # Verify "文本同步" text or switch is visible
        sync_text = page.locator('text=文本同步')
        expect(sync_text).to_be_visible()
        # Screenshot 2: Progress Expanded
        page.screenshot(path="verification_progress_expanded.png")

        # Click Collapse Button
        print("Clicking Collapse Button...")
        collapse_btn = page.locator('button[aria-label="toggle progress bar"]')
        collapse_btn.click()

        # Verify Collapsed State
        print("Verifying Collapsed State...")
        # "文本同步" should be hidden/gone
        expect(sync_text).not_to_be_visible()
        # Screenshot 3: Progress Collapsed
        page.screenshot(path="verification_progress_collapsed.png")

        # 3. Verify Login FAB (Logged In State)
        # Simulate login by injecting local storage and reloading
        print("Simulating Login...")
        page.evaluate("""
            localStorage.setItem('audioEditor_user', JSON.stringify({ account: 'TestUser' }));
            localStorage.setItem('audioEditor_token', 'fake-token');
        """)
        page.reload()

        print("Verifying User FAB (Logged In)...")
        user_fab = page.locator('button[aria-label="user-menu"]')
        expect(user_fab).to_be_visible()

        # Click to open menu
        user_fab.click()
        menu_item = page.locator('text=TestUser')
        expect(menu_item).to_be_visible()

        # Screenshot 4: Logged In Menu
        page.screenshot(path="verification_logged_in.png")

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    verify_ui_changes()
