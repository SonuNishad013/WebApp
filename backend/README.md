# PDF Conversion Backend

Backend service for PDF & Office document conversion web application.

## Part 1 Implementation

This implementation covers the following services:
1. **Merge PDF** - Combine multiple PDF files into one
2. **Split PDF** - Extract pages or ranges from a PDF
3. **Compress PDF** - Reduce PDF file size

## Prerequisites

### Required Tools (macOS)

Install the following tools using Homebrew:

```bash
# qpdf - for PDF merging and splitting
brew install qpdf

# Ghostscript - for PDF compression
brew install ghostscript
```

### Node.js

- Node.js 18+ recommended
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` if needed (default paths should work for Homebrew installations)

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Health Check
```
GET /health
GET /api/pdf/health
```

### Merge PDFs
```
POST /api/pdf/merge
Content-Type: multipart/form-data

Body:
- files: Array of PDF files (minimum 2)
```

**Example using curl:**
```bash
curl -X POST http://localhost:5000/api/pdf/merge \
  -F "files=@file1.pdf" \
  -F "files=@file2.pdf" \
  -F "files=@file3.pdf" \
  --output merged.pdf
```

### Split PDF
```
POST /api/pdf/split
Content-Type: multipart/form-data

Body:
- file: PDF file to split
- mode: 'individual' (split each page) or 'range' (extract specific pages)
- pageRanges: e.g., '1-3' or '1,3,5' (required for range mode)
```

**Example - Split into individual pages:**
```bash
curl -X POST http://localhost:5000/api/pdf/split \
  -F "file=@document.pdf" \
  -F "mode=individual"
```

**Example - Extract specific pages:**
```bash
curl -X POST http://localhost:5000/api/pdf/split \
  -F "file=@document.pdf" \
  -F "mode=range" \
  -F "pageRanges=1-3" \
  --output pages_1-3.pdf
```

### Compress PDF
```
POST /api/pdf/compress
Content-Type: multipart/form-data

Body:
- file: PDF file to compress
- quality: 'screen' | 'ebook' | 'printer' | 'prepress' (default: 'ebook')
```

**Quality levels:**
- `screen`: 72 DPI, lowest quality, smallest size
- `ebook`: 150 DPI, medium quality (default)
- `printer`: 300 DPI, high quality
- `prepress`: 300 DPI, color preserving, largest size

**Example:**
```bash
curl -X POST http://localhost:5000/api/pdf/compress \
  -F "file=@large.pdf" \
  -F "quality=ebook" \
  --output compressed.pdf
```

## Architecture

```
backend/
├── src/
│   ├── config.js              # Configuration management
│   ├── server.js              # Main server file
│   ├── middleware/
│   │   ├── upload.js          # File upload middleware (multer)
│   │   └── errorHandler.js   # Error handling middleware
│   ├── routes/
│   │   └── pdfRoutes.js       # PDF service routes
│   ├── services/
│   │   └── pdfService.js      # PDF conversion logic
│   └── utils/
│       ├── fileUtils.js       # File management utilities
│       ├── validation.js      # File validation utilities
│       └── execUtils.js       # Command execution utilities
├── temp/                      # Temporary file storage (auto-created)
│   ├── uploads/               # Uploaded files
│   └── outputs/               # Converted files
├── package.json
└── .env                       # Environment configuration
```

## Security Features

- File type validation (extension + MIME type)
- File size limits (default: 10MB)
- Automatic file cleanup (default: 1 hour TTL)
- Command injection prevention
- Sandboxed temporary directories

## Performance Optimization

- Efficient command-line tool execution
- Automatic cleanup of temporary files
- Timeout protection (30-120s depending on operation)
- Streaming file downloads

## Error Handling

All endpoints return JSON responses with the following structure:

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Troubleshooting

### Tool not found errors

If you see errors about missing tools, verify installation:

```bash
which qpdf
which gs
```

Update the paths in `.env` if your tools are installed in different locations.

### Permission errors

Ensure the temp directories have write permissions:

```bash
chmod -R 755 temp/
```

### Large file processing

For large files, you may need to increase timeout values in `src/services/pdfService.js`.

## Next Steps

Part 2 will add:
- PDF to Word conversion
- PDF to PowerPoint conversion
- PDF to Excel conversion
