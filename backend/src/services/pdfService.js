import path from 'path';
import config from '../config.js';
import { executeCommand, escapeShellArg } from '../utils/execUtils.js';
import { getTempFilePath, generateUniqueFilename, deleteFiles } from '../utils/fileUtils.js';
import { validatePDF } from '../utils/validation.js';

/**
 * Merge multiple PDF files into one
 * Uses qpdf for lossless, fast merge
 */
export async function mergePDFs(inputFiles) {
  try {
    // Validate all input files are PDFs
    const validationPromises = inputFiles.map(file => validatePDF(file.path));
    await Promise.all(validationPromises);

    // Generate output filename
    const outputFilename = generateUniqueFilename('merged.pdf');
    const outputPath = getTempFilePath(outputFilename, 'outputs');

    // Build qpdf command
    // qpdf --empty --pages a.pdf b.pdf -- merged.pdf
    const inputPaths = inputFiles.map(file => escapeShellArg(file.path)).join(' ');
    const command = `"${config.tools.qpdf}" --empty --pages ${inputPaths} -- ${escapeShellArg(outputPath)}`;

    console.log('Executing merge command:', command);

    // Execute command
    const result = await executeCommand(command, { timeout: 60000 }); // 60s timeout

    if (!result.success) {
      throw new Error(`PDF merge failed: ${result.error}`);
    }

    return {
      success: true,
      outputPath,
      outputFilename,
      inputCount: inputFiles.length,
    };
  } catch (error) {
    console.error('Merge PDF error:', error);
    throw error;
  }
}

/**
 * Split PDF into separate pages or ranges
 * Uses qpdf for precise page extraction
 */
export async function splitPDF(inputFile, options = {}) {
  try {
    // Validate input is a PDF
    await validatePDF(inputFile.path);

    const {
      pageRanges = null, // e.g., '1-3', '5-7', null for all pages
      mode = 'range', // 'range' or 'individual' (split each page)
    } = options;

    const results = [];

    if (mode === 'individual') {
      // Split into individual pages
      // First, we need to get the page count
      const pageCountCommand = `"${config.tools.qpdf}" --show-npages ${escapeShellArg(inputFile.path)}`;
      const pageCountResult = await executeCommand(pageCountCommand, { timeout: 10000 });

      if (!pageCountResult.success) {
        throw new Error('Failed to get page count');
      }

      const pageCount = parseInt(pageCountResult.stdout.trim());

      // Split each page
      for (let i = 1; i <= pageCount; i++) {
        const outputFilename = generateUniqueFilename(`page_${i}.pdf`);
        const outputPath = getTempFilePath(outputFilename, 'outputs');

        const command = `"${config.tools.qpdf}" ${escapeShellArg(inputFile.path)} --pages . ${i} -- ${escapeShellArg(outputPath)}`;
        
        const result = await executeCommand(command, { timeout: 30000 });

        if (!result.success) {
          throw new Error(`Failed to extract page ${i}: ${result.error}`);
        }

        results.push({
          page: i,
          outputPath,
          outputFilename,
        });
      }
    } else if (pageRanges) {
      // Split by specified ranges
      const outputFilename = generateUniqueFilename('split.pdf');
      const outputPath = getTempFilePath(outputFilename, 'outputs');

      const command = `"${config.tools.qpdf}" ${escapeShellArg(inputFile.path)} --pages . ${pageRanges} -- ${escapeShellArg(outputPath)}`;
      
      const result = await executeCommand(command, { timeout: 30000 });

      if (!result.success) {
        throw new Error(`PDF split failed: ${result.error}`);
      }

      results.push({
        range: pageRanges,
        outputPath,
        outputFilename,
      });
    } else {
      throw new Error('Invalid split mode or missing page ranges');
    }

    return {
      success: true,
      mode,
      results,
    };
  } catch (error) {
    console.error('Split PDF error:', error);
    throw error;
  }
}

/**
 * Compress PDF file
 * Uses Ghostscript with different compression profiles
 */
export async function compressPDF(inputFile, options = {}) {
  try {
    // Validate input is a PDF
    await validatePDF(inputFile.path);

    const {
      quality = 'ebook', // 'screen', 'ebook', 'printer', 'prepress'
    } = options;

    // Map quality to Ghostscript settings
    const qualityMap = {
      screen: '/screen',     // 72 DPI, lowest quality
      ebook: '/ebook',       // 150 DPI, medium quality
      printer: '/printer',   // 300 DPI, high quality
      prepress: '/prepress', // 300 DPI, color preserving
    };

    const gsQuality = qualityMap[quality] || '/ebook';

    // Generate output filename
    const outputFilename = generateUniqueFilename('compressed.pdf');
    const outputPath = getTempFilePath(outputFilename, 'outputs');

    // Build Ghostscript command
    // gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile=output.pdf input.pdf
    const command = `"${config.tools.ghostscript}" -sDEVICE=pdfwrite -dPDFSETTINGS=${gsQuality} -dNOPAUSE -dBATCH -dQUIET -sOutputFile=${escapeShellArg(outputPath)} ${escapeShellArg(inputFile.path)}`;

    console.log('Executing compress command:', command);

    // Execute command (compression can take longer)
    const result = await executeCommand(command, { timeout: 120000 }); // 120s timeout

    if (!result.success) {
      throw new Error(`PDF compression failed: ${result.error}`);
    }

    return {
      success: true,
      outputPath,
      outputFilename,
      quality,
    };
  } catch (error) {
    console.error('Compress PDF error:', error);
    throw error;
  }
}
