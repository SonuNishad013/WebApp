import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config.js';

/**
 * Ensure required directories exist
 */
export async function ensureDirectories() {
  const dirs = [config.uploadDir, config.outputDir];
  
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Generate unique filename with original extension
 */
export function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName);
  const uniqueId = uuidv4();
  return `${uniqueId}${ext}`;
}

/**
 * Get temporary file path
 */
export function getTempFilePath(filename, type = 'uploads') {
  const dir = type === 'uploads' ? config.uploadDir : config.outputDir;
  return path.join(dir, filename);
}

/**
 * Clean up old files based on TTL
 */
export async function cleanupOldFiles() {
  const now = Date.now();
  const ttl = config.fileTTL * 1000; // Convert to milliseconds

  const dirs = [config.uploadDir, config.outputDir];

  for (const dir of dirs) {
    try {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > ttl) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error(`Error cleaning up ${dir}:`, error.message);
    }
  }
}

/**
 * Delete specific file
 */
export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error.message);
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(filePaths) {
  const deletePromises = filePaths.map(filePath => deleteFile(filePath));
  await Promise.all(deletePromises);
}

/**
 * Check if file exists
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Start periodic cleanup
 */
export function startPeriodicCleanup(intervalMinutes = 30) {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Run immediately
  cleanupOldFiles();
  
  // Then run periodically
  setInterval(cleanupOldFiles, intervalMs);
  
  console.log(`Periodic cleanup scheduled every ${intervalMinutes} minutes`);
}
