from playwright.sync_api import sync_playwright, expect
import time

def verify_corpus_filter():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to the app
        page.goto("http://localhost:5174")

        # Wait for app to load
        page.wait_for_selector('text=语音合成', timeout=10000)

        # DEBUG: Log all requests
        page.on("request", lambda request: print(f"Request: {request.method} {request.url}"))

        # Mock the Baize API responses to ensure we can open the dialogs
        # Route Logging
        def log_route(route):
            print(f"Network request: {route.request.url}")
            route.continue_()

        # page.route("**", log_route)

        # 1. Mock fetchScripts
        # IMPORTANT: The app uses `fetchScripts` in `baizeApi.js` which constructs URL:
        # `${BAIZE_API_URL}/api/proxy/get?url=${BAIZE_OLD_API_URL}/AiSpeech/scriptEditor/getAllScript`
        # The BAIZE_API_URL might be http://ai.api.bountech.com or relative /api in vite proxy.
        # But we are mocking at playwright network layer.

        # We need to make sure we catch the request.
        # The console output from previous run (if I could see it fully) might show the URL.
        # The error message in the screenshot HTML says: "获取话术列表失败: Unexpected token '<', "<!doctype "... is not valid JSON"
        # This implies it hit the real server (or a 404/500 page) and got HTML instead of JSON.

        # Mock requests based on inspecting baizeApi.js
        # fetchScripts calls: findAllScriptInPermission?status=EDIT
        # fetchScriptCorpus calls: audioList

        def handle_proxy(route):
            url = route.request.url
            print(f"Handling proxy for: {url}")

            if "findAllScriptInPermission" in url:
                route.fulfill(
                    status=200,
                    body='{"code": "2000", "data": [{"id": "s1", "scriptName": "Test Script", "primaryIndustry": "Test"}]}'
                )
            elif "audioList" in url:
                 route.fulfill(
                    status=200,
                    body=str(corpus_data).replace("'", '"')
                )
            elif "login" in url:
                 route.fulfill(
                    status=200,
                    body='{"code": "2000", "data": {"account": "testuser", "token": "mocktoken"}}'
                )
            else:
                route.continue_()

        page.route("**/api/proxy/**", handle_proxy)

        # 2. Mock fetchScriptCorpus
        corpus_data = {
            "code": "2000",
            "data": {
                "scriptUnitContents": [
                    {
                        "id": "c1",
                        "contentName": "Corpus 1",
                        "content": "This is master content.",
                        "corpusType": "MASTER_001",
                        "canvasName": "Main Flow",
                        "audioStatus": "0"
                    },
                    {
                        "id": "c2",
                        "contentName": "Corpus 2",
                        "content": "This is knowledge content.",
                        "corpusType": "KNOWLEDGE_001",
                        "canvasName": "FAQ",
                        "audioStatus": "1"
                    },
                     {
                        "id": "c3",
                        "contentName": "Corpus 3",
                        "content": "This is functional content.",
                        "corpusType": "FUNC_001",
                        "canvasName": "Greeting",
                        "audioStatus": "2"
                    }
                ]
            }
        }

        # Removed individual routes in favor of global proxy handler

        # Click "从白泽导入" tab (it's index 0, so should be default, but let's click to be sure)
        page.get_by_text("从白泽导入").click()

        # Click "导入话术" button
        # First we need to login or mock login state.
        # The app checks localStorage.
        page.evaluate("""() => {
            localStorage.setItem('audioEditor_user', JSON.stringify({account: 'testuser'}));
            localStorage.setItem('audioEditor_token', 'mocktoken');
            window.location.reload();
        }""")

        # Wait for reload
        page.wait_for_selector('text=语音合成')

        # Click "从白泽导入" again if needed (state might reset tab)
        page.get_by_text("从白泽导入").click()

        # Click "导入话术"
        page.get_by_role("button", name="导入话术").click()

        # Select the script from the list
        # It might take a moment for the list to appear or fetch
        # Debug: print html content if it fails
        try:
             page.wait_for_selector("text=Test Script", timeout=5000)
             page.get_by_text("Test Script").click()
        except Exception as e:
             print("Failed to find Test Script. Current content:")
             print(page.content())
             raise e

        # Now the Corpus Selection Dialog should be open.
        # Verify the new UI elements exist.

        # Filters
        # Wait a bit for dialog animation
        time.sleep(1)

        # Selects often have complex labels in MUI. Use role button or combobox.
        # But text inputs should work by label.
        expect(page.get_by_label("语料名称")).to_be_visible()
        expect(page.get_by_label("文字内容")).to_be_visible()
        expect(page.get_by_label("所属流程")).to_be_visible()

        # For Selects, the label might not target the input directly in a way Playwright likes with get_by_label
        # because MUI select is a hidden input + a button.
        # Let's try finding the label text first.
        # Use .first to avoid strict mode violation if multiple elements match text (e.g. label and legend)
        expect(page.get_by_text("语料类型").first).to_be_visible()
        expect(page.get_by_text("验听状态").first).to_be_visible()

        # Buttons
        expect(page.get_by_role("button", name="追选当前")).to_be_visible()
        expect(page.get_by_role("button", name="全部清空")).to_be_visible()

        # Verify List Items
        expect(page.get_by_text("Corpus 1")).to_be_visible()
        expect(page.get_by_text("Main Flow")).to_be_visible() # Badge
        expect(page.get_by_text("未验听")).to_be_visible() # Badge

        # Take a screenshot of the initial state (All items)
        page.screenshot(path="verification_initial.png")

        # Test Filter: Corpus Type = "主流程"
        # Click the select. In MUI, it's often a combobox or button next to the label.
        # We can find the sibling or parent. Or try get_by_role('combobox') but there are two.
        # Let's interact via the Label -> click sends to control usually.
        # If get_by_label failed, try clicking the text "语料类型" which might focus it,
        # or use a more specific selector.

        # In MUI v5: <div id="mui-component-select-filterCorpusType" ...>
        # Let's try clicking the div that follows the label.

        # Simpler: Click the select by ID if we can guess it or finding by role comboboxes.
        # The first combobox after text inputs is corpus type.
        # Or `page.locator("div").filter(has_text="语料类型").click()` - might just click label.

        # Let's try locating by the value "全部" (default).
        # There are two "全部" selects.

        # Let's assume the DOM structure:
        # Grid item -> FormControl -> InputLabel("语料类型") + Select
        # We can locate the select by the label text in proximity.

        page.locator("div").filter(has_text="语料类型").last.click() # Heuristic
        # Wait for popover
        page.get_by_role("option", name="主流程").click()

        # Expect only Corpus 1 to be visible
        expect(page.get_by_text("Corpus 1")).to_be_visible()
        expect(page.get_by_text("Corpus 2")).to_be_hidden()

        page.screenshot(path="verification_filter_type.png")

        # Test Filter: Audit Status = "已验听" (Reset Type first)
        # Click the one that now says "主流程"
        page.locator("div").filter(has_text="语料类型").last.click()
        page.get_by_role("option", name="全部").click()

        # Click the one that says "全部" but corresponds to Audit Status
        # It's the one with label "验听状态"
        page.locator("div").filter(has_text="验听状态").last.click()
        page.get_by_role("option", name="已验听").click()

        expect(page.get_by_text("Corpus 2")).to_be_visible()
        expect(page.get_by_text("Corpus 1")).to_be_hidden()

        page.screenshot(path="verification_filter_status.png")

        # Test "追选当前"
        # Currently showing "Corpus 2". Click "追选当前".
        page.get_by_role("button", name="追选当前").click()

        # Verify checkbox is checked for Corpus 2 (we can check aria-checked or visual)
        # The checkbox is likely the first checkbox in the list item.
        # Checkbox logic is a bit complex to query directly without explicit IDs, but we can check "已选择 1 个语料" text at bottom.
        expect(page.get_by_text("已选择 1 个语料")).to_be_visible()

        page.screenshot(path="verification_all.png")

        browser.close()

if __name__ == "__main__":
    verify_corpus_filter()
