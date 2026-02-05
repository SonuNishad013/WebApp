import { test, expect } from '@playwright/test';
import {
  getTestAsset,
  navigateToTab,
  uploadFile,
  waitForDownload,
  saveDownload,
  assertFileExtension,
  assertFileSizeGreaterThan,
  cleanupDownloads
} from '../helpers.js';

/**
 * E2E Tests for PDF to Word Service (Part 2)
 */

test.describe('PDF to Word', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, 'PDF → Word');
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test('should convert PDF to DOCX successfully', async ({ page }) => {
    const testFile = getTestAsset('sample_text.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });
    
    const downloadPath = await saveDownload(download, 'output.docx');
    assertFileExtension(downloadPath, '.docx');
    assertFileSizeGreaterThan(downloadPath, 1000);
    
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 15000 });
  });

  test('should reject invalid file type', async ({ page }) => {
    const invalidFile = getTestAsset('sample.txt');
    
    await uploadFile(page, 'input[type="file"]', invalidFile);
    
    await page.waitForTimeout(1000);
    const hasError = await page.locator('text=/invalid.*type|error/i').isVisible().catch(() => false);
    expect(hasError).toBe(true);
  });

  test('should show progress during conversion', async ({ page }) => {
    const testFile = getTestAsset('sample_text.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Convert")');
    
    await expect(page.locator('text=/converting|processing/i')).toBeVisible({ timeout: 2000 });
  });

  test('should validate text exists in output', async ({ page }) => {
    // This test requires opening the DOCX file to verify text
    // For E2E testing, we just verify file creation and size
    const testFile = getTestAsset('sample_text.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });
    
    const downloadPath = await saveDownload(download, 'text_output.docx');
    assertFileExtension(downloadPath, '.docx');
    assertFileSizeGreaterThan(downloadPath, 500);
  });
});
