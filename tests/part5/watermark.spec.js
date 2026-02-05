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
 * E2E Tests for Watermark PDF Service (Part 5)
 * Tests watermark overlay with position, opacity, rotation options
 */

test.describe("Watermark PDF", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "Watermark PDF");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should add text watermark to PDF", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Enter watermark text
    await page.fill('input[name="watermarkText"]', "CONFIDENTIAL");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Add Watermark")');
    });

    const downloadPath = await saveDownload(download, "watermarked.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should position watermark at center", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="watermarkText"]', "DRAFT");
    await page.selectOption('select[name="position"]', "center");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Add Watermark")');
    });

    const downloadPath = await saveDownload(download, "watermark_center.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should position watermark at corners", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="watermarkText"]', "DO NOT COPY");

    // Test each corner position
    for (const pos of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
      await page.selectOption('select[name="position"]', pos);

      const download = await waitForDownload(page, async () => {
        await page.click('button:has-text("Add Watermark")');
      });

      const downloadPath = await saveDownload(download, `watermark_${pos}.pdf`);
      assertFileExtension(downloadPath, ".pdf");
    }
  });

  test("should adjust watermark opacity", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="watermarkText"]', "SAMPLE");

    // Set opacity to 50%
    await page.fill('input[name="opacity"]', "50");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Add Watermark")');
    });

    const downloadPath = await saveDownload(download, "opacity_50.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust watermark opacity to 10% (minimal)", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="watermarkText"]', "LIGHT");
    await page.fill('input[name="opacity"]', "10");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Add Watermark")');
    });

    const downloadPath = await saveDownload(download, "opacity_10.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust watermark opacity to 100% (maximum)", async ({
    page,
  }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="watermarkText"]', "DARK");
    await page.fill('input[name="opacity"]', "100");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Add Watermark")');
    });

    const downloadPath = await saveDownload(download, "opacity_100.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should adjust watermark font size", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="watermarkText"]', "TEXT");

    // Set font size to 36pt
    await page.fill('input[name="fontSize"]', "36");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Add Watermark")');
    });

    const downloadPath = await saveDownload(download, "fontsize_36.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should rotate watermark", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="watermarkText"]', "ROTATED");

    // Set rotation to 45 degrees
    await page.fill('input[name="rotation"]', "45");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Add Watermark")');
    });

    const downloadPath = await saveDownload(download, "rotation_45.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should support different watermark colors", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const colors = ["gray", "red", "blue", "black"];

    for (const color of colors) {
      await page.fill('input[name="watermarkText"]', "COLOR");
      await page.selectOption('select[name="color"]', color);

      const download = await waitForDownload(page, async () => {
        await page.click('button:has-text("Add Watermark")');
      });

      const downloadPath = await saveDownload(
        download,
        `watermark_${color}.pdf`,
      );
      assertFileExtension(downloadPath, ".pdf");
    }
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

  test("should show progress during watermarking", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.fill('input[name="watermarkText"]', "PROCESSING");

    await page.click('button:has-text("Add Watermark")');

    await expect(
      page.locator("text=/adding|processing|watermarking/i"),
    ).toBeVisible({ timeout: 2000 });
  });

  test("should apply watermark to all pages", async ({ page }) => {
    const testFile = getTestAsset("sample_multipage.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="watermarkText"]', "ALL PAGES");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Add Watermark")');
    });

    const downloadPath = await saveDownload(
      download,
      "all_pages_watermarked.pdf",
    );
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1500);
  });
});
