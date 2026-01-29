import express from 'express';
import cors from 'cors';
import config from './config.js';
import pdfRoutes from './routes/pdfRoutes.js';
import conversionRoutes from './routes/conversionRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { handleMulterError } from './middleware/upload.js';
import { ensureDirectories, startPeriodicCleanup } from './utils/fileUtils.js';
import { validateTools } from './utils/execUtils.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/convert', conversionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(handleMulterError);
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize server
async function initializeServer() {
  try {
    // Ensure directories exist
    await ensureDirectories();
    console.log('✓ Directories initialized');

    // Validate conversion tools
    console.log('Checking conversion tools...');
    const toolStatus = await validateTools(config.tools);
    
    console.log('Tool availability:');
    Object.entries(toolStatus).forEach(([tool, available]) => {
      console.log(`  ${tool}: ${available ? '✓' : '✗'}`);
    });

    // Warn about missing tools
    const missingTools = Object.entries(toolStatus)
      .filter(([_, available]) => !available)
      .map(([tool]) => tool);

    if (missingTools.length > 0) {
      console.warn(`\n⚠️  Warning: The following tools are not available: ${missingTools.join(', ')}`);
      console.warn('Some conversion features may not work properly.');
      console.warn('Install missing tools using Homebrew:\n');
      
      const installCommands = {
        qpdf: 'brew install qpdf',
        ghostscript: 'brew install ghostscript',
        libreoffice: 'brew install --cask libreoffice',
        poppler: 'brew install poppler',
        imagemagick: 'brew install imagemagick',
        tesseract: 'brew install tesseract',
      };
      
      missingTools.forEach(tool => {
        if (installCommands[tool]) {
          console.warn(`  ${installCommands[tool]}`);
        }
      });
      console.warn('');
    }

    // Start periodic cleanup
    startPeriodicCleanup(30); // Clean up every 30 minutes

    // Start server
    app.listen(config.port, () => {
      console.log(`\n🚀 Server running on port ${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Max file size: ${(config.maxFileSize / (1024 * 1024)).toFixed(2)}MB`);
      console.log(`\n📡 API Endpoints:`);
      console.log(`   POST http://localhost:${config.port}/api/pdf/merge`);
      console.log(`   POST http://localhost:${config.port}/api/pdf/split`);
      console.log(`   POST http://localhost:${config.port}/api/pdf/compress`);
      console.log(`   POST http://localhost:${config.port}/api/convert/pdf-to-word`);
      console.log(`   POST http://localhost:${config.port}/api/convert/pdf-to-powerpoint`);
      console.log(`   POST http://localhost:${config.port}/api/convert/pdf-to-excel`);
      console.log(`   GET  http://localhost:${config.port}/api/pdf/health`);
      console.log(`   GET  http://localhost:${config.port}/health\n`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Start the server
initializeServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
