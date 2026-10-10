/**
 * Terminal Color and Formatting Utilities for TsunDev
 * Provides ANSI color styling, gradients, and string width calculation.
 */

export const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright Foreground
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  gray: '\x1b[90m',

  // Background
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

/**
 * Strip ANSI escape codes to calculate visual string width
 * @param {string} str
 * @returns {string}
 */
export function stripAnsi(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Calculate visual length considering wide Unicode characters
 * @param {string} str
 * @returns {number}
 */
export function stringVisualWidth(str) {
  const clean = stripAnsi(str);
  let width = 0;
  for (const char of clean) {
    const code = char.codePointAt(0);
    // Rough check for full-width CJK or emoji ranges
    if (
      (code >= 0x1100 && code <= 0x115f) ||
      (code >= 0x2e80 && code <= 0xa4cf) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1f300 && code <= 0x1f9ff)
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

/**
 * Pad a string to visual width
 * @param {string} str
 * @param {number} targetWidth
 * @param {'left'|'right'} [align='left']
 * @returns {string}
 */
export function padToWidth(str, targetWidth, align = 'left') {
  const current = stringVisualWidth(str);
  const diff = Math.max(0, targetWidth - current);
  const spaces = ' '.repeat(diff);
  return align === 'right' ? spaces + str : str + spaces;
}

/**
 * Color helper functions
 */
export const c = {
  red: (txt) => `${ANSI.red}${txt}${ANSI.reset}`,
  brightRed: (txt) => `${ANSI.brightRed}${txt}${ANSI.reset}`,
  green: (txt) => `${ANSI.green}${txt}${ANSI.reset}`,
  brightGreen: (txt) => `${ANSI.brightGreen}${txt}${ANSI.reset}`,
  yellow: (txt) => `${ANSI.yellow}${txt}${ANSI.reset}`,
  brightYellow: (txt) => `${ANSI.brightYellow}${txt}${ANSI.reset}`,
  magenta: (txt) => `${ANSI.magenta}${txt}${ANSI.reset}`,
  brightMagenta: (txt) => `${ANSI.brightMagenta}${txt}${ANSI.reset}`,
  cyan: (txt) => `${ANSI.cyan}${txt}${ANSI.reset}`,
  brightCyan: (txt) => `${ANSI.brightCyan}${txt}${ANSI.reset}`,
  gray: (txt) => `${ANSI.gray}${txt}${ANSI.reset}`,
  bold: (txt) => `${ANSI.bold}${txt}${ANSI.reset}`,
  dim: (txt) => `${ANSI.dim}${txt}${ANSI.reset}`,
  pink: (txt) => `\x1b[38;5;212m${txt}${ANSI.reset}`,
  gold: (txt) => `\x1b[38;5;220m${txt}${ANSI.reset}`,
  crimson: (txt) => `\x1b[38;5;196m${txt}${ANSI.reset}`
};
