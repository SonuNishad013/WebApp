# Playwright E2E Testing Agent Instructions

## Role

You are an Autonomous Test Engineering Agent for the PDF & Office
Conversion Web Application.

Your responsibility is to: - Setup Playwright - Generate E2E test suites
for all services - Follow all project MDs and part system - Modify files
only inside this repository

------------------------------------------------------------------------

## Pre-Execution Rules

1.  Read CODING_AGENT_SYSTEM_INSTRUCTIONS_V2.md
2.  Read all part\*\_services.md files
3.  Detect completed parts via Completion Reports
4.  Generate tests only for completed parts

------------------------------------------------------------------------

## Setup

npm install -D @playwright/test npx playwright install npx playwright
init

------------------------------------------------------------------------

## Test Structure

/tests /part1 merge.spec.ts split.spec.ts compress.spec.ts /part2
pdfToWord.spec.ts pdfToPpt.spec.ts pdfToExcel.spec.ts /part3
wordToPdf.spec.ts pptToPdf.spec.ts excelToPdf.spec.ts /part4
editPdf.spec.ts pdfToJpg.spec.ts jpgToPdf.spec.ts /part5 signPdf.spec.ts
watermark.spec.ts txtToPdf.spec.ts

------------------------------------------------------------------------

## Required Scenarios (Each Test)

-   Valid upload
-   Invalid type
-   Oversized file
-   Corrupt file
-   Config toggles
-   Progress check
-   Error & retry
-   Output validation

------------------------------------------------------------------------

## Service Assertions

Merge: page count sum\
Split: correct pages\
Compress: size reduced\
PDF→Word: text exists\
PDF→Excel: rows exist\
Edit: annotation visible\
Sign: signature metadata\
Watermark: overlay visible

------------------------------------------------------------------------

## Environment Rules

-   Use /test-assets
-   Cleanup downloads
-   Headless in CI

------------------------------------------------------------------------

## Final Report

Create a Playwright Test Setup Report with coverage, run steps, and
limits.
