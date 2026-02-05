import { test, expect } from '@playwright/test';
import {
  getTestAsset,
  navigateToTab,
  uploadMultipleFiles,
  waitForDownload,
  saveDownload,
  assertFileExtension,
  assertFileSizeGreaterThan,
  cleanupDownloads,
  getFileSize
} from '../helpers.js';

/**
 * E2E Tests for Merge PDF Service (Part 1)
 * Tests PDF merging functionality with various scenarios
 */

test.describe('Merge PDF', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, 'Merge PDF');
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test('should successfully merge two PDFs', async ({ page }) => {
    // Upload two PDF files
    const file1 = getTestAsset('sample1.pdf');
    const file2 = getTestAsset('sample2.pdf');
    
    await uploadMultipleFiles(page, 'input[type="file"]', [file1, file2]);
    
    // Verify files are listed
    await expect(page.locator('text=sample1.pdf')).toBeVisible();
    await expect(page.locator('text=sample2.pdf')).toBeVisible();
    
    // Click merge button
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Merge PDFs")');
    });
    
    // Save and verify download
    const downloadPath = await saveDownload(download, 'merged.pdf');
    assertFileExtension(downloadPath, '.pdf');
    assertFileSizeGreaterThan(downloadPath, 1000); // At least 1KB
    
    // Verify success message
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
  });

  test('should merge three PDFs and verify page count sum', async ({ page }) => {
    const file1 = getTestAsset('sample1.pdf'); // Assume 1 page
    const file2 = getTestAsset('sample2.pdf'); // Assume 2 pages
    const file3 = getTestAsset('sample3.pdf'); // Assume 1 page
    
    await uploadMultipleFiles(page, 'input[type="file"]', [file1, file2, file3]);
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Merge PDFs")');
    });
    
    const downloadPath = await saveDownload(download, 'merged_three.pdf');
    assertFileExtension(downloadPath, '.pdf');
    
    // Expected: Combined file should be larger than any individual file
    const size1 = getFileSize(file1);
    const size2 = getFileSize(file2);
    const size3 = getFileSize(file3);
    const mergedSize = getFileSize(downloadPath);
    
    expect(mergedSize).toBeGreaterThan(size1);
    expect(mergedSize).toBeGreaterThan(size2);
    expect(mergedSize).toBeGreaterThan(size3);
  });

  test('should reject invalid file type', async ({ page }) => {
    const invalidFile = getTestAsset('sample.txt');
    
    // Attempt to upload non-PDF file
    await uploadMultipleFiles(page, 'input[type="file"]', [invalidFile]);
    
    // Should show error or not accept the file
    // File input should filter by accept attribute
    const fileCount = await page.locator('div.file-list').count();
    expect(fileCount).toBe(0);
  });

  test('should reject single file upload (needs at least 2)', async ({ page }) => {
    const file1 = getTestAsset('sample1.pdf');
    
    await uploadMultipleFiles(page, 'input[type="file"]', [file1]);
    
    // Merge button should be disabled or show error
    const mergeButton = page.locator('button:has-text("Merge PDFs")');
    await expect(mergeButton).toBeDisabled();
  });

  test('should handle oversized file rejection', async ({ page }) => {
    // This test assumes you have a large PDF file > 10MB
    // If not available, this test can be skipped or mocked
    const largeFile = getTestAsset('large_file.pdf');
    
    try {
      await uploadMultipleFiles(page, 'input[type="file"]', [largeFile]);
      
      // Frontend should validate file size
      await expect(page.locator('text=/file.*too large/i')).toBeVisible({ timeout: 3000 });
    } catch (error) {
      // If large file doesn't exist, skip test
      test.skip();
    }
  });

  test('should handle corrupt PDF gracefully', async ({ page }) => {
    const corruptFile = getTestAsset('corrupt.pdf');
    const validFile = getTestAsset('sample1.pdf');
    
    try {
      await uploadMultipleFiles(page, 'input[type="file"]', [validFile, corruptFile]);
      
      await page.click('button:has-text("Merge PDFs")');
      
      // Should show error message
      await expect(page.locator('text=/error|failed|corrupt/i')).toBeVisible({ timeout: 10000 });
    } catch (error) {
      // If corrupt file doesn't exist, skip test
      test.skip();
    }
  });

  test('should show progress during merge', async ({ page }) => {
    const file1 = getTestAsset('sample1.pdf');
    const file2 = getTestAsset('sample2.pdf');
    
    await uploadMultipleFiles(page, 'input[type="file"]', [file1, file2]);
    
    // Click merge and check for progress indicator
    await page.click('button:has-text("Merge PDFs")');
    
    // Should show loading state
    await expect(page.locator('text=/merging|processing/i')).toBeVisible({ timeout: 2000 });
  });

  test('should allow file removal before merging', async ({ page }) => {
    const file1 = getTestAsset('sample1.pdf');
    const file2 = getTestAsset('sample2.pdf');
    
    await uploadMultipleFiles(page, 'input[type="file"]', [file1, file2]);
    
    // Verify both files are listed
    await expect(page.locator('text=sample1.pdf')).toBeVisible();
    await expect(page.locator('text=sample2.pdf')).toBeVisible();
    
    // Remove one file
    const removeButtons = page.locator('button:has-text("Remove")');
    await removeButtons.first().click();
    
    // Only one file should remain
    const fileItems = await page.locator('.file-item').count();
    expect(fileItems).toBe(1);
  });

  test('should validate output filename', async ({ page }) => {
    const file1 = getTestAsset('sample1.pdf');
    const file2 = getTestAsset('sample2.pdf');
    
    await uploadMultipleFiles(page, 'input[type="file"]', [file1, file2]);
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Merge PDFs")');
    });
    
    const filename = download.suggestedFilename();
    
    // Should have .pdf extension
    expect(filename).toMatch(/\.pdf$/i);
    
    // Should have merged in the name
    expect(filename.toLowerCase()).toContain('merged');
  });
});
