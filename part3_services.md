# Part 3 -- Office to PDF Services

## Services Covered

7.  Word to PDF
8.  PowerPoint to PDF
9.  Excel to PDF

------------------------------------------------------------------------

## Scope

This part covers converting Office documents into high-fidelity PDFs.

------------------------------------------------------------------------

## 7. Word to PDF

### Engine

LibreOffice (Headless)

### Pipeline

Upload → Validate → Layout Render → Font Resolve → PDF Export → Store →
Deliver → Cleanup

### CLI Example

soffice --headless --convert-to pdf input.docx

------------------------------------------------------------------------

## 8. PowerPoint to PDF

### Engine

LibreOffice (Headless)

### Pipeline

Upload → Validate → Slide Render → Vector Export → PDF Export → Store →
Deliver → Cleanup

### CLI Example

soffice --headless --convert-to pdf input.pptx

------------------------------------------------------------------------

## 9. Excel to PDF

### Engine

LibreOffice (Headless)

### Pipeline

Upload → Validate → Sheet Layout → Page Break Control → PDF Export →
Store → Deliver → Cleanup

### CLI Example

soffice --headless --convert-to pdf input.xlsx

------------------------------------------------------------------------

## Agent Completion Report Template

# Part 3 Completion Report

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
