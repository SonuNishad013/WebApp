# TXT to PDF Conversion Fix Plan

## Problem Analysis

The TXT to PDF conversion is failing with the error "PDF was not created by LibreOffice". Based on my investigation, I've identified several root causes:

### Root Causes

1. **File Cleanup Race Condition**: The uploaded TXT file gets cleaned up before LibreOffice can process it
2. **File Path Issues**: The original file referenced in the error no longer exists at the expected path  
3. **Poor Error Handling**: The current error handling doesn't properly distinguish between different failure modes
4. **Missing Debug Information**: Insufficient logging makes it difficult to diagnose issues

### Evidence

- The error shows file `d0211d54-1a42-4f7c-afd8-0020b05382b9.txt` but this file doesn't exist in uploads directory
- LibreOffice is installed and working (tested successfully with sample.txt)
- Manual conversion works: `/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pdf --outdir /tmp sample.txt`

## Comprehensive Fix Plan

### Phase 1: Enhanced Error Handling & Validation

**File**: `backend/src/services/securityService.js`

**Changes**:
1. **Input File Validation**: Add explicit file existence check before processing
2. **Enhanced Error Messages**: More granular error reporting with specific file paths
3. **Directory Creation**: Ensure output directory exists before conversion
4. **Debug Logging**: Add comprehensive logging throughout the process

### Phase 2: Improved File Management

**Changes**:
1. **File Path Tracking**: Better handling of input file paths
2. **Cleanup Timing**: Ensure files persist through entire conversion process
3. **Output Verification**: Enhanced verification of created PDF files
4. **Directory Listing**: Add debugging info to show output directory contents

### Phase 3: Route Handler Updates

**File**: `backend/src/routes/securityRoutes.js`

**Changes**:
1. **Error Handling**: Better error propagation to client
2. **File Cleanup**: Ensure proper cleanup timing
3. **Response Format**: Consistent error response format

## Implementation Details

### Enhanced txtToPDF Function

```javascript
export async function txtToPDF(inputFile, options = {}) {
  let inputFilePath = null;
  
  try {
    // 1. Validate input file exists
    try {
      await fs.access(inputFile.path);
      inputFilePath = inputFile.path;
      console.log(`Input file exists: ${inputFilePath}`);
    } catch (error) {
      throw new Error(`Input file not found at path: ${inputFile.path}. Error: ${error.message}`);
    }
    
    // 2. Validate file content
    const filename = inputFile.originalname || path.basename(inputFile.path);
    await validateFile(inputFilePath, filename);

    // 3. Setup output paths
    const outputFilename = generateUniqueFilename(
      inputFile.originalname.replace(/\.txt$/i, ".pdf"),
    );
    const outputPath = getTempFilePath(outputFilename);
    const outputDir = path.dirname(outputPath);

    // 4. Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // 5. Execute LibreOffice command with logging
    const command = `"${config.tools.libreoffice}" --headless --convert-to pdf --outdir ${escapeShellArg(outputDir)} ${escapeShellArg(inputFilePath)}`;
    
    console.log("Executing LibreOffice command:", command);
    const result = await executeCommand(command, { timeout: 120000 });
    console.log("LibreOffice execution result:", result);

    // 6. Verify and handle output
    const libreOfficeOutput = path.join(
      outputDir,
      path.basename(inputFilePath, path.extname(inputFilePath)) + ".pdf",
    );

    try {
      await fs.access(libreOfficeOutput);
      if (libreOfficeOutput !== outputPath) {
        await fs.rename(libreOfficeOutput, outputPath);
      }
    } catch (error) {
      // Debug: List directory contents
      try {
        const dirContents = await fs.readdir(outputDir);
        console.log(`Output directory contents: ${dirContents}`);
      } catch (dirError) {
        console.error("Cannot list output directory:", dirError);
      }
      
      throw new Error(`PDF was not created by LibreOffice. Expected output at: ${libreOfficeOutput}. Error: ${error.message}`);
    }

    // 7. Final verification
    try {
      await fs.access(outputPath);
      const stats = await fs.stat(outputPath);
      console.log(`Final output PDF created successfully: ${outputFilename} (${stats.size} bytes)`);
    } catch (error) {
      throw new Error(`Output PDF not found at: ${outputPath}. Error: ${error.message}`);
    }

    return {
      success: true,
      outputPath,
      outputFilename,
      format: { fontSize, fontFamily, lineSpacing, margin },
    };
  } catch (error) {
    console.error("TXT to PDF error:", error);
    throw error;
  }
}
```

### Route Handler Improvements

**File**: `backend/src/routes/securityRoutes.js`

**Changes**:
1. Better error handling in the route
2. Improved file cleanup timing
3. Enhanced error responses

## Testing Strategy

### Phase 1: Manual Testing
1. Test with existing test files: `tests/test-assets/sample.txt`
2. Verify LibreOffice command works manually
3. Check file cleanup timing

### Phase 2: Automated Testing
1. Run existing E2E tests: `npm run test:part5`
2. Test error scenarios with missing files
3. Verify debug logging works

### Phase 3: Integration Testing
1. Test full upload-to-download flow
2. Verify error handling in frontend
3. Test with various TXT file sizes and content

## Success Criteria

1. ✅ TXT files convert successfully to PDF
2. ✅ Clear error messages for failures
3. ✅ Proper file cleanup timing
4. ✅ Comprehensive debug logging
5. ✅ All existing E2E tests pass

## Implementation Order

1. **High Priority**: Enhanced error handling & validation
2. **High Priority**: Improved file management
3. **Medium Priority**: Route handler updates
4. **Medium Priority**: Testing & verification

This plan addresses all identified root causes and provides a robust solution for TXT to PDF conversion.