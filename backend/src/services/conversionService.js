import path from 'path';
import fs from 'fs/promises';
import config from '../config.js';
import { executeCommand, escapeShellArg } from '../utils/execUtils.js';
import { getTempFilePath, generateUniqueFilename } from '../utils/fileUtils.js';
import { validatePDF, validateFile } from '../utils/validation.js';

/**
 * Part 2 & Part 3 Conversion Services
 * Part 2: PDF to Office Format Conversions
 * Part 3: Office to PDF Conversions
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
 * Part 3: Office to PDF Conversions
 */

/**
 * Convert Word (DOCX) to PDF
 * Uses LibreOffice headless mode with PDF export filter
 * 
 * Pipeline:
 * Upload → Validate → Layout Render → Font Resolve → PDF Export → Store → Deliver
 * 
 * @param {Object} inputFile - Uploaded DOCX file
 * @param {Object} options - Conversion options
 * @returns {Object} - Conversion result with output path
 */
export async function wordToPDF(inputFile, options = {}) {
  try {
    // Validate input file exists and is accessible
    await validateFile(inputFile.path, ['.docx', '.doc']);

    console.log(`Converting Word to PDF: ${inputFile.originalname}`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputBasename = path.basename(inputFile.originalname, path.extname(inputFile.originalname));
    const outputFilename = generateUniqueFilename(`${outputBasename}.pdf`);
    const outputPath = path.join(outputDir, outputFilename);

    // LibreOffice headless conversion command
    // soffice --headless --convert-to pdf --outdir <outputDir> <inputFile>
    const command = `"${config.tools.libreoffice}" --headless --convert-to pdf --outdir ${escapeShellArg(outputDir)} ${escapeShellArg(inputFile.path)}`;

    console.log('Executing Word to PDF conversion:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 180000 }); // 3 minutes timeout

    if (!result.success) {
      throw new Error(`Word to PDF conversion failed: ${result.error}`);
    }

    // LibreOffice creates file with same basename as input
    const libreOfficeOutput = path.join(outputDir, path.basename(inputFile.path, path.extname(inputFile.path)) + '.pdf');
    
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
      originalFormat: 'docx',
      targetFormat: 'pdf',
    };
  } catch (error) {
    console.error('Word to PDF error:', error);
    throw error;
  }
}

/**
 * Convert PowerPoint (PPTX) to PDF
 * Uses LibreOffice headless mode with slide rendering
 * 
 * Pipeline:
 * Upload → Validate → Slide Render → Vector Export → PDF Export → Store → Deliver
 * 
 * @param {Object} inputFile - Uploaded PPTX file
 * @param {Object} options - Conversion options
 * @returns {Object} - Conversion result with output path
 */
export async function powerPointToPDF(inputFile, options = {}) {
  try {
    // Validate input file exists and is accessible
    await validateFile(inputFile.path, ['.pptx', '.ppt']);

    console.log(`Converting PowerPoint to PDF: ${inputFile.originalname}`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputBasename = path.basename(inputFile.originalname, path.extname(inputFile.originalname));
    const outputFilename = generateUniqueFilename(`${outputBasename}.pdf`);
    const outputPath = path.join(outputDir, outputFilename);

    // LibreOffice headless conversion command
    // soffice --headless --convert-to pdf --outdir <outputDir> <inputFile>
    const command = `"${config.tools.libreoffice}" --headless --convert-to pdf --outdir ${escapeShellArg(outputDir)} ${escapeShellArg(inputFile.path)}`;

    console.log('Executing PowerPoint to PDF conversion:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 180000 }); // 3 minutes timeout

    if (!result.success) {
      throw new Error(`PowerPoint to PDF conversion failed: ${result.error}`);
    }

    // LibreOffice creates file with same basename as input
    const libreOfficeOutput = path.join(outputDir, path.basename(inputFile.path, path.extname(inputFile.path)) + '.pdf');
    
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
      originalFormat: 'pptx',
      targetFormat: 'pdf',
    };
  } catch (error) {
    console.error('PowerPoint to PDF error:', error);
    throw error;
  }
}

/**
 * Convert Excel (XLSX) to PDF
 * Uses LibreOffice headless mode with sheet layout and page break control
 * 
 * Pipeline:
 * Upload → Validate → Sheet Layout → Page Break Control → PDF Export → Store → Deliver
 * 
 * @param {Object} inputFile - Uploaded XLSX file
 * @param {Object} options - Conversion options
 * @returns {Object} - Conversion result with output path
 */
export async function excelToPDF(inputFile, options = {}) {
  try {
    // Validate input file exists and is accessible
    await validateFile(inputFile.path, ['.xlsx', '.xls']);

    console.log(`Converting Excel to PDF: ${inputFile.originalname}`);

    // Create output directory for this conversion
    const outputDir = getTempFilePath('', 'outputs');
    const outputBasename = path.basename(inputFile.originalname, path.extname(inputFile.originalname));
    const outputFilename = generateUniqueFilename(`${outputBasename}.pdf`);
    const outputPath = path.join(outputDir, outputFilename);

    // LibreOffice headless conversion command
    // soffice --headless --convert-to pdf --outdir <outputDir> <inputFile>
    const command = `"${config.tools.libreoffice}" --headless --convert-to pdf --outdir ${escapeShellArg(outputDir)} ${escapeShellArg(inputFile.path)}`;

    console.log('Executing Excel to PDF conversion:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 180000 }); // 3 minutes timeout

    if (!result.success) {
      throw new Error(`Excel to PDF conversion failed: ${result.error}`);
    }

    // LibreOffice creates file with same basename as input
    const libreOfficeOutput = path.join(outputDir, path.basename(inputFile.path, path.extname(inputFile.path)) + '.pdf');
    
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
      originalFormat: 'xlsx',
      targetFormat: 'pdf',
    };
  } catch (error) {
    console.error('Excel to PDF error:', error);
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
