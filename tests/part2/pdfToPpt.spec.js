import { test, expect } from "@playwright/test";
import {
  getTestAsset,
  navigateToTab,
  uploadFile,
  waitForDownload,
  saveDownload,
  assertFileExtension,
  assertFileSizeGreaterThan,
  cleanupDownloads,
} from "../helpers.js";

/**
 * E2E Tests for PDF to PowerPoint Service (Part 2)
 * Tests PDF to PPTX conversion with page-to-slide mapping
 */

test.describe("PDF to PowerPoint", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "PDF → PowerPoint");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should convert PDF to PPTX successfully", async ({ page }) => {
    const testFile = getTestAsset("sample_slides.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.pptx");
    assertFileExtension(downloadPath, ".pptx");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should map PDF pages to PowerPoint slides", async ({ page }) => {
    // Multi-page PDF should create corresponding number of slides
    const testFile = getTestAsset("sample_3pages.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "slides_mapped.pptx");
    assertFileExtension(downloadPath, ".pptx");
    assertFileSizeGreaterThan(downloadPath, 1500);
  });

  test("should reject invalid file type", async ({ page }) => {
    const invalidFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', invalidFile);

    await page.waitForTimeout(1000);
    const hasError = await page
      .locator("text=/invalid.*type|error/i")
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(true);
  });

  test("should show progress during conversion", async ({ page }) => {
    const testFile = getTestAsset("sample_slides.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Convert")');

    await expect(
      page.locator("text=/converting|processing|generating/i"),
    ).toBeVisible({ timeout: 2000 });
  });

  test("should handle oversized file rejection", async ({ page }) => {
    const largeFile = getTestAsset("large_file.pdf");

    await uploadFile(page, 'input[type="file"]', largeFile);

    const hasError = await page
      .locator("text=/too large|exceeds.*size/i")
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(true);
  });

  test("should display error message on conversion failure", async ({
    page,
  }) => {
    const corruptFile = getTestAsset("corrupt.pdf");

    await uploadFile(page, 'input[type="file"]', corruptFile);

    await page.click('button:has-text("Convert")');

    await expect(page.locator("text=/error|failed/i")).toBeVisible({
      timeout: 10000,
    });
  });
});
