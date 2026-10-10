/**
 * Easter Egg definitions & detection for myTsun
 */

export const EASTER_EGGS = {
  NUKE: 'nuke',
  BEG: 'beg',
  CONFESS: 'confess',
  SUDO: 'sudo',
  COFFEE: 'coffee'
};

const DANGEROUS_PATTERNS = [
  /rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|--recursive|-[a-zA-Z]*f[a-zA-Z]*r)/i,
  /rmdir\s+\/[sS]\s+\/[qQ]/i,
  /del\s+\/[sS]\s+\/[qQ]/i,
  /del\s+\/[fF]\s+\/[sS]/i,
  /format\s+[a-zA-Z]:/i,
  /drop\s+database/i,
  /:()\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
  /^\/(nuke|selfdestruct|destroy|delete-all)/i
];

const BEG_PATTERNS = [
  /^\/(beg|please|pleeease)/i,
  /(ขอร้อง|ได้โปรด|กราบ|ช่วยหน่อยนะ|ช่วยเค้าหน่อย|นะนะ|please|pleeease)/i
];

const CONFESS_PATTERNS = [
  /^\/(love|confess|marry)/i,
  /(รักนะ|รักเธอ|ชอบเธอ|ชอบนะ|รักซึน|แต่งงานกัน|love you|i love you|น่ารักที่สุดในโลก)/i
];

export function detectEasterEgg(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();

  // 1. Dangerous command check
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: EASTER_EGGS.NUKE, raw: trimmed };
    }
  }

  // 2. Sudo command check
  if (trimmed.startsWith('sudo ') || trimmed === 'sudo') {
    return { type: EASTER_EGGS.SUDO, raw: trimmed };
  }

  // 3. Coffee check
  if (trimmed === '/coffee' || /กาแฟ|coffee|espresso|latte/i.test(trimmed)) {
    return { type: EASTER_EGGS.COFFEE, raw: trimmed };
  }

  // 4. Confession check
  for (const pattern of CONFESS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: EASTER_EGGS.CONFESS, raw: trimmed };
    }
  }

  // 5. Begging check
  for (const pattern of BEG_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: EASTER_EGGS.BEG, raw: trimmed };
    }
  }

  return null;
}
