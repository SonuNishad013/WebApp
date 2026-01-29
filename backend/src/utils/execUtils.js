import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Execute command with timeout and error handling
 */
export async function executeCommand(command, options = {}) {
  const {
    timeout = 30000, // 30 seconds default
    maxBuffer = 10 * 1024 * 1024, // 10MB
  } = options;

  try {
    const { stdout, stderr } = await execPromise(command, {
      timeout,
      maxBuffer,
    });

    if (stderr && !options.ignoreStderr) {
      console.warn('Command stderr:', stderr);
    }

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  } catch (error) {
    console.error('Command execution error:', error.message);
    
    return {
      success: false,
      error: error.message,
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || '',
      code: error.code,
    };
  }
}

/**
 * Check if a command-line tool is available
 */
export async function checkToolAvailability(toolPath, versionFlag = '--version') {
  try {
    const command = `"${toolPath}" ${versionFlag}`;
    const result = await executeCommand(command, { timeout: 5000, ignoreStderr: true });
    
    return result.success;
  } catch (error) {
    return false;
  }
}

/**
 * Validate all required tools are installed
 */
export async function validateTools(tools) {
  const results = {};
  
  for (const [name, path] of Object.entries(tools)) {
    results[name] = await checkToolAvailability(path);
  }
  
  return results;
}

/**
 * Escape shell arguments to prevent injection
 */
export function escapeShellArg(arg) {
  return `"${arg.replace(/"/g, '\\"')}"`;
}
