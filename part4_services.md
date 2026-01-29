# Part 4 -- Image & Editing Services

## Services Covered

10. Edit PDF
11. PDF to JPG
12. JPG to PDF

------------------------------------------------------------------------

## Scope

This part covers visual and content-level transformations.

------------------------------------------------------------------------

## 10. Edit PDF

### Engine

PDF.js (frontend) + qpdf (backend)

### Pipeline

Upload → Validate → Load Layers → Apply Edits → Rewrite Streams → Save
Incrementally → Deliver → Cleanup

------------------------------------------------------------------------

## 11. PDF to JPG

### Engine

Poppler (pdftoppm)

### Pipeline

Upload → Validate → Rasterize → Color Convert → JPG Export → Store →
Deliver → Cleanup

### CLI Example

pdftoppm input.pdf output -jpeg -r 150

------------------------------------------------------------------------

## 12. JPG to PDF

### Engine

ImageMagick

### Pipeline

Upload → Validate → Normalize → Layout Pages → PDF Render → Store →
Deliver → Cleanup

### CLI Example

magick image.jpg output.pdf

------------------------------------------------------------------------

## Agent Completion Report Template

# Part 4 Completion Report

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
