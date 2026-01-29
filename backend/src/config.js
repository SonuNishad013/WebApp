import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  uploadDir: path.resolve(__dirname, '../../temp/uploads'),
  outputDir: path.resolve(__dirname, '../../temp/outputs'),
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },

  // Security
  fileTTL: parseInt(process.env.FILE_TTL) || 3600, // 1 hour
  allowedExtensions: (process.env.ALLOWED_EXTENSIONS || '.pdf,.docx,.pptx,.xlsx,.txt,.jpg,.jpeg,.png')
    .split(',')
    .map(ext => ext.trim()),

  // Conversion Tools
  tools: {
    qpdf: process.env.QPDF_PATH || '/opt/homebrew/bin/qpdf',
    ghostscript: process.env.GHOSTSCRIPT_PATH || '/opt/homebrew/bin/gs',
    libreoffice: process.env.LIBREOFFICE_PATH || '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    poppler: process.env.POPPLER_PATH || '/opt/homebrew/bin/pdftoppm',
    imagemagick: process.env.IMAGEMAGICK_PATH || '/opt/homebrew/bin/magick',
    tesseract: process.env.TESSERACT_PATH || '/opt/homebrew/bin/tesseract',
  },
};

export default config;
