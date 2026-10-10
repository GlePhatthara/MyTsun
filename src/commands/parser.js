/**
 * Command Parser for TsunDev
 * Handles slash commands (/praise, /bribe, /apologize, /gauge) and general inputs.
 */

export const CommandType = {
  PRAISE: 'praise',
  BRIBE: 'bribe',
  APOLOGIZE: 'apologize',
  GAUGE: 'gauge',
  HELP: 'help',
  REGULAR: 'regular'
};

/**
 * Parses user input into a structured command object.
 * @param {string} input - Raw input from the user.
 * @returns {{ type: string, raw: string, arg: string }}
 */
export function parseCommand(input) {
  if (typeof input !== 'string') {
    return { type: CommandType.REGULAR, raw: '', arg: '' };
  }

  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) {
    return { type: CommandType.REGULAR, raw: trimmed, arg: trimmed };
  }

  const [cmdPart, ...rest] = trimmed.split(/\s+/);
  const command = cmdPart.toLowerCase();
  const arg = rest.join(' ').trim();

  switch (command) {
    case '/praise':
      return { type: CommandType.PRAISE, raw: trimmed, arg };
    case '/bribe':
      return { type: CommandType.BRIBE, raw: trimmed, arg };
    case '/apologize':
      return { type: CommandType.APOLOGIZE, raw: trimmed, arg };
    case '/gauge':
      return { type: CommandType.GAUGE, raw: trimmed, arg };
    case '/help':
      return { type: CommandType.HELP, raw: trimmed, arg };
    default:
      return { type: CommandType.REGULAR, raw: trimmed, arg: trimmed };
  }
}
