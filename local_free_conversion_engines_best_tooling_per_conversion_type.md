# Local & Free Conversion Engines – Best Tooling Per Conversion Type

This document defines the **best free, open‑source, and macOS‑compatible tooling** for each supported conversion type in the project.

This file is **authoritative** for the coding agent when choosing conversion engines.

---

## Global Principles

- Prefer **open‑source** tools
- Must run **locally on macOS**
- Must support **headless / CLI execution**
- Must be **scriptable & automatable**
- Avoid cloud‑locked or proprietary SDKs

---

## 1. Word (DOCX) → PDF

### Recommended Engine
**LibreOffice (Headless Mode)**

### Why
- Best layout fidelity
- Handles complex DOCX features
- Free & mature

### Execution Model
- `soffice --headless --convert-to pdf`

### Notes
- Pre‑warm process for performance
- Use isolated user profile per worker

---

## 2. TXT → PDF

### Recommended Engine
**Pandoc + LaTeX OR LibreOffice**

### Why
- Pandoc gives better typography
- LibreOffice simpler for basic text

### Notes
- Support font & margin presets

---

## 3. PDF → Word

### Recommended Engine
**LibreOffice (PDF Import Filter)**

### Why
- Best free PDF layout recovery
- Handles vector PDFs well

### Limitations
- OCR needed for scanned PDFs

---

## 4. PDF → PowerPoint

### Recommended Engine
**LibreOffice (PDF → ODP → PPTX)**

### Why
- Page‑to‑slide mapping
- Preserves images and shapes

---

## 5. PDF → Excel

### Recommended Engine
**Tabula + LibreOffice (Hybrid)**

### Why
- Tabula for table extraction
- LibreOffice for fallback

---

## 6. PowerPoint → PDF

### Recommended Engine
**LibreOffice Headless**

### Why
- Accurate slide rendering

---

## 7. Excel → PDF

### Recommended Engine
**LibreOffice Headless**

### Notes
- Control page breaks explicitly

---

## 8. Merge PDF

### Recommended Engine
**PDFtk OR qpdf**

### Why
- Lossless merge
- Fast, low memory

---

## 9. Split PDF

### Recommended Engine
**qpdf**

### Why
- Page‑level precision
- Streaming support

---

## 10. Compress PDF

### Recommended Engine
**Ghostscript**

### Compression Profiles
- screen
- ebook
- printer

---

## 11. Edit PDF

### Recommended Engine
**PDF.js (Frontend) + qpdf (Backend)**

### Why
- Non‑destructive edits
- Incremental saves

---

## 12. PDF → JPG

### Recommended Engine
**Poppler (pdftoppm)**

### Why
- High‑quality rasterization
- DPI control

---

## 13. JPG → PDF

### Recommended Engine
**ImageMagick**

### Notes
- Normalize DPI
- Auto‑rotate images

---

## 14. Sign PDF

### Recommended Engine
**OpenSSL + qpdf**

### Why
- PKI‑based signing
- Fully offline

---

## 15. Watermark PDF

### Recommended Engine
**qpdf OR Ghostscript**

### Why
- Overlay support
- Transparency control

---

## 16. OCR (Shared Dependency)

### Engine
**Tesseract OCR**

### Usage
- Scanned PDFs
- Image‑based documents

---

## macOS Installation Notes

All tools installable via Homebrew:

- libreoffice
- pandoc
- qpdf
- ghostscript
- poppler
- imagemagick
- tesseract

---

## Final Rule for Coding Agent

> Always use the engine specified here unless the documentation is explicitly updated.

This file must be updated before switching tools.

