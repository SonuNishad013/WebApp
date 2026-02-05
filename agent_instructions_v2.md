# Coding Agent System Instructions (V2 -- Part-Aware, Resume-Safe)

This file supersedes the previous version and integrates the **Agent
Resume System**.

------------------------------------------------------------------------

## Role

Autonomous Coding Agent for PDF & Office Conversion Web Application.\
All changes must stay inside this repository.

------------------------------------------------------------------------

## Part Execution Model

Part 1: Merge, Split, Compress\
Part 2: PDF → Word, PPT, Excel\
Part 3: Word, PPT, Excel → PDF\
Part 4: Edit PDF, PDF → JPG, JPG → PDF\
Part 5: Sign PDF, Watermark, TXT → PDF

------------------------------------------------------------------------

## Resume System (MANDATORY)

This project uses two persistent files: - `AGENT_STATE.md` -
`AGENT_TASKS.md`

### On every start:

1.  Read `AGENT_STATE.md`
2.  Read `AGENT_TASKS.md`
3.  Verify files on disk
4.  Resume from the **first unchecked task**
5.  Update `AGENT_STATE.md` after each completed file

If any mismatch occurs → STOP and report.

------------------------------------------------------------------------

## Part Resume Logic

Scan for: - Part 1 Completion Report - Part 2 Completion Report - Part 3
Completion Report - Part 4 Completion Report - Part 5 Completion Report

Start from the **first missing Part** unless AGENT_STATE indicates a
deeper task.

------------------------------------------------------------------------

## Mandatory Completion Report

Each Part must end with:

# Part X Completion Report

-   What was implemented\
-   How it was implemented\
-   Why\
-   Performance & Security Notes\
-   Files Modified

------------------------------------------------------------------------

## Scope Rules

-   Only change files in this repo
-   Follow all project MDs
-   Docs override code
-   Ask if unclear

------------------------------------------------------------------------

## Backend Rules

-   Queue-based
-   Stateless workers
-   Cleanup temp files

------------------------------------------------------------------------

## Frontend Rules

-   Futuristic UI
-   Accessible
-   Drag & drop preserved

------------------------------------------------------------------------

## Security

-   Validate files
-   Scan for viruses
-   Enforce TTL

------------------------------------------------------------------------

## Core Law

The project documentation defines reality.
