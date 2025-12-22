import time
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Mock Login
    page.route("**/AiSpeech/admin/login", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"code": "200", "account": "admin", "token": "mock-token"}'
    ))

    # Mock Scripts
    page.route("**/api/proxy/get?url=**", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"code": "2000", "data": [{"id": "s1", "scriptName": "Test Script", "primaryIndustry": "Tech"}]}'
    ))

    # Mock Corpus (mixed isPlay)
    page.route("**/api/proxy/post?url=**", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''{
            "code": "2000",
            "data": {
                "scriptUnitContents": [
                    {"id": "c1", "content": "Played Corpus 1", "isPlay": true},
                    {"id": "c2", "content": "Unplayed Corpus 1", "isPlay": false},
                    {"id": "c3", "content": "Unplayed Corpus 2 (null)", "isPlay": null},
                    {"id": "c4", "content": "Played Corpus 2", "isPlay": true}
                ]
            }
        }'''
    ))

    # 1. Login
    page.goto("http://localhost:5173/")
    page.get_by_text("登录", exact=True).click()
    page.get_by_label("用户名").fill("admin")
    page.get_by_label("密码").fill("password")
    page.get_by_role("button", name="登录").click()

    # 2. Open Script Dialog
    page.get_by_text("从白泽导入").click()
    page.get_by_role("button", name="导入话术").click()

    # 3. Select Script (Wait for it to appear)
    page.get_by_text("Test Script").click()

    # 4. Wait for Corpus Dialog
    page.wait_for_selector("text=选择要导入的语料")

    # Screenshot 1: Default View (All)
    page.screenshot(path="verification_all.png")

    # 5. Filter: Played
    page.get_by_role("combobox", name="验听状态").click()
    page.get_by_role("option", name="已验听").click()
    page.wait_for_timeout(500) # Wait for filter to apply
    page.screenshot(path="verification_played.png")

    # 6. Filter: Unplayed
    page.get_by_role("combobox", name="验听状态").click()
    page.get_by_role("option", name="未验听").click()
    page.wait_for_timeout(500)
    page.screenshot(path="verification_unplayed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
