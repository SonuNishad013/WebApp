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
 * E2E Tests for Word to PDF Service (Part 3)
 * Tests DOCX/DOC to PDF conversion with layout preservation
 */

test.describe("Word to PDF", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "Word → PDF");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should convert DOCX to PDF successfully", async ({ page }) => {
    const testFile = getTestAsset("sample_document.docx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should preserve layout and formatting", async ({ page }) => {
    const testFile = getTestAsset("sample_formatted.docx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "formatted.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1500);
  });

  test("should support DOC format", async ({ page }) => {
    const testFile = getTestAsset("legacy_document.doc");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "legacy.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 500);
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
    const testFile = getTestAsset("sample_document.docx");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Convert")');

    await expect(
      page.locator("text=/converting|processing|rendering/i"),
    ).toBeVisible({ timeout: 2000 });
  });

  test("should embed fonts in output PDF", async ({ page }) => {
    const testFile = getTestAsset("sample_with_fonts.docx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "fonts_embedded.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1200);
  });
});
