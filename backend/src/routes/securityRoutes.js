import express from 'express';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { signPDF, watermarkPDF, txtToPDF } from '../services/securityService.js';
import { deleteFiles } from '../utils/fileUtils.js';
import fs from 'fs';

const router = express.Router();

/**
 * Part 5 Routes: Security & Enhancement Services
 * - Sign PDF
 * - Watermark PDF
 * - TXT to PDF
 */

/**
 * POST /api/security/sign-pdf
 * Add digital signature to a PDF
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: PDF file (required)
 * - signerName: string (optional, default: 'Document Signer')
 * - reason: string (optional, default: 'Document approval')
 * - location: string (optional, default: 'Digital')
 * - contactInfo: string (optional)
 * 
 * Response:
 * - application/pdf (signed PDF file)
 * - OR JSON error
 */
router.post('/sign-pdf', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('Sign PDF requested:', req.file.originalname);

    // Extract options from request body
    const options = {
      signerName: req.body.signerName || 'Document Signer',
      reason: req.body.reason || 'Document approval',
      location: req.body.location || 'Digital',
      contactInfo: req.body.contactInfo || '',
    };

    // Perform signing
    const result = await signPDF(req.file, options);

    // Stream the signed PDF to the client
    const fileStream = fs.createReadStream(result.outputPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('Sign PDF completed, cleaning up...');
      await deleteFiles([req.file.path, result.outputPath]);
    });

    fileStream.on('error', async (error) => {
      console.error('Stream error:', error);
      await deleteFiles([req.file.path, result.outputPath]);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream signed PDF',
        });
      }
    });

  } catch (error) {
    console.error('Sign PDF error:', error);
    await deleteFiles([req.file.path]);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to sign PDF',
      });
    }
  }
}));

/**
 * POST /api/security/watermark-pdf
 * Add watermark to a PDF
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: PDF file (required)
 * - text: string (optional, default: 'CONFIDENTIAL')
 * - position: string (optional, default: 'center')
 * - opacity: number 0.1-1.0 (optional, default: 0.3)
 * - fontSize: number (optional, default: 48)
 * - angle: number (optional, default: 45)
 * - color: string (optional, default: 'gray')
 * 
 * Response:
 * - application/pdf (watermarked PDF file)
 * - OR JSON error
 */
router.post('/watermark-pdf', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('Watermark PDF requested:', req.file.originalname);

    // Extract options from request body
    const options = {
      text: req.body.text || 'CONFIDENTIAL',
      position: req.body.position || 'center',
      opacity: parseFloat(req.body.opacity) || 0.3,
      fontSize: parseInt(req.body.fontSize) || 48,
      angle: parseInt(req.body.angle) || 45,
      color: req.body.color || 'gray',
    };

    // Validate opacity range
    if (options.opacity < 0.1 || options.opacity > 1.0) {
      return res.status(400).json({
        success: false,
        error: 'Opacity must be between 0.1 and 1.0',
      });
    }

    // Perform watermarking
    const result = await watermarkPDF(req.file, options);

    // Stream the watermarked PDF to the client
    const fileStream = fs.createReadStream(result.outputPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('Watermark PDF completed, cleaning up...');
      await deleteFiles([req.file.path, result.outputPath]);
    });

    fileStream.on('error', async (error) => {
      console.error('Stream error:', error);
      await deleteFiles([req.file.path, result.outputPath]);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream watermarked PDF',
        });
      }
    });

  } catch (error) {
    console.error('Watermark PDF error:', error);
    await deleteFiles([req.file.path]);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to watermark PDF',
      });
    }
  }
}));

/**
 * POST /api/security/txt-to-pdf
 * Convert TXT file to PDF
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - file: TXT file (required)
 * - fontSize: number (optional, default: 12)
 * - fontFamily: string (optional, default: 'Courier New')
 * - lineSpacing: number (optional, default: 1.15)
 * - margin: number (optional, default: 1.0)
 * 
 * Response:
 * - application/pdf (converted PDF file)
 * - OR JSON error
 */
router.post('/txt-to-pdf', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  try {
    console.log('TXT to PDF conversion requested:', req.file.originalname);

    // Extract options from request body
    const options = {
      fontSize: parseInt(req.body.fontSize) || 12,
      fontFamily: req.body.fontFamily || 'Courier New',
      lineSpacing: parseFloat(req.body.lineSpacing) || 1.15,
      margin: parseFloat(req.body.margin) || 1.0,
    };

    // Perform conversion
    const result = await txtToPDF(req.file, options);

    // Stream the converted PDF to the client
    const fileStream = fs.createReadStream(result.outputPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputFilename}"`);

    fileStream.pipe(res);

    fileStream.on('end', async () => {
      console.log('TXT to PDF conversion completed, cleaning up...');
      await deleteFiles([req.file.path, result.outputPath]);
    });

    fileStream.on('error', async (error) => {
      console.error('Stream error:', error);
      await deleteFiles([req.file.path, result.outputPath]);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream converted PDF',
        });
      }
    });

  } catch (error) {
    console.error('TXT to PDF error:', error);
    await deleteFiles([req.file.path]);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to convert TXT to PDF',
      });
    }
  }
}));

export default router;
