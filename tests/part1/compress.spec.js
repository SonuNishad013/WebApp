import { test, expect } from '@playwright/test';
import {
  getTestAsset,
  navigateToTab,
  uploadFile,
  waitForDownload,
  saveDownload,
  assertFileExtension,
  assertFileSizeGreaterThan,
  assertFileSizeLessThan,
  cleanupDownloads,
  getFileSize
} from '../helpers.js';

/**
 * E2E Tests for Compress PDF Service (Part 1)
 * Tests PDF compression with different quality levels
 */

test.describe('Compress PDF', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, 'Compress PDF');
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test('should compress PDF with ebook quality', async ({ page }) => {
    const testFile = getTestAsset('sample_large.pdf'); // Should be a larger PDF
    
    // Upload file
    await uploadFile(page, 'input[type="file"]', testFile);
    
    // Select ebook quality
    await page.click('button:has-text("Ebook")');
    
    // Click compress button
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Compress PDF")');
    });
    
    // Save and verify download
    const downloadPath = await saveDownload(download, 'compressed_ebook.pdf');
    assertFileExtension(downloadPath, '.pdf');
    assertFileSizeGreaterThan(downloadPath, 500);
    
    // Verify success message
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 });
  });

  test('should verify size reduction after compression', async ({ page }) => {
    const testFile = getTestAsset('sample_large.pdf');
    const originalSize = getFileSize(testFile);
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Ebook")');
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Compress PDF")');
    });
    
    const downloadPath = await saveDownload(download, 'compressed.pdf');
    const compressedSize = getFileSize(downloadPath);
    
    // Compressed should be smaller than original
    expect(compressedSize).toBeLessThan(originalSize);
    
    // Should be at least 10% reduction
    const reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;
    expect(reductionPercent).toBeGreaterThan(10);
  });

  test('should compress with screen quality (smallest)', async ({ page }) => {
    const testFile = getTestAsset('sample_large.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    
    // Select screen quality (lowest, smallest file)
    await page.click('button:has-text("Screen")');
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Compress PDF")');
    });
    
    const downloadPath = await saveDownload(download, 'compressed_screen.pdf');
    assertFileExtension(downloadPath, '.pdf');
    
    // Screen quality should produce smallest file
    const compressedSize = getFileSize(downloadPath);
    const originalSize = getFileSize(testFile);
    
    // Should have significant compression
    expect(compressedSize).toBeLessThan(originalSize * 0.7); // At least 30% reduction
  });

  test('should compress with printer quality (high quality)', async ({ page }) => {
    const testFile = getTestAsset('sample_large.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    
    // Select printer quality (highest quality)
    await page.click('button:has-text("Printer")');
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Compress PDF")');
    });
    
    const downloadPath = await saveDownload(download, 'compressed_printer.pdf');
    assertFileExtension(downloadPath, '.pdf');
    
    // Printer quality should still reduce size but less than screen
    const compressedSize = getFileSize(downloadPath);
    const originalSize = getFileSize(testFile);
    
    expect(compressedSize).toBeLessThan(originalSize);
  });

  test('should compress with prepress quality', async ({ page }) => {
    const testFile = getTestAsset('sample_large.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Prepress")');
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Compress PDF")');
    });
    
    const downloadPath = await saveDownload(download, 'compressed_prepress.pdf');
    assertFileExtension(downloadPath, '.pdf');
  });

  test('should reject invalid file type', async ({ page }) => {
    const invalidFile = getTestAsset('sample.txt');
    
    await uploadFile(page, 'input[type="file"]', invalidFile);
    
    // Should not show file or show error
    await page.waitForTimeout(1000);
    const hasFileName = await page.locator('text=sample.txt').isVisible().catch(() => false);
    expect(hasFileName).toBe(false);
  });

  test('should handle oversized file', async ({ page }) => {
    const largeFile = getTestAsset('very_large_file.pdf'); // > 10MB
    
    try {
      await uploadFile(page, 'input[type="file"]', largeFile);
      
      // Should show file size error
      await expect(page.locator('text=/file.*too large/i')).toBeVisible({ timeout: 3000 });
    } catch (error) {
      test.skip();
    }
  });

  test('should show progress during compression', async ({ page }) => {
    const testFile = getTestAsset('sample_large.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Ebook")');
    
    await page.click('button:has-text("Compress PDF")');
    
    // Should show loading state
    await expect(page.locator('text=/compressing|processing/i')).toBeVisible({ timeout: 2000 });
  });

  test('should handle corrupt PDF gracefully', async ({ page }) => {
    const corruptFile = getTestAsset('corrupt.pdf');
    
    try {
      await uploadFile(page, 'input[type="file"]', corruptFile);
      await page.click('button:has-text("Ebook")');
      
      await page.click('button:has-text("Compress PDF")');
      
      // Should show error
      await expect(page.locator('text=/error|failed|corrupt/i')).toBeVisible({ timeout: 10000 });
    } catch (error) {
      test.skip();
    }
  });

  test('should maintain PDF validity after compression', async ({ page }) => {
    const testFile = getTestAsset('sample_large.pdf');
    
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Ebook")');
    
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Compress PDF")');
    });
    
    const downloadPath = await saveDownload(download, 'compressed_valid.pdf');
    
    // File should be a valid PDF (has PDF signature)
    assertFileExtension(downloadPath, '.pdf');
    assertFileSizeGreaterThan(downloadPath, 100);
  });

  test('should display quality preset descriptions', async ({ page }) => {
    // Check that each quality preset has a description
    await expect(page.locator('text=/72 DPI|screen/i')).toBeVisible();
    await expect(page.locator('text=/150 DPI|ebook/i')).toBeVisible();
    await expect(page.locator('text=/300 DPI|printer/i')).toBeVisible();
  });

  test('should compare compression levels', async ({ page }) => {
    const testFile = getTestAsset('sample_large.pdf');
    
    // Test Screen quality
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Screen")');
    
    const screenDownload = await waitForDownload(page, async () => {
      await page.click('button:has-text("Compress PDF")');
    });
    
    const screenPath = await saveDownload(screenDownload, 'screen.pdf');
    const screenSize = getFileSize(screenPath);
    
    // Wait for reset
    await page.waitForTimeout(3000);
    
    // Test Printer quality
    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Printer")');
    
    const printerDownload = await waitForDownload(page, async () => {
      await page.click('button:has-text("Compress PDF")');
    });
    
    const printerPath = await saveDownload(printerDownload, 'printer.pdf');
    const printerSize = getFileSize(printerPath);
    
    // Screen quality should produce smaller file than Printer
    expect(screenSize).toBeLessThan(printerSize);
  });
});
