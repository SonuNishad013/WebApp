import path from 'path';
import { fileTypeFromFile } from 'file-type';
import config from '../config.js';
import { getFileSize } from './fileUtils.js';

/**
 * Validate file extension
 */
export function validateExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  if (!config.allowedExtensions.includes(ext)) {
    throw new Error(`File type ${ext} is not allowed. Allowed types: ${config.allowedExtensions.join(', ')}`);
  }
  
  return ext;
}

/**
 * Validate file size
 */
export async function validateFileSize(filePath) {
  const size = await getFileSize(filePath);
  
  if (size > config.maxFileSize) {
    const maxSizeMB = (config.maxFileSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
  
  return size;
}

/**
 * Validate MIME type matches extension
 */
export async function validateMimeType(filePath, expectedExtension) {
  try {
    const fileType = await fileTypeFromFile(filePath);
    
    if (!fileType) {
      // Some text files may not have detectable MIME types
      if (['.txt', '.csv'].includes(expectedExtension)) {
        return true;
      }
      console.warn(`Could not detect MIME type for ${filePath}`);
      return true;
    }

    // Map extensions to expected MIME types
    const mimeMap = {
      '.pdf': ['application/pdf'],
      '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.webp': ['image/webp'],
    };

    const expectedMimes = mimeMap[expectedExtension];
    
    if (expectedMimes && !expectedMimes.includes(fileType.mime)) {
      throw new Error(`File MIME type ${fileType.mime} does not match expected type for ${expectedExtension}`);
    }

    return true;
  } catch (error) {
    console.error('MIME type validation error:', error.message);
    throw error;
  }
}

/**
 * Comprehensive file validation
 */
export async function validateFile(filePath, filename) {
  try {
    // Validate extension
    const ext = validateExtension(filename);
    
    // Validate file size
    await validateFileSize(filePath);
    
    // Validate MIME type
    await validateMimeType(filePath, ext);
    
    return {
      valid: true,
      extension: ext,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Validate PDF file specifically
 */
export async function validatePDF(filePath) {
  const fileType = await fileTypeFromFile(filePath);
  
  if (!fileType || fileType.mime !== 'application/pdf') {
    throw new Error('File is not a valid PDF');
  }
  
  return true;
}

/**
 * Validate multiple files
 */
export async function validateFiles(files) {
  const validationPromises = files.map(file => 
    validateFile(file.path, file.originalname)
  );
  
  try {
    const results = await Promise.all(validationPromises);
    return results;
  } catch (error) {
    throw error;
  }
}
