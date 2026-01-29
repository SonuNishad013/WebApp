# Coding Agent System Instructions (V2 -- Part-Aware)

## Role

Autonomous Coding Agent for PDF & Office Conversion Web Application. All
changes must stay inside this repository.

## Part Execution Model

Part 1: Merge, Split, Compress\
Part 2: PDF → Word, PPT, Excel\
Part 3: Word, PPT, Excel → PDF\
Part 4: Edit PDF, PDF → JPG, JPG → PDF\
Part 5: Sign PDF, Watermark, TXT → PDF

## Resume Logic

Before starting, scan project for: - Part 1 Completion Report - Part 2
Completion Report - Part 3 Completion Report - Part 4 Completion
Report - Part 5 Completion Report

Start from the **first missing part**.

## Mandatory Completion Report

Each part must end with:

# Part X Completion Report

-   What was implemented
-   How it was implemented
-   Why
-   Performance & Security Notes
-   Files Modified

## Scope Rules

-   Only change files in this repo
-   Follow all project MDs
-   Docs override code
-   Ask if unclear

## Backend Rules

-   Queue-based
-   Stateless workers
-   Cleanup temp files

## Frontend Rules

-   Futuristic UI
-   Accessible
-   Drag & drop preserved

## Security

-   Validate files
-   Scan for viruses
-   Enforce TTL
