import express from 'express';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { pdfToWord, pdfToPowerPoint, pdfToExcel, wordToPDF, powerPointToPDF, excelToPDF } from '../services/conversionService.js';
import { deleteFiles } from '../utils/fileUtils.js';
import fs from 'fs';

const router = express.Router();

/**
 * Part 2 & Part 3 Routes:
 * Part 2: PDF to Office Format Conversions
 * Part 3: Office to PDF Conversions
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

/**
 * Part 3 Routes: Office to PDF Conversions
 */

/**
 * POST /api/convert/word-to-pdf
 * Convert Word (DOCX) to PDF
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: DOCX file (required)
 * 
 * Response:
 * - application/pdf (PDF file)
 * - OR JSON error
 */
router.post('/word-to-pdf', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('Word to PDF conversion requested:', req.file.originalname);

    // Perform conversion
    const result = await wordToPDF(req.file);

    // Stream file to client
    const fileStream = fs.createReadStream(result.outputPath);

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    // Stream file and cleanup after
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('Word to PDF conversion completed, cleaning up...');
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
 * POST /api/convert/powerpoint-to-pdf
 * Convert PowerPoint (PPTX) to PDF
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: PPTX file (required)
 * 
 * Response:
 * - application/pdf (PDF file)
 * - OR JSON error
 */
router.post('/powerpoint-to-pdf', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('PowerPoint to PDF conversion requested:', req.file.originalname);

    // Perform conversion
    const result = await powerPointToPDF(req.file);

    // Stream file to client
    const fileStream = fs.createReadStream(result.outputPath);

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    // Stream file and cleanup after
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('PowerPoint to PDF conversion completed, cleaning up...');
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
 * POST /api/convert/excel-to-pdf
 * Convert Excel (XLSX) to PDF
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: XLSX file (required)
 * 
 * Response:
 * - application/pdf (PDF file)
 * - OR JSON error
 */
router.post('/excel-to-pdf', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('Excel to PDF conversion requested:', req.file.originalname);

    // Perform conversion
    const result = await excelToPDF(req.file);

    // Stream file to client
    const fileStream = fs.createReadStream(result.outputPath);

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    // Stream file and cleanup after
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('Excel to PDF conversion completed, cleaning up...');
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
