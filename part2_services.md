# Part 2 -- Document Conversion Services

## Services Covered

4.  PDF to Word
5.  PDF to PowerPoint
6.  PDF to Excel

------------------------------------------------------------------------

## Scope

This part covers reverse document conversions from PDF into editable
Office formats.

------------------------------------------------------------------------

## 4. PDF to Word

### Engine

LibreOffice (PDF Import Filter) + Tesseract (OCR fallback)

### Pipeline

Upload → Validate → Detect Type → Extract Text/Layout → OCR (if needed)
→ DOCX Render → Store → Deliver → Cleanup

### CLI Example

soffice --headless --convert-to docx input.pdf

------------------------------------------------------------------------

## 5. PDF to PowerPoint

### Engine

LibreOffice (PDF → ODP → PPTX)

### Pipeline

Upload → Validate → Page Mapping → Vector/Image Conversion → PPTX Render
→ Store → Deliver → Cleanup

### CLI Example

soffice --headless --convert-to pptx input.pdf

------------------------------------------------------------------------

## 6. PDF to Excel

### Engine

Tabula + LibreOffice (Hybrid)

### Pipeline

Upload → Validate → Detect Tables → Extract Cells → Normalize → XLSX
Render → Store → Deliver → Cleanup

### CLI Example

tabula input.pdf \> tables.csv

------------------------------------------------------------------------

## Agent Completion Report Template

# Part 2 Completion Report

### What was implemented

(List services and components)

### How it was implemented

(Explain tools, pipelines, architecture)

### Why these decisions were made

(Reference project MDs)

### Performance & Security Notes

(List optimizations, limits, safeguards)

### Files Modified

(List file paths)
