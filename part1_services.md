# Part 1 -- Document Processing Services

## Services Covered

1.  Merge PDF
2.  Split PDF
3.  Compress PDF

------------------------------------------------------------------------

## Scope

This part covers core structural PDF operations. The coding agent must
implement these three services following the global architecture and
tooling standards.

------------------------------------------------------------------------

## 1. Merge PDF

### Engine

qpdf

### Pipeline

Upload → Validate → Parse → Merge Pages → Rebuild XRef → Optimize →
Store → Deliver → Cleanup

### CLI Example

qpdf --empty --pages a.pdf b.pdf -- merged.pdf

### Why

Lossless, fast, low memory.

------------------------------------------------------------------------

## 2. Split PDF

### Engine

qpdf

### Pipeline

Upload → Validate → Parse → Page Slice → Rewrite Objects → Store →
Deliver → Cleanup

### CLI Example

qpdf input.pdf --pages . 1-3 -- output.pdf

------------------------------------------------------------------------

## 3. Compress PDF

### Engine

Ghostscript

### Pipeline

Upload → Validate → Render → Downsample → Compress Streams → Store →
Deliver → Cleanup

### CLI Example

gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH
-sOutputFile=compressed.pdf input.pdf

------------------------------------------------------------------------

## Agent Completion Report Template

# Part 1 Completion Report

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
