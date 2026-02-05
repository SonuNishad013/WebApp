import { expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Test Utilities for E2E Testing
 * Provides common functions for file handling, validation, and assertions
 */

/**
 * Get path to a test asset file
 * @param {string} filename - Name of the file in test-assets directory
 * @returns {string} Absolute path to the file
 */
export function getTestAsset(filename) {
  return path.resolve(process.cwd(), 'test-assets', filename);
}

/**
 * Wait for a download to complete
 * @param {Page} page - Playwright page object
 * @param {Function} triggerDownload - Async function that triggers the download
 * @returns {Promise<Download>} The download object
 */
export async function waitForDownload(page, triggerDownload) {
  const downloadPromise = page.waitForEvent('download');
  await triggerDownload();
  const download = await downloadPromise;
  return download;
}

/**
 * Save a download to a temporary location and return the path
 * @param {Download} download - Playwright download object
 * @param {string} suggestedFilename - Suggested filename for the download
 * @returns {Promise<string>} Path where the file was saved
 */
export async function saveDownload(download, suggestedFilename) {
  const tempDir = path.resolve(process.cwd(), 'temp', 'test-downloads');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filename = suggestedFilename || download.suggestedFilename();
  const filePath = path.join(tempDir, filename);
  await download.saveAs(filePath);
  return filePath;
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to the file
 * @returns {number} File size in bytes
 */
export function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file exists
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Delete a file if it exists
 * @param {string} filePath - Path to the file
 */
export function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Read file as buffer
 * @param {string} filePath - Path to the file
 * @returns {Buffer} File contents
 */
export function readFileAsBuffer(filePath) {
  return fs.readFileSync(filePath);
}

/**
 * Assert that a file has a specific extension
 * @param {string} filePath - Path to the file
 * @param {string} expectedExtension - Expected file extension (e.g., '.pdf')
 */
export function assertFileExtension(filePath, expectedExtension) {
  const actualExtension = path.extname(filePath).toLowerCase();
  expect(actualExtension).toBe(expectedExtension.toLowerCase());
}

/**
 * Assert that a file size is greater than a minimum
 * @param {string} filePath - Path to the file
 * @param {number} minBytes - Minimum expected size in bytes
 */
export function assertFileSizeGreaterThan(filePath, minBytes) {
  const size = getFileSize(filePath);
  expect(size).toBeGreaterThan(minBytes);
}

/**
 * Assert that a file size is less than a maximum
 * @param {string} filePath - Path to the file
 * @param {number} maxBytes - Maximum expected size in bytes
 */
export function assertFileSizeLessThan(filePath, maxBytes) {
  const size = getFileSize(filePath);
  expect(size).toBeLessThan(maxBytes);
}

/**
 * Navigate to a specific service tab
 * @param {Page} page - Playwright page object
 * @param {string} tabName - Name of the tab (e.g., 'Merge PDF', 'Split PDF')
 */
export async function navigateToTab(page, tabName) {
  await page.goto('/');
  await page.click(`button:has-text("${tabName}")`);
  await page.waitForTimeout(500); // Wait for tab transition
}

/**
 * Upload a file using the file input
 * @param {Page} page - Playwright page object
 * @param {string} inputSelector - Selector for the file input
 * @param {string} filePath - Path to the file to upload
 */
export async function uploadFile(page, inputSelector, filePath) {
  const fileInput = await page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);
  await page.waitForTimeout(300); // Wait for file to be processed
}

/**
 * Upload multiple files using the file input
 * @param {Page} page - Playwright page object
 * @param {string} inputSelector - Selector for the file input
 * @param {string[]} filePaths - Array of paths to files to upload
 */
export async function uploadMultipleFiles(page, inputSelector, filePaths) {
  const fileInput = await page.locator(inputSelector);
  await fileInput.setInputFiles(filePaths);
  await page.waitForTimeout(500); // Wait for files to be processed
}

/**
 * Wait for success state to appear
 * @param {Page} page - Playwright page object
 */
export async function waitForSuccess(page) {
  await page.waitForSelector('text=Success', { timeout: 30000 });
}

/**
 * Wait for error state to appear
 * @param {Page} page - Playwright page object
 */
export async function waitForError(page) {
  await page.waitForSelector('text=Error', { timeout: 10000 });
}

/**
 * Click a button and wait for it to be enabled again
 * @param {Page} page - Playwright page object
 * @param {string} buttonText - Text of the button to click
 */
export async function clickAndWait(page, buttonText) {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await button.click();
  await page.waitForTimeout(500);
}

/**
 * Create sample PDF files for testing
 * Uses Ghostscript to create simple PDF files
 */
export function createTestPDF(filename, numPages = 1) {
  const testAssetsDir = path.resolve(process.cwd(), 'test-assets');
  if (!fs.existsSync(testAssetsDir)) {
    fs.mkdirSync(testAssetsDir, { recursive: true });
  }
  
  const outputPath = path.join(testAssetsDir, filename);
  
  // Create a simple PostScript file
  let psContent = '%!PS-Adobe-3.0\n';
  for (let i = 1; i <= numPages; i++) {
    psContent += `
%%Page: ${i} ${i}
/Helvetica findfont 24 scalefont setfont
100 700 moveto
(Page ${i} of ${numPages}) show
showpage
`;
  }
  
  const psPath = outputPath.replace('.pdf', '.ps');
  fs.writeFileSync(psPath, psContent);
  
  // Convert to PDF using Ghostscript (this is a helper, actual creation should be done manually or in setup)
  // For actual use, test assets should be pre-created
  
  return outputPath;
}

/**
 * Clean up test downloads directory
 */
export function cleanupDownloads() {
  const tempDir = path.resolve(process.cwd(), 'temp', 'test-downloads');
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(tempDir, file));
    });
  }
}
