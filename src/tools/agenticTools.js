/**
 * Agentic Tools for myTsun
 * Provides actual file operations and shell execution with safety checks.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Resolves safe absolute path inside allowed base directory to prevent directory traversal.
 * @param {string} relativeOrAbsolutePath
 * @param {string} [baseDir=process.cwd()]
 * @returns {string} Safe resolved path
 */
export function resolveSafePath(relativeOrAbsolutePath, baseDir = process.cwd()) {
  const resolvedBase = path.resolve(baseDir);
  const targetPath = path.isAbsolute(relativeOrAbsolutePath)
    ? path.resolve(relativeOrAbsolutePath)
    : path.resolve(resolvedBase, relativeOrAbsolutePath);

  // Security check: ensure target stays inside baseDir
  const relative = path.relative(resolvedBase, targetPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Security Violation: Path "${relativeOrAbsolutePath}" escapes base directory "${resolvedBase}"`);
  }

  return targetPath;
}

/**
 * Writes content to a file. Creates parent directories if they don't exist.
 * @param {object} params
 * @param {string} params.filePath
 * @param {string} params.content
 * @param {string} [params.baseDir]
 * @param {boolean} [params.overwrite=true]
 * @returns {Promise<{ filePath: string, bytesWritten: number }>}
 */
export async function writeFileTool({ filePath, content, baseDir = process.cwd(), overwrite = true }) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('writeFileTool requires a valid filePath string');
  }

  const safePath = resolveSafePath(filePath, baseDir);
  const dirname = path.dirname(safePath);

  // Ensure parent directory exists
  await fs.mkdir(dirname, { recursive: true });

  if (!overwrite) {
    try {
      await fs.access(safePath);
      throw new Error(`File "${filePath}" already exists and overwrite is set to false`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  const normalizedContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  await fs.writeFile(safePath, normalizedContent, 'utf-8');

  return {
    filePath: path.relative(baseDir, safePath) || path.basename(safePath),
    absolutePath: safePath,
    bytesWritten: Buffer.byteLength(normalizedContent, 'utf-8')
  };
}

/**
 * Reads content from a file.
 * @param {object} params
 * @param {string} params.filePath
 * @param {string} [params.baseDir]
 * @param {string} [params.encoding='utf-8']
 * @returns {Promise<{ filePath: string, content: string }>}
 */
export async function readFileTool({ filePath, baseDir = process.cwd(), encoding = 'utf-8' }) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('readFileTool requires a valid filePath string');
  }

  const safePath = resolveSafePath(filePath, baseDir);
  const content = await fs.readFile(safePath, encoding);

  return {
    filePath: path.relative(baseDir, safePath) || path.basename(safePath),
    absolutePath: safePath,
    content
  };
}

/**
 * Lists files in a directory.
 * @param {object} params
 * @param {string} [params.dirPath='.']
 * @param {string} [params.baseDir]
 * @returns {Promise<{ dirPath: string, files: string[] }>}
 */
export async function listDirectoryTool({ dirPath = '.', baseDir = process.cwd() }) {
  const safePath = resolveSafePath(dirPath, baseDir);
  const entries = await fs.readdir(safePath, { withFileTypes: true });

  const files = entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name));
  return {
    dirPath: path.relative(baseDir, safePath) || '.',
    files
  };
}

/**
 * Executes a shell command safely with timeout and output capture.
 * @param {object} params
 * @param {string} params.command Shell command line string
 * @param {string} [params.cwd]
 * @param {number} [params.timeout=10000] Timeout in milliseconds
 * @returns {Promise<{ command: string, stdout: string, stderr: string, exitCode: number }>}
 */
export async function runCommandTool({ command, cwd = process.cwd(), timeout = 10000 }) {
  if (!command || typeof command !== 'string') {
    throw new Error('runCommandTool requires a valid command string');
  }

  // Basic security check: disallow blatantly catastrophic commands
  const dangerousCommands = ['rm -rf /', 'rmdir /s /q c:\\', 'mkfs', ':(){ :|:& };:'];
  const lower = command.toLowerCase().trim();
  if (dangerousCommands.some((d) => lower.includes(d))) {
    throw new Error(`Security Violation: Command "${command}" is deemed hazardous and blocked.`);
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
      maxBuffer: 1024 * 1024 * 4
    });

    return {
      command,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0
    };
  } catch (error) {
    return {
      command,
      stdout: error.stdout ? error.stdout.trim() : '',
      stderr: (error.stderr || error.message || '').trim(),
      exitCode: error.code || 1
    };
  }
}
