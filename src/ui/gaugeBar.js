/**
 * Tsun-Dere Gauge Bar Renderer for TsunDev
 * Provides colorful ANSI graphical progress bars, percentages, and status tags.
 */

import { c, ANSI, padToWidth } from './colors.js';

/**
 * Generates an ANSI-colored gauge bar string
 * @param {number} gauge 0 - 100
 * @param {object} [options]
 * @param {number} [options.width=20] Total characters for the bar
 * @param {boolean} [options.colored=true]
 * @param {boolean} [options.showLabels=true]
 * @returns {string} Formatted bar string
 */
export function renderGaugeBar(gauge, options = {}) {
  const width = Math.max(10, options.width || 20);
  const colored = options.colored !== false;
  const showLabels = options.showLabels !== false;

  const clamped = Math.max(0, Math.min(100, Math.round(typeof gauge === 'number' ? gauge : 100)));
  const filledCount = Math.round((clamped / 100) * width);
  const emptyCount = Math.max(0, width - filledCount);

  const filledChar = '█';
  const emptyChar = '░';

  const filledPart = filledChar.repeat(filledCount);
  const emptyPart = emptyChar.repeat(emptyCount);

  let coloredFilled = filledPart;
  let coloredEmpty = emptyPart;

  if (colored) {
    if (clamped >= 80) {
      coloredFilled = c.crimson(c.bold(filledPart));
      coloredEmpty = c.gray(emptyPart);
    } else if (clamped >= 40) {
      coloredFilled = c.gold(c.bold(filledPart));
      coloredEmpty = c.gray(emptyPart);
    } else if (clamped >= 15) {
      coloredFilled = c.pink(c.bold(filledPart));
      coloredEmpty = c.gray(emptyPart);
    } else {
      coloredFilled = c.brightMagenta(c.bold(filledPart));
      coloredEmpty = c.gray(emptyPart);
    }
  }

  const bar = `[${coloredFilled}${coloredEmpty}]`;

  if (!showLabels) return bar;

  const dere = 100 - clamped;
  const percentText = `${clamped}% Tsun / ${dere}% Dere`;
  const styledPercent = colored
    ? clamped >= 80
      ? c.brightRed(c.bold(percentText))
      : clamped >= 40
      ? c.yellow(c.bold(percentText))
      : c.pink(c.bold(percentText))
    : percentText;

  return `${bar} ${styledPercent}`;
}

/**
 * Returns a styled badge for tool status
 * @param {boolean} allowed
 * @param {boolean} [colored=true]
 * @returns {string}
 */
export function renderToolBadge(allowed, colored = true) {
  if (allowed) {
    const text = '🔓 UNLOCKED';
    return colored ? c.brightGreen(c.bold(`[${text}]`)) : `[${text}]`;
  }
  const text = '🔒 LOCKED';
  return colored ? c.brightRed(c.bold(`[${text}]`)) : `[${text}]`;
}

/**
 * Returns a styled delta badge (+5%, -25%, etc.)
 * @param {number} delta
 * @param {boolean} [colored=true]
 * @returns {string}
 */
export function renderDeltaBadge(delta, colored = true) {
  if (delta === 0 || delta === undefined || delta === null) {
    return colored ? c.gray('[±0%]') : '[±0%]';
  }
  if (delta > 0) {
    const text = `[+${delta}% Tsun 💢]`;
    return colored ? c.brightRed(c.bold(text)) : text;
  }
  const text = `[${delta}% Tsun 💖]`;
  return colored ? c.brightGreen(c.bold(text)) : text;
}
