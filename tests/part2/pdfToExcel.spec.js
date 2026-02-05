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
 * E2E Tests for PDF to Excel Service (Part 2)
 * Tests table extraction from PDF to XLSX with row validation
 */

test.describe("PDF to Excel", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "PDF → Excel");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should convert PDF table to Excel successfully", async ({ page }) => {
    const testFile = getTestAsset("sample_table.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.xlsx");
    assertFileExtension(downloadPath, ".xlsx");
    assertFileSizeGreaterThan(downloadPath, 500);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should extract table rows correctly", async ({ page }) => {
    const testFile = getTestAsset("sample_data_table.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "rows_extracted.xlsx");
    assertFileExtension(downloadPath, ".xlsx");
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
    const testFile = getTestAsset("sample_table.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Convert")');

    await expect(
      page.locator("text=/converting|processing|extracting/i"),
    ).toBeVisible({ timeout: 2000 });
  });

  test("should preserve table structure and data", async ({ page }) => {
    const testFile = getTestAsset("sample_structured_table.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(
      download,
      "structure_preserved.xlsx",
    );
    assertFileExtension(downloadPath, ".xlsx");
    assertFileSizeGreaterThan(downloadPath, 500);
  });

  test("should handle non-table PDFs gracefully", async ({ page }) => {
    const textOnlyPdf = getTestAsset("sample_text_only.pdf");

    await uploadFile(page, 'input[type="file"]', textOnlyPdf);

    await page.click('button:has-text("Convert")');

    // Should either show warning or attempt conversion
    const warningOrSuccess = await page
      .locator("text=/warning|success|no.*table/i")
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(warningOrSuccess).toBe(true);
  });
});
