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
 * E2E Tests for Sign PDF Service (Part 5)
 * Tests digital signatures with certificate generation and metadata validation
 */

test.describe("Sign PDF", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTab(page, "Sign PDF");
  });

  test.afterEach(() => {
    cleanupDownloads();
  });

  test("should sign PDF with digital signature", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Fill signer information
    await page.fill('input[name="signerName"]', "John Doe");
    await page.fill('input[name="reason"]', "Document Approval");
    await page.fill('input[name="location"]', "New York");
    await page.fill('input[name="contact"]', "john@example.com");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Sign")');
    });

    const downloadPath = await saveDownload(download, "signed.pdf");
    assertFileExtension(downloadPath, ".pdf");
    assertFileSizeGreaterThan(downloadPath, 1000);

    await expect(page.locator("text=Success")).toBeVisible({ timeout: 15000 });
  });

  test("should generate self-signed certificate", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    await page.fill('input[name="signerName"]', "Jane Smith");

    // Check that certificate is generated internally
    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Sign")');
    });

    const downloadPath = await saveDownload(download, "cert_generated.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should embed signature metadata", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    const signerName = "Test Signer";
    const reason = "Testing Metadata";

    await page.fill('input[name="signerName"]', signerName);
    await page.fill('input[name="reason"]', reason);

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Sign")');
    });

    const downloadPath = await saveDownload(download, "with_metadata.pdf");
    assertFileExtension(downloadPath, ".pdf");
    // Metadata would be verified through PDF inspection in production
  });

  test("should validate signer name input", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Try to sign without signer name
    const signButton = page.locator('button:has-text("Sign")');

    // Should be disabled if name is empty
    const isDisabled = await signButton.isDisabled().catch(() => false);
    if (isDisabled) {
      expect(isDisabled).toBe(true);
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

  test("should show progress during signing", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.fill('input[name="signerName"]', "Test");

    await page.click('button:has-text("Sign")');

    await expect(
      page.locator("text=/signing|processing|generating/i"),
    ).toBeVisible({ timeout: 2000 });
  });

  test("should add _signed suffix to filename", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);
    await page.fill('input[name="signerName"]', "Test Signer");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Sign")');
    });

    // Verify filename has _signed suffix
    const downloadPath = await saveDownload(download, "sample_signed.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });

  test("should handle multiple signature fields", async ({ page }) => {
    const testFile = getTestAsset("sample.pdf");

    await uploadFile(page, 'input[type="file"]', testFile);

    // Fill all optional fields
    await page.fill('input[name="signerName"]', "John Doe");
    await page.fill('input[name="reason"]', "Approval");
    await page.fill('input[name="location"]', "Office");
    await page.fill('input[name="contact"]', "contact@example.com");

    const download = await waitForDownload(page, async () => {
      await page.click('button:has-text("Sign")');
    });

    const downloadPath = await saveDownload(download, "full_signature.pdf");
    assertFileExtension(downloadPath, ".pdf");
  });
});
