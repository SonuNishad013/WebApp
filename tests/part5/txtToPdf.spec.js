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
 * E2E Tests for TXT to PDF Service (Part 5)
 * Tests text to PDF conversion with font, size, spacing, and margin options
 */

test.describe("TXT to PDF", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "TXT → PDF");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should convert TXT to PDF successfully", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "output.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should support Courier New font", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select Courier New font
    await page.selectOption('select[name="font"]', "Courier New");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "courier.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should support Arial font", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select Arial font
    await page.selectOption('select[name="font"]', "Arial");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "arial.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should support Times New Roman font", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select Times New Roman font
    await page.selectOption('select[name="font"]', "Times New Roman");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "times.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should support Helvetica font", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select Helvetica font
    await page.selectOption('select[name="font"]', "Helvetica");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "helvetica.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust font size to 12pt", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Set font size to 12pt
    await page.fill('input[name="fontSize"]', "12");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "fontsize_12.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust font size to 8pt (minimum)", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="fontSize"]', "8");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "fontsize_8.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust font size to 24pt (maximum)", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="fontSize"]', "24");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "fontsize_24.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust line spacing to 1.0", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Set line spacing to 1.0 (single)
    await page.fill('input[name="lineSpacing"]', "1.0");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "spacing_1.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust line spacing to 1.5", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="lineSpacing"]', "1.5");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "spacing_1.5.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust line spacing to 2.0 (double)", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="lineSpacing"]', "2.0");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "spacing_2.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should set margins to 0.5 inches", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Set margins to 0.5 inches
    await page.fill('input[name="margins"]', "0.5");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "margins_0.5.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should set margins to 1.0 inches", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="margins"]', "1.0");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "margins_1.0.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should set margins to 2.0 inches (maximum)", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="margins"]', "2.0");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "margins_2.0.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should reject invalid file type", async ({ page }) => {
    const invalidFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', invalidFile);

    await page.waitForTimeout(1000);
    const hasError = await page
      .locator("text=/invalid.*type|error/i")
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(true);
  });

  test("should show progress during conversion", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.click('button:has-text("Convert")');

    await expect(
      page.locator("text=/converting|processing|formatting/i"),
    ).toBeVisible({ timeout: 2000 });
  });

  test("should apply all formatting options together", async ({ page }) => {
    const testFile = getTestAsset("sample.txt");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Apply all formatting options
    await page.selectOption('select[name="font"]', "Times New Roman");
    await page.fill('input[name="fontSize"]', "14");
    await page.fill('input[name="lineSpacing"]', "1.5");
    await page.fill('input[name="margins"]', "1.0");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Convert")');
    });

    const downloadPath = await saveDownload(download, "all_options.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1000);
  });
});
