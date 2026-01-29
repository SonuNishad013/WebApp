# PDF & Office Conversion Web Application

A production-grade, scalable web application for PDF manipulation and Office document conversion with a futuristic UI.

## Project Status

✅ **Part 1 Complete** - Merge, Split, Compress PDF  
⏳ Part 2 Pending - PDF to Word, PPT, Excel  
⏳ Part 3 Pending - Word, PPT, Excel to PDF  
⏳ Part 4 Pending - Edit PDF, PDF ↔ JPG  
⏳ Part 5 Pending - Sign PDF, Watermark, TXT to PDF

## Quick Start

### Prerequisites

1. **Node.js 18+**
2. **Homebrew** (for macOS tools)
3. **Required conversion tools:**

```bash
# Install PDF processing tools
brew install qpdf ghostscript

# For future parts, also install:
brew install --cask libreoffice
brew install poppler imagemagick tesseract
```

### Installation

1. **Clone and navigate to project:**
```bash
cd /Users/apple/Documents/WebApp
```

2. **Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env
```

3. **Setup Frontend:**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

2. **Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

3. **Open browser:**
```
http://localhost:3000
```

## Part 1 Features

### 1. Merge PDF
- Combine 2+ PDF files into one
- Lossless merge using qpdf
- Preserves bookmarks and metadata

### 2. Split PDF
- Extract individual pages
- Extract page ranges (e.g., 1-3)
- Fast page-level operations

### 3. Compress PDF
- 4 quality presets:
  - Screen (72 DPI) - Smallest
  - Ebook (150 DPI) - Balanced
  - Printer (300 DPI) - High quality
  - Prepress (300 DPI) - Color preserving
- Uses Ghostscript compression

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  • Futuristic UI with animations                        │
│  • Drag & drop file upload                              │
│  • Real-time progress tracking                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTP/REST API
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   Node.js Backend                        │
│  • Express server                                        │
│  • Multer file upload                                   │
│  • Input validation                                      │
└─────────────────────┬───────────────────────────────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
┌──────────▼─────────┐  ┌───────▼────────┐
│   qpdf (Merge,     │  │  Ghostscript   │
│   Split)           │  │  (Compress)    │
└────────────────────┘  └────────────────┘
```

## Technology Stack

### Backend
- **Node.js** with ES modules
- **Express** for REST API
- **Multer** for file uploads
- **qpdf** for PDF merge/split
- **Ghostscript** for PDF compression

### Frontend
- **React 18** with Hooks
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **React Dropzone** for file uploads

## Project Structure

```
WebApp/
├── backend/
│   ├── src/
│   │   ├── config.js              # Configuration
│   │   ├── server.js              # Main server
│   │   ├── middleware/            # Express middleware
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   └── utils/                 # Utilities
│   ├── temp/                      # Temporary files
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── services/              # API client
│   │   ├── utils/                 # Helpers
│   │   ├── App.jsx                # Main component
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── [Documentation files]
```

## API Endpoints

### Part 1 (Implemented)

```
POST /api/pdf/merge
  - Body: multipart/form-data with 'files' array
  - Returns: Merged PDF file

POST /api/pdf/split
  - Body: multipart/form-data with 'file' and mode/pageRanges
  - Returns: Split PDF file(s)

POST /api/pdf/compress
  - Body: multipart/form-data with 'file' and quality
  - Returns: Compressed PDF file

GET /api/pdf/health
  - Returns: Service health status
```

## Security Features

- File type validation (extension + MIME type)
- File size limits (10MB default)
- Automatic cleanup (1 hour TTL)
- Command injection prevention
- Sandboxed temp directories
- Error handling and logging

## Performance

- Efficient command-line tool execution
- Streaming file downloads
- Timeout protection (30-120s)
- Periodic cleanup of temp files
- Optimized file operations

## Development Guidelines

### Adding New Features

1. Update appropriate part service document
2. Implement backend service in `backend/src/services/`
3. Add route in `backend/src/routes/`
4. Create frontend component in `frontend/src/components/`
5. Update App.jsx to include new feature
6. Test thoroughly
7. Update completion report

### Code Style

- ES modules (import/export)
- Async/await for promises
- Descriptive variable names
- JSDoc comments for functions
- Error handling in try-catch blocks

## Troubleshooting

### Backend Issues

**Tools not found:**
```bash
# Check tool availability
which qpdf
which gs

# Install if missing
brew install qpdf ghostscript
```

**Permission errors:**
```bash
chmod -R 755 backend/temp/
```

### Frontend Issues

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
```

## Future Roadmap

### Part 2 (Next)
- PDF to Word
- PDF to PowerPoint
- PDF to Excel

### Part 3
- Word to PDF
- PowerPoint to PDF
- Excel to PDF

### Part 4
- Edit PDF
- PDF to JPG
- JPG to PDF

### Part 5
- Sign PDF
- Watermark PDF
- TXT to PDF

### Future Enhancements
- Queue-based processing (Bull + Redis)
- User authentication
- Cloud storage integration
- Batch processing
- API rate limiting
- Webhook notifications

## Contributing

See individual completion reports for implementation details of each part.

## License

This project is for educational/demonstration purposes.

## Support

For issues or questions, refer to:
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Part completion reports in project root
# WebApp
