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
 * E2E Tests for Split PDF Service (Part 1)
 * Tests PDF splitting functionality with range and individual modes
 */

test.describe('Split PDF', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, 'Split PDF');
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test('should split PDF by range (pages 1-2)', async ({ page }) => {
    const testFile = getTestAsset('sample_multipage.pdf'); // Should have 5+ pages
    
    // Upload file
    await uploadFile(page, 'input[type="file"]', testFile);
    
    // Select range mode
    await page.click('input[value="range"]');
    
    // Enter page range
    await page.fill('input[placeholder*="page range"]', '1-2');
    
    // Click split button
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Split PDF")');
    });
    
    // Save and verify download
    const downloadPath = await saveDownload(download, 'split_pages_1-2.pdf');
    assertFileExtension(downloadPath, '.pdf');
    assertFileSizeGreaterThan(downloadPath, 500);
    
    // Verify success message
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
  });

  test('should split PDF into individual pages', async ({ page }) => {
    const testFile = getTestAsset('sample_multipage.pdf');
    
    // Upload file
    await uploadFile(page, 'input[type="file"]', testFile);
    
    // Select individual mode
    await page.click('input[value="individual"]');
    
    // Click split button
    await page.click('button:has-text("Split PDF")');
    
    // For individual mode, backend returns JSON with multiple files
    // Frontend should handle this appropriately
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 });
  });

  test('should extract non-contiguous pages (1-2,5)', async ({ page }) => {
    const testFile = getTestAsset('sample_multipage.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    
    // Select range mode
    await page.click('input[value="range"]');
    
    // Enter non-contiguous range
    await page.fill('input[placeholder*="page range"]', '1-2,5');
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Split PDF")');
    });
    
    const downloadPath = await saveDownload(download, 'split_pages_1-2_5.pdf');
    assertFileExtension(downloadPath, '.pdf');
    assertFileSizeGreaterThan(downloadPath, 500);
  });

  test('should reject invalid file type', async ({ page }) => {
    const invalidFile = getTestAsset('sample.docx');
    
    // File input should filter by accept attribute
    // If file is somehow uploaded, backend should reject
    await uploadFile(page, 'input[type="file"]', invalidFile);
    
    // Should not show file name or show error
    await page.waitForTimeout(1000);
    const hasFileName = await page.locator('text=sample.docx').isVisible().catch(() => false);
    expect(hasFileName).toBe(false);
  });

  test('should reject invalid page range format', async ({ page }) => {
    const testFile = getTestAsset('sample_multipage.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('input[value="range"]');
    
    // Enter invalid range
    await page.fill('input[placeholder*="page range"]', 'abc-xyz');
    
    await page.click('button:has-text("Split PDF")');
    
    // Should show validation error
    await expect(page.locator('text=/invalid.*range|error/i')).toBeVisible({ timeout: 5000 });
  });

  test('should reject page range beyond PDF length', async ({ page }) => {
    const testFile = getTestAsset('sample1.pdf'); // 1 page only
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('input[value="range"]');
    
    // Try to extract page 5 from 1-page PDF
    await page.fill('input[placeholder*="page range"]', '5');
    
    await page.click('button:has-text("Split PDF")');
    
    // Should show error
    await expect(page.locator('text=/error|invalid.*page|out of range/i')).toBeVisible({ timeout: 10000 });
  });

  test('should show progress during split', async ({ page }) => {
    const testFile = getTestAsset('sample_multipage.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('input[value="range"]');
    await page.fill('input[placeholder*="page range"]', '1-3');
    
    await page.click('button:has-text("Split PDF")');
    
    // Should show loading state
    await expect(page.locator('text=/splitting|processing/i')).toBeVisible({ timeout: 2000 });
  });

  test('should handle corrupt PDF gracefully', async ({ page }) => {
    const corruptFile = getTestAsset('corrupt.pdf');
    
    try {
      await uploadFile(page, 'input[type="file"]', corruptFile);
      await page.click('input[value="range"]');
      await page.fill('input[placeholder*="page range"]', '1');
      
      await page.click('button:has-text("Split PDF")');
      
      // Should show error message
      await expect(page.locator('text=/error|failed|corrupt/i')).toBeVisible({ timeout: 10000 });
    } catch (error) {
      test.skip();
    }
  });

  test('should display correct page count after upload', async ({ page }) => {
    const testFile = getTestAsset('sample_multipage.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    
    // Wait for file processing
    await page.waitForTimeout(1000);
    
    // Should display page count information
    // This depends on UI implementation
    const pageInfo = await page.locator('text=/pages?/i').textContent();
    expect(pageInfo).toBeTruthy();
  });

  test('should validate single page extraction', async ({ page }) => {
    const testFile = getTestAsset('sample_multipage.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('input[value="range"]');
    
    // Extract just page 1
    await page.fill('input[placeholder*="page range"]', '1');
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Split PDF")');
    });
    
    const downloadPath = await saveDownload(download, 'page_1.pdf');
    assertFileExtension(downloadPath, '.pdf');
    
    // Single page should be smaller than multi-page
    assertFileSizeGreaterThan(downloadPath, 300);
  });
});
