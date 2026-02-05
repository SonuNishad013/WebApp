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
 * E2E Tests for Edit PDF Service (Part 4)
 * Tests rotate pages, remove pages, and decrypt functionality
 */

test.describe("Edit PDF", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "Edit PDF");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should rotate PDF pages successfully", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select rotate operation
    await page.click('button:has-text("Rotate")');

    // Select rotation angle
    await page.selectOption('select[name="angle"]', "90");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Apply")');
    });

    const downloadPath = await saveDownload(download, "rotated.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 500);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 10000 });
  });

  test("should rotate specific pages", async ({ page }) => {
    const testFile = getTestAsset("sample_multipage.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.click('button:has-text("Rotate")');
    await page.fill('input[name="pages"]', "1-3");
    await page.selectOption('select[name="angle"]', "180");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Apply")');
    });

    const downloadPath = await saveDownload(download, "rotated_pages.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should remove pages from PDF", async ({ page }) => {
    const testFile = getTestAsset("sample_multipage.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select remove operation
    await page.click('button:has-text("Remove Pages")');

    // Specify page range to keep
    await page.fill('input[name="pages"]', "1-3");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Apply")');
    });

    const downloadPath = await saveDownload(download, "pages_removed.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 300);
  });

  test("should decrypt password-protected PDF", async ({ page }) => {
    const testFile = getTestAsset("encrypted.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Select decrypt operation
    await page.click('button:has-text("Decrypt")');

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Decrypt")');
    });

    const downloadPath = await saveDownload(download, "decrypted.pdf");
    assertFileExtension(downloadPath, ".pdf");

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 5000 });
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

  test("should show operation selection UI", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Verify operation buttons are visible
    await expect(page.locator('button:has-text("Rotate")')).toBeVisible();
    await expect(page.locator('button:has-text("Remove Pages")')).toBeVisible();
    await expect(page.locator('button:has-text("Decrypt")')).toBeVisible();
  });

  test("should validate page range input", async ({ page }) => {
    const testFile = getTestAsset("sample_multipage.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.click('button:has-text("Remove Pages")');
    await page.fill('input[name="pages"]', "invalid");

    // Should show validation error
    const hasError = await page
      .locator("text=/invalid.*range|format/i")
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(true);
  });
});
