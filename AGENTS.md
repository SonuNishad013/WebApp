# AGENTS.md - Development Guidelines for PDF Conversion Web Application

This document provides essential information for agentic coding agents working on this repository.

## Project Overview

A production-grade, scalable web application for PDF manipulation and Office document conversion with a futuristic UI. The application consists of:

- **Backend**: Node.js/Express API server with external tool integration
- **Frontend**: React 18 + Vite with Tailwind CSS and Framer Motion
- **E2E Tests**: Playwright testing suite
- **External Tools**: qpdf, Ghostscript, LibreOffice, Poppler, ImageMagick, OpenSSL

## Build/Test Commands

### Root Commands (E2E Testing)
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests headed
npm run test:headed

# Run specific part tests
npm run test:part1    # PDF processing (merge, split, compress)
npm run test:part2    # PDF to Office conversions
npm run test:part3    # Office to PDF conversions
npm run test:part4    # Image & editing services
npm run test:part5    # Security & enhancement services

# View test report
npm run test:report

# Run single test file
npx playwright test tests/part1/merge.spec.js
```

### Backend Commands
```bash
cd backend

# Development server (with nodemon)
npm run dev

# Production server
npm start

# (No unit tests configured - see E2E tests above)
```

### Frontend Commands
```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## Code Style Guidelines

### Import/Export Style
- **ES Modules only** - use `import/export` syntax
- Node.js backend and frontend both use `"type": "module"`
- Import order: 1) Node.js built-ins, 2) External packages, 3) Local modules
```javascript
// ✅ Correct
import path from 'path';
import express from 'express';
import { pdfService } from '../services/pdfService.js';

// ❌ Wrong - no CommonJS
const express = require('express');
```

### Backend Conventions
- **File naming**: `camelCase.js` (e.g., `pdfService.js`, `fileUtils.js`)
- **Function naming**: `camelCase`
- **Error handling**: Always use try-catch with descriptive error messages
- **Command execution**: Use `executeCommand()` utility with proper shell escaping
- **File operations**: Use async/await consistently
- **Validation**: Validate file extensions, MIME types, and sizes

```javascript
// ✅ Correct pattern
export async function processFile(file) {
  try {
    await validatePDF(file.path);
    const result = await executeCommand(command, { timeout: 30000 });
    return { success: true, data: result };
  } catch (error) {
    console.error('Process file error:', error);
    throw new Error(`File processing failed: ${error.message}`);
  }
}
```

### Frontend Conventions
- **Component naming**: `PascalCase.jsx` (e.g., `MergePDF.jsx`, `FileUpload.jsx`)
- **Hook usage**: Functional components with hooks only
- **State management**: Local useState for component state
- **API calls**: Use async/await with proper loading states
- **Error handling**: User-friendly error messages with status indicators

```jsx
// ✅ Correct component pattern
const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleMerge = async () => {
    setLoading(true);
    try {
      const result = await mergePDFs(files);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* JSX content */}
    </div>
  );
};
```

### Styling Conventions
- **Tailwind CSS classes** for all styling
- **Custom colors**: Use defined cyber theme colors
  - `cyber-blue`: `#00f0ff`
  - `cyber-purple`: `#b000ff`
  - `cyber-pink`: `#ff006e`
  - `dark-bg`: `#0a0a0f`
  - `dark-surface`: `#151520`
  - `dark-border`: `#2a2a3e`
- **Responsive design**: Mobile-first with `md:` and `lg:` prefixes
- **Animations**: Use Framer Motion with consistent variants

### File Structure & Patterns
```
backend/src/
├── config.js           # Configuration management
├── server.js           # Express server setup
├── middleware/         # Express middleware
├── routes/            # API route handlers
├── services/          # Business logic
├── utils/             # Utility functions

frontend/src/
├── components/        # React components
├── services/         # API client
├── utils/            # Helper functions
├── App.jsx           # Main application
└── main.jsx          # Entry point
```

### API Response Format
```javascript
// ✅ Success response
{
  success: true,
  data: { /* relevant data */ },
  filename: "output.pdf"
}

// ❌ Error response
{
  success: false,
  error: "Descriptive error message"
}
```

### Environment Configuration
- Backend uses `.env` file (see `backend/.env.example`)
- Frontend uses Vite proxy to `/api` endpoints
- No hard-coded paths - use `config.js` for tool paths
- Development uses ports: Backend (5000), Frontend (3000)

### External Tool Integration
- Always validate tool availability before use
- Use absolute paths from config
- Escape shell arguments properly
- Set appropriate timeouts (30-180 seconds)
- Handle tool-specific error codes

### Testing Guidelines
- E2E tests with Playwright
- Test files named `*.spec.js`
- Use helpers from `tests/helpers.js`
- Test assets in `test-assets/` directory
- Each feature has corresponding test file

### Security Considerations
- Validate file extensions and MIME types
- Enforce file size limits (10MB default)
- Use temp directories with TTL cleanup
- Prevent command injection with proper escaping
- No sensitive data in client-side code

### Adding New Features
1. Implement backend service in `backend/src/services/`
2. Add API route in `backend/src/routes/`
3. Create React component in `frontend/src/components/`
4. Add to navigation in `frontend/src/App.jsx`
5. Create E2E test in appropriate `tests/partX/` directory
6. Update documentation

### Common Gotchas
- All file paths in backend must use absolute paths
- Frontend proxy only works in development
- External tools must be installed via Homebrew
- File cleanup happens automatically (1 hour TTL)
- Use `escapeShellArg()` for all file paths in commands