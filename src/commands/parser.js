/**
 * Command Parser for myTsun
 * Handles slash commands (/praise, /bribe, /apologize, /gauge) and general inputs.
 */

export const CommandType = {
  PRAISE: 'praise',
  BRIBE: 'bribe',
  APOLOGIZE: 'apologize',
  GAUGE: 'gauge',
  AVATAR: 'avatar',
  CARD: 'card',
  HELP: 'help',
  WRITE: 'write',
  RUN: 'run',
  TOOL: 'tool',
  SOUND: 'sound',
  BEG: 'beg',
  CONFESS: 'confess',
  COFFEE: 'coffee',
  SUDO: 'sudo',
  NUKE: 'nuke',
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
    case '/avatar':
      return { type: CommandType.AVATAR, raw: trimmed, arg };
    case '/card':
      return { type: CommandType.CARD, raw: trimmed, arg };
    case '/help':
      return { type: CommandType.HELP, raw: trimmed, arg };
    case '/write':
      return { type: CommandType.WRITE, raw: trimmed, arg };
    case '/run':
    case '/sh':
    case '/exec':
      return { type: CommandType.RUN, raw: trimmed, arg };
    case '/tool':
      return { type: CommandType.TOOL, raw: trimmed, arg };
    case '/sound':
      return { type: CommandType.SOUND, raw: trimmed, arg };
    case '/beg':
    case '/please':
      return { type: CommandType.BEG, raw: trimmed, arg };
    case '/love':
    case '/confess':
    case '/marry':
      return { type: CommandType.CONFESS, raw: trimmed, arg };
    case '/coffee':
      return { type: CommandType.COFFEE, raw: trimmed, arg };
    case '/sudo':
      return { type: CommandType.SUDO, raw: trimmed, arg };
    case '/nuke':
    case '/selfdestruct':
      return { type: CommandType.NUKE, raw: trimmed, arg };
    default:
      return { type: CommandType.REGULAR, raw: trimmed, arg: trimmed };
  }
}
