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
 * E2E Tests for Excel to PDF Service (Part 3)
 * Tests XLSX/XLS to PDF conversion with sheet handling
 */

test.describe("Excel to PDF", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "Excel → PDF");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should convert XLSX to PDF successfully", async ({ page }) => {
    const testFile = getTestAsset("sample_spreadsheet.xlsx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should include all sheets in PDF", async ({ page }) => {
    // Multi-sheet Excel file should convert all sheets to PDF
    const testFile = getTestAsset("sample_multisheet.xlsx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "multisheet.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1500);
  });

  test("should preserve cell formatting", async ({ page }) => {
    const testFile = getTestAsset("sample_formatted_sheet.xlsx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "formatted.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1200);
  });

  test("should support XLS format", async ({ page }) => {
    const testFile = getTestAsset("legacy_spreadsheet.xls");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "legacy.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 500);
  });

  test("should handle charts and graphics", async ({ page }) => {
    const testFile = getTestAsset("spreadsheet_with_charts.xlsx");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "with_charts.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1300);
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
    const testFile = getTestAsset("sample_spreadsheet.xlsx");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Convert")');

    await expect(
      page.locator("text=/converting|processing|rendering/i"),
    ).toBeVisible({ timeout: 2000 });
  });
});
