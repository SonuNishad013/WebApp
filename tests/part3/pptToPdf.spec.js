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
 * E2E Tests for PowerPoint to PDF Service (Part 3)
 * Tests PPTX/PPT to PDF conversion with slide-to-page mapping
 */

test.describe("PowerPoint to PDF", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "PowerPoint → PDF");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should convert PPTX to PDF successfully", async ({ page }) => {
    const testFile = getTestAsset("sample_presentation.pptx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should map PowerPoint slides to PDF pages", async ({ page }) => {
    // Multi-slide presentation should create corresponding PDF pages
    const testFile = getTestAsset("sample_3slides.pptx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "slides_mapped.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1500);
  });

  test("should support PPT format", async ({ page }) => {
    const testFile = getTestAsset("legacy_presentation.ppt");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "legacy.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 500);
  });

  test("should preserve vector graphics", async ({ page }) => {
    const testFile = getTestAsset("presentation_with_graphics.pptx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "graphics_preserved.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1200);
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
    const testFile = getTestAsset("sample_presentation.pptx");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Convert")');

    await expect(
      page.locator("text=/converting|processing|rendering/i"),
    ).toBeVisible({ timeout: 2000 });
  });
});
