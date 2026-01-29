# Part 1 Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│                   localhost:3000                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React Frontend (Vite)                      │  │
│  │  ┌────────┐  ┌────────┐  ┌────────────┐           │  │
│  │  │ Merge  │  │ Split  │  │ Compress   │           │  │
│  │  │  PDF   │  │  PDF   │  │    PDF     │           │  │
│  │  └────────┘  └────────┘  └────────────┘           │  │
│  │                                                      │  │
│  │  • Drag & Drop Upload                               │  │
│  │  • Futuristic UI                                    │  │
│  │  • Real-time Progress                               │  │
│  │  • Animations                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP REST API
                        │ (Axios)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Node.js Backend Server                         │
│                 localhost:5000                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Express REST API                            │  │
│  │                                                      │  │
│  │  Routes: /api/pdf/merge                             │  │
│  │          /api/pdf/split                             │  │
│  │          /api/pdf/compress                          │  │
│  │                                                      │  │
│  │  Middleware:                                         │  │
│  │    • Multer (file upload)                           │  │
│  │    • CORS                                            │  │
│  │    • Error handling                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Services Layer                              │  │
│  │                                                      │  │
│  │  pdfService.js:                                      │  │
│  │    • mergePDFs()                                     │  │
│  │    • splitPDF()                                      │  │
│  │    • compressPDF()                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Utilities                                   │  │
│  │                                                      │  │
│  │  • File validation                                   │  │
│  │  • Command execution                                 │  │
│  │  • Cleanup management                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Temporary Storage                           │  │
│  │                                                      │  │
│  │  temp/uploads/   - Incoming files                    │  │
│  │  temp/outputs/   - Processed files                   │  │
│  │                                                      │  │
│  │  Auto-cleanup: 1 hour TTL                           │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
┌───────▼────────┐              ┌────────▼─────────┐
│     qpdf       │              │  Ghostscript     │
│                │              │                  │
│ • Merge PDFs   │              │ • Compress PDF   │
│ • Split PDFs   │              │ • Image downsamp │
│ • Lossless     │              │ • Quality presets│
└────────────────┘              └──────────────────┘
```

## Request Flow Diagram

### Merge PDF Flow

```
1. User drags 3 PDF files into browser
   ↓
2. Frontend validates files (type, size)
   ↓
3. POST /api/pdf/merge with multipart/form-data
   ↓
4. Backend: Multer saves files to temp/uploads/
   ↓
5. Backend: Validates PDFs (MIME type)
   ↓
6. Backend: Calls qpdf command
   qpdf --empty --pages file1.pdf file2.pdf file3.pdf -- merged.pdf
   ↓
7. Backend: Saves result to temp/outputs/
   ↓
8. Backend: Streams merged.pdf to client
   ↓
9. Frontend: Triggers browser download
   ↓
10. Backend: Cleans up temp files after download
```

### Split PDF Flow

```
1. User uploads 1 PDF file
   ↓
2. User selects mode: "Extract pages 1-3"
   ↓
3. POST /api/pdf/split with file + pageRanges
   ↓
4. Backend: Saves file to temp/uploads/
   ↓
5. Backend: Validates PDF
   ↓
6. Backend: Calls qpdf command
   qpdf input.pdf --pages . 1-3 -- output.pdf
   ↓
7. Backend: Saves result to temp/outputs/
   ↓
8. Backend: Streams output.pdf to client
   ↓
9. Frontend: Triggers browser download
   ↓
10. Backend: Cleans up temp files
```

### Compress PDF Flow

```
1. User uploads 1 PDF file
   ↓
2. User selects quality: "ebook" (150 DPI)
   ↓
3. POST /api/pdf/compress with file + quality
   ↓
4. Backend: Saves file to temp/uploads/
   ↓
5. Backend: Validates PDF
   ↓
6. Backend: Calls Ghostscript command
   gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook ... -sOutputFile=compressed.pdf input.pdf
   ↓
7. Backend: Saves result to temp/outputs/
   ↓
8. Backend: Streams compressed.pdf to client
   ↓
9. Frontend: Triggers browser download
   ↓
10. Backend: Cleans up temp files
```

## File Lifecycle

```
Upload
  ↓
  temp/uploads/abc123-original.pdf
  │
  │ [Processing]
  │
  ↓
  temp/outputs/xyz789-result.pdf
  │
  │ [Download to user]
  │
  ↓
  [Both files deleted after download]
  OR
  [Auto-cleanup after 1 hour if not downloaded]
```

## Security Layers

```
┌─────────────────────────────────────────┐
│  1. Frontend Validation                 │
│     • File type check                   │
│     • Size check                        │
│     • User feedback                     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  2. Multer Middleware                   │
│     • File filter                       │
│     • Size limit enforcement            │
│     • Sanitized storage                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  3. Backend Validation                  │
│     • Extension validation              │
│     • MIME type verification            │
│     • File size re-check                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  4. Command Execution Security          │
│     • Argument escaping                 │
│     • Timeout protection                │
│     • Error handling                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  5. File System Security                │
│     • UUID filenames                    │
│     • Isolated directories              │
│     • TTL cleanup                       │
└─────────────────────────────────────────┘
```

## Component Hierarchy (Frontend)

```
App.jsx
├── Header (with animated logo)
├── Tab Navigation
│   ├── Merge Tab Button
│   ├── Split Tab Button
│   └── Compress Tab Button
│
└── Content Area (AnimatePresence)
    │
    ├── MergePDF Component
    │   ├── FileUpload (multiple)
    │   ├── File List
    │   ├── Action Button
    │   └── Progress Bar
    │
    ├── SplitPDF Component
    │   ├── FileUpload (single)
    │   ├── Mode Selection
    │   ├── Page Range Input
    │   ├── Action Button
    │   └── Progress Bar
    │
    └── CompressPDF Component
        ├── FileUpload (single)
        ├── Quality Selection
        ├── Action Button
        └── Progress Bar
```

## Color Scheme

```
Background
  ↓
  #0a0a0f (dark-bg)
    ↓
    Surface Elements
      ↓
      #151520 (dark-surface)
        ↓
        Borders
          ↓
          #2a2a3e (dark-border)
            ↓
            Accents
              ↓
              #00f0ff (cyber-blue)
              #b000ff (cyber-purple)
              #ff006e (cyber-pink)
```

## Animation Timeline

```
Page Load
  ↓
  [0ms] Header fades in (opacity 0 → 1)
  ↓
  [100ms] Tab navigation slides up
  ↓
  [200ms] Content area fades in
  ↓
  [300ms] Background gradients start pulsing

Tab Switch
  ↓
  [0ms] Old content fades out & slides left
  ↓
  [150ms] New content fades in & slides from right
  ↓
  [300ms] Smooth transition complete

File Upload
  ↓
  [0ms] File appears in list
  ↓
  [50ms] Fade in animation
  ↓
  [100ms] Slide from left
  ↓
  [200ms] Hover state ready

Processing
  ↓
  [0ms] Button shows loader icon
  ↓
  [100ms] Progress bar appears
  ↓
  [continuous] Progress fills left to right
  ↓
  [completion] Success checkmark appears
  ↓
  [+3000ms] UI resets
```

## Error Handling Flow

```
Error Occurs
  ↓
  ┌─────────────────────┐
  │  Frontend Catches   │
  │   • Network error   │
  │   • Timeout         │
  │   • Server error    │
  └─────────┬───────────┘
            │
  ┌─────────▼───────────┐
  │  Display to User    │
  │   • Error message   │
  │   • Red styling     │
  │   • Retry option    │
  └─────────┬───────────┘
            │
  ┌─────────▼───────────┐
  │  Log to Console     │
  │   • Full error      │
  │   • Stack trace     │
  │   • Context         │
  └─────────────────────┘
```

## Development Workflow

```
1. Write code
   ↓
2. Backend: npm run dev (auto-restart)
   ↓
3. Frontend: npm run dev (hot reload)
   ↓
4. Test in browser (localhost:3000)
   ↓
5. Check backend logs
   ↓
6. Iterate
   ↓
7. Build for production: npm run build
```

## Production Deployment (Future)

```
Current (Local)
  ↓
  User → Frontend (Vite) → Backend (Express) → Tools
  
Future (Cloud)
  ↓
  User → CDN (Frontend) → Load Balancer
                              ↓
                           API Gateway
                              ↓
                         ┌────┴────┐
                         │         │
                      Queue    Worker Pool
                         │         │
                      (Redis)  (Auto-scaled)
                                  ↓
                              Tools + Storage
                              (S3-compatible)
```
