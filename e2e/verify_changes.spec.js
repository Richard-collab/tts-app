
import { test, expect } from '@playwright/test';

test('Verify Baize Upload flow changes', async ({ page }) => {
  test.setTimeout(60000);

  // Listen to console logs
  page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
  page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

  // Mock API responses
  await page.route('**/api/proxy/get**', async route => {
    console.log('Mocking GET request');
    const json = {
      code: "2000",
      data: [
        { id: "s1", scriptName: "Test Script 1", primaryIndustry: "Test" }
      ]
    };
    await route.fulfill({ json });
  });

  await page.route('**/api/proxy/post**', async route => {
    console.log('Mocking POST request');
    const json = {
      code: "2000",
      data: {
         scriptUnitContents: [
            { id: "c1", content: "Hello", contentName: "c1", audioStatus: "0", corpusId: "cp1", baizeData: { id: "c1", corpusId: "cp1" } }
         ]
      }
    };
    await route.fulfill({ json });
  });

  // 1. Go to page
  console.log('Navigating to page...');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('domcontentloaded');

  // Verify Root exists
  await expect(page.locator('#root')).toBeVisible();

  // 2. Mock Login state (localStorage)
  console.log('Setting local storage...');
  await page.evaluate(() => {
    localStorage.setItem('audioEditor_user', JSON.stringify({ account: 'testuser' }));
    localStorage.setItem('audioEditor_token', 'test-token');
  });

  console.log('Reloading page...');
  await page.reload();
  await page.waitForLoadState('networkidle');

  // 3. Add some dummy audio group to enable Upload button
  console.log('Looking for test data button...');
  // Use a more specific locator if possible, or wait explicitly
  const fab = page.locator('button[aria-label="add test data"]');
  await fab.waitFor({ state: 'visible', timeout: 10000 });
  await fab.click();

  // Wait for test data to appear
  console.log('Waiting for test data...');
  await expect(page.getByText('测试语料').first()).toBeVisible();

  // 4. Click "Upload to Baize" (without selecting script first)
  console.log('Clicking Upload...');
  await page.getByRole('button', { name: '上传到白泽' }).click();

  // 5. Verify Dialog Open and Checkbox presence
  console.log('Verifying Dialog...');
  const dialog = page.getByRole('dialog', { name: '选择话术导入' });
  await expect(dialog).toBeVisible();

  const checkbox = dialog.getByLabel('同步话术文本');
  await expect(checkbox).toBeVisible();
  await expect(checkbox).toBeChecked();

  // 6. Take Screenshot 1: Script Dialog with Checkbox
  console.log('Taking screenshot 1...');
  await page.screenshot({ path: 'verification_script_dialog.png' });

  // 7. Test "Sync Text" toggle
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await expect(checkbox).toBeChecked();

  // 8. Close Script Dialog
  console.log('Closing dialog...');
  await dialog.getByRole('button', { name: '取消' }).click();
  await expect(dialog).toBeHidden();

  // 9. Open Help Dialog
  console.log('Opening Help...');
  await page.getByRole('button', { name: 'help' }).click();
  const helpDialog = page.getByRole('dialog', { name: '功能说明' });
  await expect(helpDialog).toBeVisible();

  // 10. Verify Help Text
  const helpText = helpDialog.getByText('可配置是否同步更新话术文本');
  await expect(helpText).toBeVisible();

  // 11. Take Screenshot 2: Help Dialog
  console.log('Taking screenshot 2...');
  await page.screenshot({ path: 'verification_help_dialog.png' });
});
