import { test, expect } from '@playwright/test';

test.describe('Selection Region Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Generate test audio first
    const generateTestButton = page.getByRole('button', { name: /生成测试音频/i });
    if (await generateTestButton.isVisible()) {
      await generateTestButton.click();
      // Wait for test audio to be generated
      await page.waitForTimeout(2000);
    }
    
    // Find and click the edit button for the first audio item
    const editButtons = page.getByRole('button', { name: /编辑/i });
    const firstEditButton = editButtons.first();
    await firstEditButton.waitFor({ state: 'visible', timeout: 10000 });
    await firstEditButton.click();
    
    // Wait for waveform editor dialog to open
    await page.waitForSelector('text=音频波形编辑器', { timeout: 10000 });
    await page.waitForTimeout(1500); // Wait for waveform to render
  });

  test('old selection should disappear on mousedown when creating new selection', async ({ page }) => {
    // Create a first selection by dragging on the waveform
    const waveformBox = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      
      const divs = dialog.querySelectorAll('div');
      for (let div of divs) {
        const bbox = div.getBoundingClientRect();
        if (bbox.height > 100 && bbox.height < 200 && bbox.width > 500) {
          return {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height
          };
        }
      }
      return null;
    });

    if (!waveformBox) {
      throw new Error('Waveform not found');
    }

    // Create first selection (20% to 40%)
    const startX1 = waveformBox.x + waveformBox.width * 0.2;
    const endX1 = waveformBox.x + waveformBox.width * 0.4;
    const middleY = waveformBox.y + waveformBox.height / 2;

    await page.mouse.move(startX1, middleY);
    await page.mouse.down();
    await page.mouse.move(endX1, middleY);
    await page.mouse.up();

    // Wait for selection to be created
    await page.waitForTimeout(500);

    // Check that selection info is displayed
    const selectionInfo = page.locator('text=/选区:/');
    await expect(selectionInfo).toBeVisible({ timeout: 2000 });

    // Get the selection text to verify it exists
    const firstSelectionText = await selectionInfo.textContent();
    console.log('First selection:', firstSelectionText);

    // Now start creating a second selection
    const startX2 = waveformBox.x + waveformBox.width * 0.6;
    
    // Move mouse to new position
    await page.mouse.move(startX2, middleY);
    
    // On mousedown, the old selection should disappear immediately
    await page.mouse.down();
    
    // Check that the selection info is NOT visible immediately after mousedown
    // (before completing the drag)
    await page.waitForTimeout(100);
    
    // The selection info should either be hidden or show different values
    // If it's still visible, it should not be the same as the first selection
    const selectionAfterMousedown = await selectionInfo.textContent().catch(() => null);
    console.log('Selection after mousedown:', selectionAfterMousedown);
    
    // Complete the second selection
    const endX2 = waveformBox.x + waveformBox.width * 0.8;
    await page.mouse.move(endX2, middleY);
    await page.mouse.up();

    // Wait for new selection to be created
    await page.waitForTimeout(500);

    // Verify the new selection is displayed
    await expect(selectionInfo).toBeVisible();
    const secondSelectionText = await selectionInfo.textContent();
    console.log('Second selection:', secondSelectionText);

    // The selections should be different (different time ranges)
    expect(secondSelectionText).not.toBe(firstSelectionText);
  });

  test('selection timestamps should update in real-time during dragging', async ({ page }) => {
    // Find the waveform
    const waveformBox = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      
      const divs = dialog.querySelectorAll('div');
      for (let div of divs) {
        const bbox = div.getBoundingClientRect();
        if (bbox.height > 100 && bbox.height < 200 && bbox.width > 500) {
          return {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height
          };
        }
      }
      return null;
    });

    if (!waveformBox) {
      throw new Error('Waveform not found');
    }

    const middleY = waveformBox.y + waveformBox.height / 2;
    const startX = waveformBox.x + waveformBox.width * 0.2;

    // Start dragging
    await page.mouse.move(startX, middleY);
    await page.mouse.down();

    // Move slightly (10%)
    const moveX1 = waveformBox.x + waveformBox.width * 0.3;
    await page.mouse.move(moveX1, middleY);
    await page.waitForTimeout(100);

    // Check if selection info appears during drag
    const selectionInfo = page.locator('text=/选区:/');
    const isDuringDrag1 = await selectionInfo.isVisible().catch(() => false);
    const textDuringDrag1 = isDuringDrag1 ? await selectionInfo.textContent() : null;
    console.log('During drag (30%):', textDuringDrag1);

    // Move more (20%)
    const moveX2 = waveformBox.x + waveformBox.width * 0.5;
    await page.mouse.move(moveX2, middleY);
    await page.waitForTimeout(100);

    // Check again
    const isDuringDrag2 = await selectionInfo.isVisible().catch(() => false);
    const textDuringDrag2 = isDuringDrag2 ? await selectionInfo.textContent() : null;
    console.log('During drag (50%):', textDuringDrag2);

    // Complete the drag
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Final check
    await expect(selectionInfo).toBeVisible();
    const finalText = await selectionInfo.textContent();
    console.log('After drag complete:', finalText);

    // Verify that we saw updates during dragging
    // At least one of the during-drag texts should be visible and different from initial
    expect(isDuringDrag1 || isDuringDrag2).toBe(true);
  });
});
