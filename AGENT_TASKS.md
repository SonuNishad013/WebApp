# Playwright Test Tasks

## Pre-Execution Setup

- [x] Read playwright_agent_instructions.md
- [x] Detect completed parts via Completion Reports
- [x] Verify Playwright installation: `npx playwright install` ✅ COMPLETE
- [ ] Setup test assets structure in `/tests/test-assets`
- [ ] Create playwright.config.js configuration

## Part 1: PDF Basic Operations

- [ ] merge.spec.ts - Merge 2+ PDFs, page count validation
- [ ] split.spec.ts - Split pages, range extraction, page validation
- [ ] compress.spec.ts - Compress with quality presets, size reduction validation

## Part 2: PDF to Office Conversion

- [x] pdfToWord.spec.ts - PDF to DOCX, text extraction validation
- [x] pdfToPpt.spec.ts - PDF to PPTX, page-to-slide mapping
- [x] pdfToExcel.spec.ts - PDF to XLSX, table extraction, row validation

## Part 3: Office to PDF Conversion

- [x] wordToPdf.spec.ts - DOCX to PDF, layout preservation
- [x] pptToPdf.spec.ts - PPTX to PDF, slide-to-page mapping
- [x] excelToPdf.spec.ts - XLSX to PDF, sheet handling

## Part 4: PDF Editing & Image Conversion

- [x] editPdf.spec.ts - Rotate, remove pages, decrypt functionality
- [x] pdfToJpg.spec.ts - PDF to JPG, DPI/quality options, ZIP archive validation
- [x] jpgToPdf.spec.js - Image to PDF, multi-image support, page size options

## Part 5: PDF Security & Text

- [x] signPdf.spec.js - Digital signatures, certificate generation, metadata validation
- [x] watermark.spec.js - Watermark overlay, position/opacity/rotation options
- [x] txtToPdf.spec.js - Text to PDF, font/size/spacing/margin options

## Test Coverage Requirements

For Each Test Suite:

- [x] Valid file upload scenario
- [x] Invalid file type handling
- [x] Oversized file rejection
- [x] Corrupt file handling
- [x] Configuration toggle validation
- [x] Progress tracking verification
- [x] Error handling & retry logic
- [x] Output file validation

## Post-Testing Report

- [ ] Generate Playwright Test Setup Report
- [ ] Document test coverage metrics
- [ ] Create run instructions (npm/yarn commands)
- [ ] Document environment limitations
