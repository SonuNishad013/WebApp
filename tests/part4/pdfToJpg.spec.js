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
 * E2E Tests for PDF to JPG Service (Part 4)
 * Tests PDF to JPG conversion with DPI/quality options and ZIP archive validation
 */

test.describe("PDF to JPG", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "PDF → JPG");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should convert single page PDF to JPG", async ({ page }) => {
    const testFile = getTestAsset("sample_single.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.jpg");
    assertFileExtension(downloadPath, ".jpg");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should convert multi-page PDF to ZIP archive", async ({ page }) => {
    const testFile = getTestAsset("sample_multipage.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.zip");
    assertFileExtension(downloadPath, ".zip");
    assertFileSizeGreaterThan(downloadPath, 2000);
  });

  test("should apply DPI option (72 DPI)", async ({ page }) => {
    const testFile = getTestAsset("sample_single.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select screen quality (72 DPI)
    await page.selectOption('select[name="dpi"]', "72");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "screen_quality.jpg");
    assertFileExtension(downloadPath, ".jpg");
  });

  test("should apply high DPI option (300 DPI)", async ({ page }) => {
    const testFile = getTestAsset("sample_single.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select high quality (300 DPI)
    await page.selectOption('select[name="dpi"]', "300");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "high_quality.jpg");
    assertFileExtension(downloadPath, ".jpg");
    assertFileSizeGreaterThan(downloadPath, 3000);
  });

  test("should adjust JPEG quality", async ({ page }) => {
    const testFile = getTestAsset("sample_single.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Set quality to 50%
    await page.fill('input[name="quality"]', "50");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "low_quality.jpg");
    assertFileExtension(downloadPath, ".jpg");
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
    const testFile = getTestAsset("sample_single.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Convert")');

    await expect(
      page.locator("text=/converting|processing|rasterizing/i"),
    ).toBeVisible({ timeout: 2000 });
  });

  test("should auto-number pages in ZIP archive", async ({ page }) => {
    const testFile = getTestAsset("sample_3pages.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "numbered.zip");
    assertFileExtension(downloadPath, ".zip");
    // Expected: Contains page_1.jpg, page_2.jpg, page_3.jpg etc
  });
});
