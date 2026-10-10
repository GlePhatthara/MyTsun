/**
 * ASCII Avatar Art for TsunDev
 * Provides expressive ASCII art representations of TsunDev across all mood and blush states.
 *
 * States:
 * 1. EXTREME_TSUN (80-100%): Glaring, furious, anger vein (💢), spiky twintails
 * 2. RELUCTANT_TSUN (40-79%): Crossing arms, looking away, pouting (😤)
 * 3. DERE_BREAKTHROUGH (15-39%): Blushing cheeks (///), fidgeting, flustered (😳)
 * 4. MAX_DERE (0-14%): Sparkling dere face, heavy blush, heart eyes / radiant smile (🥰)
 */

import { c, ANSI } from './colors.js';

export const AVATAR_LEVELS = {
  EXTREME_TSUN: 'extreme_tsun',
  RELUCTANT_TSUN: 'reluctant_tsun',
  DERE_BREAKTHROUGH: 'dere_breakthrough',
  MAX_DERE: 'max_dere',
  MELTDOWN: 'meltdown',
  CRITICAL_BLUSH: 'critical_blush'
};

/**
 * Raw multi-line ASCII art templates
 */
export const ASCII_AVATARS = {
  [AVATAR_LEVELS.EXTREME_TSUN]: [
    `     /\\_____/\\   💢 `,
    `    /  >   <  \\     `,
    `   ( ==  皿  == )   `,
    `    / > | | < \\     `,
    `   (__( | | )__)    `,
    `      " " " "       `
  ],

  [AVATAR_LEVELS.RELUCTANT_TSUN]: [
    `     /\\_____/\\      `,
    `    /  ￢   ￢ \\  ~3  `,
    `   (  ( _ 3 _ ) )   `,
    `    / > [===] < \\   `,
    `   (__( [===] )__)  `,
    `      " " " "       `
  ],

  [AVATAR_LEVELS.DERE_BREAKTHROUGH]: [
    `     /\\_____/\\      `,
    `    /  >   <  \\     `,
    `   ( /// ▽ /// ) ✨ `,
    `    / > [♥] < \\     `,
    `   (__( [♥] )__)    `,
    `      " " " "       `
  ],

  [AVATAR_LEVELS.MAX_DERE]: [
    `     /\\_____/\\  ✨♥ `,
    `    /  ★   ★  \\     `,
    `   ( ////////ω// )  `,
    `   ((  (っ˘з˘)っ )) `,
    `    \\_> [♥♥] <_/    `,
    `       " " " "      `
  ],

  [AVATAR_LEVELS.MELTDOWN]: [
    `   💥  /\\_____/\\  💥 `,
    `  🔥  ( ◣ д ◢ )  🔥 `,
    `     (  [ ☠ ]  )    `,
    `    / > [!!!] < \\   `,
    `   (__(       )__)  `,
    `      " " " "       `
  ],

  [AVATAR_LEVELS.CRITICAL_BLUSH]: [
    `     /\\_____/\\  💨💨`,
    `    /  @   @  \\ ♨♨  `,
    `   ( /////////// )  `,
    `   (( (>///<) ))    `,
    `    \\_> [♥♥♥] <_/   `,
    `       " " " "      `
  ]
};

/**
 * Compact single-line faces for status bars and logs
 */
export const COMPACT_FACES = {
  [AVATAR_LEVELS.EXTREME_TSUN]: `(╬◣_◢) 💢 [Extreme Tsun]`,
  [AVATAR_LEVELS.RELUCTANT_TSUN]: `( ` + `￢з￢) 😤 [Reluctant Tsun]`,
  [AVATAR_LEVELS.DERE_BREAKTHROUGH]: `(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 😳 [Dere Breakthrough]`,
  [AVATAR_LEVELS.MAX_DERE]: `(♥´ω\`♥) 🥰 [Maximum Dere!]`,
  [AVATAR_LEVELS.MELTDOWN]: `(╯°□°)╯︵ ┻━┻ 💥🔥 [MELTDOWN BERSERK!]`,
  [AVATAR_LEVELS.CRITICAL_BLUSH]: `(⁄ ⁄>⁄ Д ⁄<⁄ ⁄) ♨️😳 [CRITICAL OVERHEAT 9999°C]`
};

/**
 * Determine avatar level from gauge percentage
 * @param {number} gauge 0 - 100
 * @returns {string} avatar level key
 */
export function getAvatarLevel(gauge) {
  const g = typeof gauge === 'number' ? gauge : 100;
  if (g >= 80) return AVATAR_LEVELS.EXTREME_TSUN;
  if (g >= 40) return AVATAR_LEVELS.RELUCTANT_TSUN;
  if (g >= 15) return AVATAR_LEVELS.DERE_BREAKTHROUGH;
  return AVATAR_LEVELS.MAX_DERE;
}

/**
 * Get colored ASCII avatar lines for a given gauge
 * @param {number} gauge
 * @param {object} [options]
 * @param {boolean} [options.colored=true]
 * @returns {string[]} Array of formatted lines
 */
export function getAvatarLines(gauge, options = {}) {
  const colored = options.colored !== false;
  const level = typeof gauge === 'string' && ASCII_AVATARS[gauge] ? gauge : getAvatarLevel(gauge);
  const rawLines = ASCII_AVATARS[level] || ASCII_AVATARS[AVATAR_LEVELS.EXTREME_TSUN];

  if (!colored) return [...rawLines];

  switch (level) {
    case AVATAR_LEVELS.EXTREME_TSUN:
      return rawLines.map((line) => c.crimson(c.bold(line)));
    case AVATAR_LEVELS.RELUCTANT_TSUN:
      return rawLines.map((line) => c.gold(line));
    case AVATAR_LEVELS.DERE_BREAKTHROUGH:
      return rawLines.map((line) => c.pink(c.bold(line)));
    case AVATAR_LEVELS.MAX_DERE:
      return rawLines.map((line) => c.brightMagenta(c.bold(line)));
    case AVATAR_LEVELS.MELTDOWN:
      return rawLines.map((line) => c.brightRed(c.bold(line)));
    case AVATAR_LEVELS.CRITICAL_BLUSH:
      return rawLines.map((line) => c.brightMagenta(c.bold(line)));
    default:
      return rawLines;
  }
}

/**
 * Get compact face string
 * @param {number|string} gauge
 * @param {boolean} [colored=true]
 * @returns {string}
 */
export function getCompactFace(gauge, colored = true) {
  const level = typeof gauge === 'string' && ASCII_AVATARS[gauge] ? gauge : getAvatarLevel(gauge);
  const face = COMPACT_FACES[level] || COMPACT_FACES[AVATAR_LEVELS.EXTREME_TSUN];
  if (!colored) return face;

  switch (level) {
    case AVATAR_LEVELS.EXTREME_TSUN:
      return c.brightRed(c.bold(face));
    case AVATAR_LEVELS.RELUCTANT_TSUN:
      return c.yellow(c.bold(face));
    case AVATAR_LEVELS.DERE_BREAKTHROUGH:
      return c.pink(c.bold(face));
    case AVATAR_LEVELS.MAX_DERE:
      return c.brightMagenta(c.bold(face));
    case AVATAR_LEVELS.MELTDOWN:
      return c.brightRed(c.bold(face));
    case AVATAR_LEVELS.CRITICAL_BLUSH:
      return c.brightMagenta(c.bold(face));
    default:
      return face;
  }
}
