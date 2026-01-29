import path from 'path';
import fs from 'fs/promises';
import config from '../config.js';
import { executeCommand, escapeShellArg } from '../utils/execUtils.js';
import { getTempFilePath, generateUniqueFilename } from '../utils/fileUtils.js';
import { validatePDF, validateFile } from '../utils/validation.js';

/**
 * Part 4 Image & Editing Services
 * - Edit PDF (qpdf for backend operations)
 * - PDF to JPG (Poppler/pdftoppm)
 * - JPG to PDF (ImageMagick)
 */

/**
 * Convert PDF to JPG images (one image per page)
 * Uses Poppler's pdftoppm for high-quality rasterization
 * 
 * Pipeline:
 * Upload → Validate → Rasterize → Color Convert → JPG Export → Store → Deliver
 * 
 * @param {Object} inputFile - Uploaded PDF file
 * @param {Object} options - Conversion options
 * @returns {Object} - Conversion result with output paths
 */
export async function pdfToJPG(inputFile, options = {}) {
  try {
    // Validate input is a PDF
    await validatePDF(inputFile.path);

    const {
      dpi = 150, // Resolution: 72 (screen), 150 (standard), 300 (high quality)
      quality = 90, // JPEG quality 1-100
      format = 'jpeg', // Output format
    } = options;

    console.log(`Converting PDF to JPG: ${inputFile.originalname}`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputBasename = path.basename(inputFile.originalname, '.pdf');
    const outputPrefix = generateUniqueFilename(outputBasename).replace('.pdf', '');

    // Poppler pdftoppm command
    // pdftoppm -jpeg -r 150 input.pdf output_prefix
    // This creates output_prefix-1.jpg, output_prefix-2.jpg, etc.
    const command = `"${config.tools.poppler}" -${format} -r ${dpi} -jpegopt quality=${quality} ${escapeShellArg(inputFile.path)} ${escapeShellArg(path.join(outputDir, outputPrefix))}`;

    console.log('Executing PDF to JPG conversion:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 120000 }); // 2 minutes timeout

    if (!result.success) {
      throw new Error(`PDF to JPG conversion failed: ${result.error}`);
    }

    // Find all generated JPG files
    const files = await fs.readdir(outputDir);
    const outputFiles = files
      .filter(file => file.startsWith(outputPrefix) && file.match(/\.(jpg|jpeg)$/i))
      .sort() // Sort to maintain page order
      .map(file => ({
        filename: file,
        path: path.join(outputDir, file),
        page: parseInt(file.match(/-(\d+)\.(jpg|jpeg)$/i)?.[1] || '1'),
      }));

    if (outputFiles.length === 0) {
      throw new Error('No JPG files were generated from the PDF');
    }

    console.log(`Generated ${outputFiles.length} JPG image(s)`);

    return {
      success: true,
      outputFiles,
      pageCount: outputFiles.length,
      dpi,
      quality,
      format,
    };
  } catch (error) {
    console.error('PDF to JPG error:', error);
    throw error;
  }
}

/**
 * Convert JPG image(s) to PDF
 * Uses ImageMagick for image-to-PDF conversion
 * 
 * Pipeline:
 * Upload → Validate → Normalize → Layout Pages → PDF Render → Store → Deliver
 * 
 * @param {Array} inputFiles - Array of uploaded JPG files
 * @param {Object} options - Conversion options
 * @returns {Object} - Conversion result with output path
 */
export async function jpgToPDF(inputFiles, options = {}) {
  try {
    // Validate all input files are images
    const validationPromises = inputFiles.map(file => 
      validateFile(file.path, ['.jpg', '.jpeg', '.png'])
    );
    await Promise.all(validationPromises);

    const {
      pageSize = 'letter', // Page size: letter, a4, legal
      quality = 85, // Image quality 1-100
      autoRotate = true, // Auto-rotate based on EXIF
    } = options;

    console.log(`Converting ${inputFiles.length} image(s) to PDF`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputFilename = generateUniqueFilename('images.pdf');
    const outputPath = path.join(outputDir, outputFilename);

    // Build ImageMagick command
    // magick convert image1.jpg image2.jpg -page letter output.pdf
    const inputPaths = inputFiles.map(file => escapeShellArg(file.path)).join(' ');
    
    let command = `"${config.tools.imagemagick}" convert ${inputPaths}`;
    
    // Add auto-rotate if enabled
    if (autoRotate) {
      command += ' -auto-orient';
    }
    
    // Add quality setting
    command += ` -quality ${quality}`;
    
    // Add page size
    command += ` -page ${pageSize}`;
    
    // Add output path
    command += ` ${escapeShellArg(outputPath)}`;

    console.log('Executing JPG to PDF conversion:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 120000 }); // 2 minutes timeout

    if (!result.success) {
      throw new Error(`JPG to PDF conversion failed: ${result.error}`);
    }

    // Verify output file exists
    try {
      await fs.access(outputPath);
    } catch (error) {
      throw new Error('Conversion completed but output file is not accessible');
    }

    console.log('JPG to PDF conversion completed successfully');

    return {
      success: true,
      outputPath,
      outputFilename,
      inputCount: inputFiles.length,
      pageSize,
      quality,
    };
  } catch (error) {
    console.error('JPG to PDF error:', error);
    throw error;
  }
}

/**
 * Edit PDF using qpdf for backend operations
 * This function handles various PDF editing operations
 * 
 * Pipeline:
 * Upload → Validate → Load Layers → Apply Edits → Rewrite Streams → Save Incrementally → Deliver
 * 
 * @param {Object} inputFile - Uploaded PDF file
 * @param {Object} edits - Edit operations to perform
 * @returns {Object} - Edited PDF result
 */
export async function editPDF(inputFile, edits = {}) {
  try {
    // Validate input is a PDF
    await validatePDF(inputFile.path);

    const {
      operation = 'rotate', // rotate, remove-pages, reorder-pages
      pages = null, // Page numbers or ranges
      angle = 90, // Rotation angle (90, 180, 270)
      password = null, // PDF password if encrypted
    } = edits;

    console.log(`Editing PDF: ${inputFile.originalname}, operation: ${operation}`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputBasename = path.basename(inputFile.originalname, '.pdf');
    const outputFilename = generateUniqueFilename(`${outputBasename}_edited.pdf`);
    const outputPath = path.join(outputDir, outputFilename);

    let command = '';

    switch (operation) {
      case 'rotate':
        // Rotate specific pages
        // qpdf input.pdf output.pdf --rotate=+90:1,3,5
        const rotatePages = pages || '1-z'; // '1-z' means all pages
        command = `"${config.tools.qpdf}" ${escapeShellArg(inputFile.path)} ${escapeShellArg(outputPath)} --rotate=${angle > 0 ? '+' : ''}${angle}:${rotatePages}`;
        break;

      case 'remove-pages':
        // Remove specific pages (keep all others)
        // qpdf input.pdf --pages . 1-2,4-z -- output.pdf
        if (!pages) {
          throw new Error('Pages parameter required for remove-pages operation');
        }
        command = `"${config.tools.qpdf}" ${escapeShellArg(inputFile.path)} --pages . ${pages} -- ${escapeShellArg(outputPath)}`;
        break;

      case 'decrypt':
        // Decrypt password-protected PDF
        // qpdf --password=secret --decrypt input.pdf output.pdf
        if (!password) {
          throw new Error('Password required for decrypt operation');
        }
        command = `"${config.tools.qpdf}" --password=${escapeShellArg(password)} --decrypt ${escapeShellArg(inputFile.path)} ${escapeShellArg(outputPath)}`;
        break;

      default:
        throw new Error(`Unsupported edit operation: ${operation}`);
    }

    console.log('Executing PDF edit:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 60000 }); // 1 minute timeout

    if (!result.success) {
      throw new Error(`PDF edit failed: ${result.error}`);
    }

    // Verify output file exists
    try {
      await fs.access(outputPath);
    } catch (error) {
      throw new Error('Edit completed but output file is not accessible');
    }

    console.log('PDF edit completed successfully');

    return {
      success: true,
      outputPath,
      outputFilename,
      operation,
      pages,
    };
  } catch (error) {
    console.error('Edit PDF error:', error);
    throw error;
  }
}
