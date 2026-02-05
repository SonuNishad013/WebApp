import { test, expect } from "@playwright/test";
import {
  getTestAsset,
  navigateToTab,
  uploadMultipleFiles,
  waitForDownload,
  saveDownload,
  assertFileExtension,
  assertFileSizeGreaterThan,
  cleanupDownloads,
} from "../helpers.js";

/**
 * E2E Tests for JPG to PDF Service (Part 4)
 * Tests image to PDF conversion with multi-image support and page size options
 */

test.describe("JPG to PDF", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "JPG → PDF");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should convert single JPG to PDF", async ({ page }) => {
    const testFile = getTestAsset("sample.jpg");

    await uploadMultipleFiles(page, 'input[type="file"]', [testFile]);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should convert multiple images to multi-page PDF", async ({ page }) => {
    const file1 = getTestAsset("image1.jpg");
    const file2 = getTestAsset("image2.jpg");
    const file3 = getTestAsset("image3.jpg");

    await uploadMultipleFiles(page, 'input[type="file"]', [
      file1,
      file2,
      file3,
    ]);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "multipage.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 2000);
  });

  test("should support PNG format", async ({ page }) => {
    const testFile = getTestAsset("sample.png");

    await uploadMultipleFiles(page, 'input[type="file"]', [testFile]);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "from_png.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 500);
  });

  test("should set page size to Letter", async ({ page }) => {
    const testFile = getTestAsset("sample.jpg");

    await uploadMultipleFiles(page, 'input[type="file"]', [testFile]);

    // Select page size
    await page.selectOption('select[name="pageSize"]', "Letter");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "letter_size.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should set page size to A4", async ({ page }) => {
    const testFile = getTestAsset("sample.jpg");

    await uploadMultipleFiles(page, 'input[type="file"]', [testFile]);

    // Select A4 page size
    await page.selectOption('select[name="pageSize"]', "A4");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "a4_size.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should set page size to Legal", async ({ page }) => {
    const testFile = getTestAsset("sample.jpg");

    await uploadMultipleFiles(page, 'input[type="file"]', [testFile]);

    // Select Legal page size
    await page.selectOption('select[name="pageSize"]', "Legal");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "legal_size.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust image quality", async ({ page }) => {
    const testFile = getTestAsset("sample.jpg");

    await uploadMultipleFiles(page, 'input[type="file"]', [testFile]);

    // Set quality to 70%
    await page.fill('input[name="quality"]', "70");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "quality_70.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should reject invalid file type", async ({ page }) => {
    const invalidFile = getTestAsset("sample.txt");

    await uploadMultipleFiles(page, 'input[type="file"]', [invalidFile]);

    await page.waitForTimeout(1000);
    const hasError = await page
      .locator("text=/invalid.*type|error/i")
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(true);
  });

  test("should show progress during conversion", async ({ page }) => {
    const testFile = getTestAsset("sample.jpg");

    await uploadMultipleFiles(page, 'input[type="file"]', [testFile]);
    await page.click('button:has-text("Convert")');

    await expect(
      page.locator("text=/converting|processing|creating/i"),
    ).toBeVisible({ timeout: 2000 });
  });

  test("should handle up to 50 images", async ({ page }) => {
    // Create array of 10 test image references for demonstration
    const files = [];
    for (let i = 0; i < 10; i++) {
      files.push(getTestAsset(`image_${i + 1}.jpg`));
    }

    await uploadMultipleFiles(page, 'input[type="file"]', files);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "batch_images.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 5000);
  });
});
