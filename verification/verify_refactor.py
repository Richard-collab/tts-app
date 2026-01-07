
import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Mock Baize API responses to ensure the component renders and we can trigger the logic
        await page.route("**/api/proxy/post", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"code": "2000", "data": [{"id": "script1", "scriptName": "Test Script"}]}'
        ))

        # We need to simulate the response for fetchScriptCorpus which is triggered
        # when we try to import.
        # However, to reach the "Import from Baize" button, we just need the main page to load.

        # Navigate to the app
        await page.goto("http://localhost:5173")

        # Wait for the main container
        await expect(page.locator("text=语音合成")).to_be_visible()

        # Check if "从白泽导入" tab is active (default is 0, so it should be visible)
        await expect(page.get_by_text("从白泽系统导入话术语料")).to_be_visible()

        # Click "导入话术内容" button to trigger the dialog (which uses our logic indirectly eventually)
        await page.get_by_role("button", name="导入话术内容").click()

        # This will trigger the "Please login" message because we are not logged in.
        # This confirms the button works and the component didn't crash on load.
        await expect(page.locator("text=请先登录")).to_be_visible()

        # Take a screenshot
        await page.screenshot(path="verification/tts_editor_loaded.png")

        print("Verification script finished successfully.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
