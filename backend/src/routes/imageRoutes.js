import express from 'express';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { pdfToJPG, imageToPDF, editPDF } from '../services/imageService.js';
import { deleteFiles } from '../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const router = express.Router();

/**
 * Part 4 Routes: Image & Editing Services
 * - Edit PDF
 * - PDF to JPG
 * - JPG to PDF
 */

/**
 * POST /api/image/pdf-to-jpg
 * Convert PDF to JPG images (one per page)
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: PDF file (required)
 * - dpi: number (optional, default: 150)
 * - quality: number 1-100 (optional, default: 90)
 * 
 * Response:
 * - application/zip (ZIP file containing all JPG images)
 * - OR application/jpeg (single JPG if PDF has only one page)
 * - OR JSON error
 */
router.post('/pdf-to-jpg', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('PDF to JPG conversion requested:', req.file.originalname);

    // Extract options from request body
    const options = {
      dpi: parseInt(req.body.dpi) || 150,
      quality: parseInt(req.body.quality) || 90,
      format: 'jpeg',
    };

    // Perform conversion
    const result = await pdfToJPG(req.file, options);

    // If single page, send single JPG
    if (result.outputFiles.length === 1) {
      const outputFile = result.outputFiles[0];
      const fileStream = fs.createReadStream(outputFile.path);

      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${outputFile.filename}"`);

      fileStream.pipe(res);

      fileStream.on('end', async () => {
        console.log('PDF to JPG conversion completed (single page), cleaning up...');
        await deleteFiles([req.file.path, ...result.outputFiles.map(f => f.path)]);
      });

      fileStream.on('error', async (error) => {
        console.error('Stream error:', error);
        await deleteFiles([req.file.path, ...result.outputFiles.map(f => f.path)]);
      });
    } else {
      // Multiple pages - create ZIP archive
      const zipFilename = path.basename(req.file.originalname, '.pdf') + '_images.zip';
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', async (err) => {
        console.error('Archive error:', err);
        await deleteFiles([req.file.path, ...result.outputFiles.map(f => f.path)]);
        throw err;
      });

      archive.on('end', async () => {
        console.log('PDF to JPG conversion completed (multiple pages), cleaning up...');
        await deleteFiles([req.file.path, ...result.outputFiles.map(f => f.path)]);
      });

      archive.pipe(res);

      // Add all JPG files to archive
      result.outputFiles.forEach(file => {
        archive.file(file.path, { name: file.filename });
      });

      await archive.finalize();
    }

  } catch (error) {
    // Cleanup on error
    await deleteFiles([req.file.path]);
    throw error;
  }
}));

/**
 * POST /api/image/jpg-to-pdf
 * Convert image(s) to PDF (JPG, JPEG, PNG, WebP)
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - files: Image files (required, one or more - supports JPG, JPEG, PNG, WebP)
 * - pageSize: string (optional, default: 'letter')
 * - quality: number 1-100 (optional, default: 85)
 * - autoRotate: boolean (optional, default: true)
 * 
 * Response:
 * - application/pdf (PDF file)
 * - OR JSON error
 */
router.post('/jpg-to-pdf', upload.array('files', 50), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded',
    });
  }

  try {
    console.log(`Image to PDF conversion requested: ${req.files.length} file(s)`);

    // Extract options from request body
    const options = {
      pageSize: req.body.pageSize || 'letter',
      quality: parseInt(req.body.quality) || 85,
      autoRotate: req.body.autoRotate !== 'false', // Default true
    };

    // Perform conversion
    const result = await imageToPDF(req.files, options);

    // Stream file to client
    const fileStream = fs.createReadStream(result.outputPath);

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    // Stream file and cleanup after
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('Image to PDF conversion completed, cleaning up...');
      await deleteFiles([...req.files.map(f => f.path), result.outputPath]);
    });

    fileStream.on('error', async (error) => {
      console.error('Stream error:', error);
      await deleteFiles([...req.files.map(f => f.path), result.outputPath]);
    });

  } catch (error) {
    // Cleanup on error
    await deleteFiles(req.files.map(f => f.path));
    throw error;
  }
}));

/**
 * POST /api/image/edit-pdf
 * Edit PDF (rotate, remove pages, decrypt)
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: PDF file (required)
 * - operation: string (required: 'rotate', 'remove-pages', 'decrypt')
 * - pages: string (optional, page numbers/ranges like '1-3,5')
 * - angle: number (optional, for rotate: 90, 180, 270)
 * - password: string (optional, for decrypt)
 * 
 * Response:
 * - application/pdf (edited PDF file)
 * - OR JSON error
 */
router.post('/edit-pdf', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('PDF edit requested:', req.file.originalname);

    // Extract edit parameters from request body
    const edits = {
      operation: req.body.operation || 'rotate',
      pages: req.body.pages || null,
      angle: parseInt(req.body.angle) || 90,
      password: req.body.password || null,
    };

    // Validate operation
    const validOperations = ['rotate', 'remove-pages', 'decrypt'];
    if (!validOperations.includes(edits.operation)) {
      return res.status(400).json({
        success: false,
        error: `Invalid operation. Must be one of: ${validOperations.join(', ')}`,
      });
    }

    // Perform edit
    const result = await editPDF(req.file, edits);

    // Stream file to client
    const fileStream = fs.createReadStream(result.outputPath);

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    // Stream file and cleanup after
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('PDF edit completed, cleaning up...');
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
