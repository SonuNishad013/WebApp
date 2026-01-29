import path from 'path';
import fs from 'fs/promises';
import config from '../config.js';
import { executeCommand, escapeShellArg } from '../utils/execUtils.js';
import { getTempFilePath, generateUniqueFilename } from '../utils/fileUtils.js';
import { validatePDF, validateFile } from '../utils/validation.js';

/**
 * Part 2 Conversion Services
 * PDF to Office Format Conversions
 */

/**
 * Convert PDF to Word (DOCX)
 * Uses LibreOffice headless mode with PDF import filter
 * 
 * Pipeline:
 * Upload → Validate → LibreOffice Convert → Store → Deliver
 * 
 * @param {Object} inputFile - Uploaded PDF file
 * @param {Object} options - Conversion options
 * @returns {Object} - Conversion result with output path
 */
export async function pdfToWord(inputFile, options = {}) {
  try {
    // Validate input is a PDF
    await validatePDF(inputFile.path);

    const {
      ocrEnabled = false, // OCR for scanned PDFs (future enhancement)
    } = options;

    console.log(`Converting PDF to Word: ${inputFile.originalname}`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputBasename = path.basename(inputFile.originalname, '.pdf');
    const outputFilename = generateUniqueFilename(`${outputBasename}.docx`);
    const outputPath = path.join(outputDir, outputFilename);

    // LibreOffice headless conversion command
    // soffice --headless --convert-to docx --outdir <outputDir> <inputFile>
    const command = `"${config.tools.libreoffice}" --headless --convert-to docx --outdir ${escapeShellArg(outputDir)} ${escapeShellArg(inputFile.path)}`;

    console.log('Executing PDF to Word conversion:', command);

    // Execute command (LibreOffice can be slow for large PDFs)
    const result = await executeCommand(command, { timeout: 180000 }); // 3 minutes timeout

    if (!result.success) {
      throw new Error(`PDF to Word conversion failed: ${result.error}`);
    }

    // LibreOffice creates file with same basename as input
    const libreOfficeOutput = path.join(outputDir, path.basename(inputFile.path, '.pdf') + '.docx');
    
    // Rename to our unique filename
    try {
      await fs.rename(libreOfficeOutput, outputPath);
    } catch (renameError) {
      console.error('Output file not found at expected location:', libreOfficeOutput);
      // Check if file was created with different name
      const files = await fs.readdir(outputDir);
      console.log('Files in output directory:', files);
      throw new Error('Conversion completed but output file not found');
    }

    // Verify output file exists
    try {
      await fs.access(outputPath);
    } catch (error) {
      throw new Error('Conversion completed but output file is not accessible');
    }

    return {
      success: true,
      outputPath,
      outputFilename,
      originalFormat: 'pdf',
      targetFormat: 'docx',
      ocrUsed: ocrEnabled,
    };
  } catch (error) {
    console.error('PDF to Word error:', error);
    throw error;
  }
}

/**
 * Convert PDF to PowerPoint (PPTX)
 * Uses LibreOffice headless mode (PDF → ODP → PPTX)
 * 
 * Pipeline:
 * Upload → Validate → LibreOffice Convert → Store → Deliver
 * 
 * @param {Object} inputFile - Uploaded PDF file
 * @param {Object} options - Conversion options
 * @returns {Object} - Conversion result with output path
 */
export async function pdfToPowerPoint(inputFile, options = {}) {
  try {
    // Validate input is a PDF
    await validatePDF(inputFile.path);

    console.log(`Converting PDF to PowerPoint: ${inputFile.originalname}`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputBasename = path.basename(inputFile.originalname, '.pdf');
    const outputFilename = generateUniqueFilename(`${outputBasename}.pptx`);
    const outputPath = path.join(outputDir, outputFilename);

    // LibreOffice headless conversion command
    // Note: LibreOffice converts PDF → ODP (OpenDocument Presentation) → PPTX
    const command = `"${config.tools.libreoffice}" --headless --convert-to pptx --outdir ${escapeShellArg(outputDir)} ${escapeShellArg(inputFile.path)}`;

    console.log('Executing PDF to PowerPoint conversion:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 180000 }); // 3 minutes timeout

    if (!result.success) {
      throw new Error(`PDF to PowerPoint conversion failed: ${result.error}`);
    }

    // LibreOffice creates file with same basename as input
    const libreOfficeOutput = path.join(outputDir, path.basename(inputFile.path, '.pdf') + '.pptx');
    
    // Rename to our unique filename
    try {
      await fs.rename(libreOfficeOutput, outputPath);
    } catch (renameError) {
      console.error('Output file not found at expected location:', libreOfficeOutput);
      const files = await fs.readdir(outputDir);
      console.log('Files in output directory:', files);
      throw new Error('Conversion completed but output file not found');
    }

    // Verify output file exists
    try {
      await fs.access(outputPath);
    } catch (error) {
      throw new Error('Conversion completed but output file is not accessible');
    }

    return {
      success: true,
      outputPath,
      outputFilename,
      originalFormat: 'pdf',
      targetFormat: 'pptx',
    };
  } catch (error) {
    console.error('PDF to PowerPoint error:', error);
    throw error;
  }
}

/**
 * Convert PDF to Excel (XLSX)
 * Uses LibreOffice headless mode with table detection
 * Note: Works best with PDFs containing structured tables
 * 
 * Pipeline:
 * Upload → Validate → LibreOffice Convert → Store → Deliver
 * 
 * Future enhancement: Add Tabula for better table extraction
 * 
 * @param {Object} inputFile - Uploaded PDF file
 * @param {Object} options - Conversion options
 * @returns {Object} - Conversion result with output path
 */
export async function pdfToExcel(inputFile, options = {}) {
  try {
    // Validate input is a PDF
    await validatePDF(inputFile.path);

    const {
      useTabula = false, // Use Tabula for better table extraction (future)
    } = options;

    console.log(`Converting PDF to Excel: ${inputFile.originalname}`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputBasename = path.basename(inputFile.originalname, '.pdf');
    const outputFilename = generateUniqueFilename(`${outputBasename}.xlsx`);
    const outputPath = path.join(outputDir, outputFilename);

    // LibreOffice headless conversion command
    // Note: LibreOffice will attempt to detect tables in the PDF
    const command = `"${config.tools.libreoffice}" --headless --convert-to xlsx --outdir ${escapeShellArg(outputDir)} ${escapeShellArg(inputFile.path)}`;

    console.log('Executing PDF to Excel conversion:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 180000 }); // 3 minutes timeout

    if (!result.success) {
      throw new Error(`PDF to Excel conversion failed: ${result.error}`);
    }

    // LibreOffice creates file with same basename as input
    const libreOfficeOutput = path.join(outputDir, path.basename(inputFile.path, '.pdf') + '.xlsx');
    
    // Rename to our unique filename
    try {
      await fs.rename(libreOfficeOutput, outputPath);
    } catch (renameError) {
      console.error('Output file not found at expected location:', libreOfficeOutput);
      const files = await fs.readdir(outputDir);
      console.log('Files in output directory:', files);
      throw new Error('Conversion completed but output file not found');
    }

    // Verify output file exists
    try {
      await fs.access(outputPath);
    } catch (error) {
      throw new Error('Conversion completed but output file is not accessible');
    }

    return {
      success: true,
      outputPath,
      outputFilename,
      originalFormat: 'pdf',
      targetFormat: 'xlsx',
      tabulaUsed: useTabula,
    };
  } catch (error) {
    console.error('PDF to Excel error:', error);
    throw error;
  }
}
