import express from 'express';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { pdfToWord, pdfToPowerPoint, pdfToExcel } from '../services/conversionService.js';
import { deleteFiles } from '../utils/fileUtils.js';
import fs from 'fs';

const router = express.Router();

/**
 * Part 2 Routes: PDF to Office Format Conversions
 */

/**
 * POST /api/convert/pdf-to-word
 * Convert PDF to Word (DOCX)
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: PDF file (required)
 * - ocrEnabled: boolean (optional, default: false)
 * 
 * Response:
 * - application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX file)
 * - OR JSON error
 */
router.post('/pdf-to-word', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('PDF to Word conversion requested:', req.file.originalname);

    // Extract options from request body
    const options = {
      ocrEnabled: req.body.ocrEnabled === 'true',
    };

    // Perform conversion
    const result = await pdfToWord(req.file, options);

    // Stream file to client
    const fileStream = fs.createReadStream(result.outputPath);

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    // Stream file and cleanup after
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('PDF to Word conversion completed, cleaning up...');
      await deleteFiles([req.file.path, result.outputPath]);
    });

    fileStream.on('error', async (error) => {
      console.error('Stream error:', error);
      await deleteFiles([req.file.path, result.outputPath]);
    });

  } catch (error) {
    // Cleanup on error
    await deleteFiles([req.file.path]);
    throw error;
  }
}));

/**
 * POST /api/convert/pdf-to-powerpoint
 * Convert PDF to PowerPoint (PPTX)
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: PDF file (required)
 * 
 * Response:
 * - application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX file)
 * - OR JSON error
 */
router.post('/pdf-to-powerpoint', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('PDF to PowerPoint conversion requested:', req.file.originalname);

    // Perform conversion
    const result = await pdfToPowerPoint(req.file);

    // Stream file to client
    const fileStream = fs.createReadStream(result.outputPath);

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    // Stream file and cleanup after
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('PDF to PowerPoint conversion completed, cleaning up...');
      await deleteFiles([req.file.path, result.outputPath]);
    });

    fileStream.on('error', async (error) => {
      console.error('Stream error:', error);
      await deleteFiles([req.file.path, result.outputPath]);
    });

  } catch (error) {
    // Cleanup on error
    await deleteFiles([req.file.path]);
    throw error;
  }
}));

/**
 * POST /api/convert/pdf-to-excel
 * Convert PDF to Excel (XLSX)
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: PDF file (required)
 * - useTabula: boolean (optional, default: false)
 * 
 * Response:
 * - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (XLSX file)
 * - OR JSON error
 */
router.post('/pdf-to-excel', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('PDF to Excel conversion requested:', req.file.originalname);

    // Extract options from request body
    const options = {
      useTabula: req.body.useTabula === 'true',
    };

    // Perform conversion
    const result = await pdfToExcel(req.file, options);

    // Stream file to client
    const fileStream = fs.createReadStream(result.outputPath);

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    // Stream file and cleanup after
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('PDF to Excel conversion completed, cleaning up...');
      await deleteFiles([req.file.path, result.outputPath]);
    });

    fileStream.on('error', async (error) => {
      console.error('Stream error:', error);
      await deleteFiles([req.file.path, result.outputPath]);
    });

  } catch (error) {
    // Cleanup on error
    await deleteFiles([req.file.path]);
    throw error;
  }
}));

export default router;
