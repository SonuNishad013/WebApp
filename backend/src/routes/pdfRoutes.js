import express from 'express';
import { uploadMultiple, uploadSingle } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { mergePDFs, splitPDF, compressPDF } from '../services/pdfService.js';
import { deleteFiles } from '../utils/fileUtils.js';
import path from 'path';

const router = express.Router();

/**
 * POST /api/pdf/merge
 * Merge multiple PDF files into one
 */
router.post('/merge', uploadMultiple, asyncHandler(async (req, res) => {
  const inputFiles = req.files;

  if (!inputFiles || inputFiles.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'At least 2 PDF files are required for merging',
    });
  }

  try {
    const result = await mergePDFs(inputFiles);

    // Send the merged PDF
    res.download(result.outputPath, result.outputFilename, (err) => {
      // Cleanup after download
      const filesToDelete = inputFiles.map(f => f.path);
      filesToDelete.push(result.outputPath);
      deleteFiles(filesToDelete);

      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    // Cleanup on error
    const filesToDelete = inputFiles.map(f => f.path);
    deleteFiles(filesToDelete);
    throw error;
  }
}));

/**
 * POST /api/pdf/split
 * Split PDF into separate pages or ranges
 * Body: { mode: 'individual' | 'range', pageRanges: '1-3,5-7' (for range mode) }
 */
router.post('/split', uploadSingle, asyncHandler(async (req, res) => {
  const inputFile = req.file;

  if (!inputFile) {
    return res.status(400).json({
      success: false,
      error: 'PDF file is required',
    });
  }

  const { mode = 'individual', pageRanges } = req.body;

  try {
    const result = await splitPDF(inputFile, { mode, pageRanges });

    if (result.results.length === 1) {
      // Single output file - send directly
      const output = result.results[0];
      res.download(output.outputPath, output.outputFilename, (err) => {
        // Cleanup
        deleteFiles([inputFile.path, output.outputPath]);
        if (err) console.error('Download error:', err);
      });
    } else {
      // Multiple output files - send as JSON with file info
      // In a production system, you'd want to create a ZIP file here
      res.json({
        success: true,
        message: 'PDF split successfully',
        files: result.results.map(r => ({
          filename: r.outputFilename,
          page: r.page,
          range: r.range,
        })),
      });

      // Cleanup after response
      const filesToDelete = [inputFile.path, ...result.results.map(r => r.outputPath)];
      setTimeout(() => deleteFiles(filesToDelete), 5000);
    }
  } catch (error) {
    // Cleanup on error
    deleteFiles([inputFile.path]);
    throw error;
  }
}));

/**
 * POST /api/pdf/compress
 * Compress PDF file
 * Body: { quality: 'screen' | 'ebook' | 'printer' | 'prepress' }
 */
router.post('/compress', uploadSingle, asyncHandler(async (req, res) => {
  const inputFile = req.file;

  if (!inputFile) {
    return res.status(400).json({
      success: false,
      error: 'PDF file is required',
    });
  }

  const { quality = 'ebook' } = req.body;

  try {
    const result = await compressPDF(inputFile, { quality });

    // Send the compressed PDF
    res.download(result.outputPath, result.outputFilename, (err) => {
      // Cleanup after download
      deleteFiles([inputFile.path, result.outputPath]);
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    // Cleanup on error
    deleteFiles([inputFile.path]);
    throw error;
  }
}));

/**
 * GET /api/pdf/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PDF service is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
