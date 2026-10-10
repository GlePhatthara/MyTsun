/**
 * TUI Renderer for myTsun
 * Renders complete terminal UI frames, side-by-side avatar cards, and banners.
 */

import { c, ANSI, stripAnsi, stringVisualWidth, padToWidth } from './colors.js';
import { getAvatarLines, getCompactFace } from './asciiAvatar.js';
import { renderGaugeBar, renderToolBadge, renderDeltaBadge } from './gaugeBar.js';

export const LOGO_ASCII = [
  ' _____                   ____             ',
  '|_   _|___ _   _ _ __   |  _ \\  _____   __',
  '  | | / __| | | | \'_ \\  | | | |/ _ \\ \\ / /',
  '  | | \\__ \\ |_| | | | | | |_| |  __/\\ V / ',
  '  |_| |___/\\__,_|_| |_| |____/ \\___| \\_/  ',
  '     ツンデレ AI Pair-Programmer (myTsun - SHTX)   '
];

/**
 * Render the welcome startup banner
 * @param {object} [options]
 * @param {string} [options.provider='Gemini']
 * @param {string} [options.model='default']
 * @param {boolean} [options.colored=true]
 * @returns {string}
 */
export function renderWelcomeBanner(options = {}) {
  const colored = options.colored !== false;
  const provider = options.provider || 'Gemini';
  const model = options.model || 'gemini-2.5-flash';

  const logoFormatted = LOGO_ASCII.map((line, idx) => {
    if (!colored) return line;
    return idx === LOGO_ASCII.length - 1
      ? c.pink(c.bold(line))
      : c.crimson(c.bold(line));
  }).join('\n');

  const divider = colored
    ? c.pink('═'.repeat(68))
    : '='.repeat(68);

  const tips = [
    `  Provider: ${colored ? c.cyan(provider) : provider} (${colored ? c.dim(model) : model})`,
    `  สถานะเริ่มต้น: Tsun 100% 💢 (ด่ากราด ล็อกเครื่องมือ ไม่ยอมเขียนโค้ด)`,
    '',
    `  คำสั่งสำหรับง้อบอท (Slash Commands):`,
    `    ${colored ? c.yellow('/praise <คำชม>') : '/praise <คำชม>'}   - ชมเชยเพื่อลดความซึน (-15% ถึง -25%)`,
    `    ${colored ? c.yellow('/bribe <ขนม>') : '/bribe <ขนม>'}     - ติดสินบนด้วยของหวาน (-25% ถึง -35%)`,
    `    ${colored ? c.yellow('/apologize') : '/apologize'}       - กล่าวขอโทษเพื่อลดทิฐิ (-10%)`,
    `    ${colored ? c.yellow('/write <file> <text>') : '/write <file> <text>'} - สั่งเขียนไฟล์ (ต้อง Dere < 40%)`,
    `    ${colored ? c.yellow('/run <shell command>') : '/run <shell command>'} - สั่งรันคำสั่งเชลล์ (ต้อง Dere < 40%)`,
    `    ${colored ? c.yellow('/avatar') : '/avatar'}          - ส่องกระจกดูหน้าตาบอทในอารมณ์นี้`,
    `    ${colored ? c.yellow('/gauge') : '/gauge'}           - ส่องระดับเกจและสิทธิ์ Tool`,
    `    ${colored ? c.yellow('/reset') : '/reset'} | ${colored ? c.yellow('/exit') : '/exit'}`
  ].join('\n');

  return `\n${divider}\n${logoFormatted}\n${divider}\n${tips}\n${divider}\n`;
}

/**
 * Render side-by-side Avatar + Status Card
 * @param {import('../state/TsunDereState.js').TsunDereState} state
 * @param {object} [options]
 * @param {number} [options.delta]
 * @param {string} [options.reason]
 * @param {boolean} [options.colored=true]
 * @returns {string}
 */
export function renderStatusCard(state, options = {}) {
  const colored = options.colored !== false;
  const gauge = typeof state?.getGauge === 'function' ? state.getGauge() : (state?.gauge ?? 100);
  const mood = typeof state?.getMood === 'function' ? state.getMood() : { label: 'Extreme Tsun', toolsAllowed: false };
  const blush = typeof state?.getBlushLevel === 'function' ? state.getBlushLevel() : { emoji: '💢', label: 'โกรธจัด' };
  const isAllowed = typeof state?.isToolAllowed === 'function' ? state.isToolAllowed() : !!mood.toolsAllowed;

  const avatarLines = getAvatarLines(gauge, { colored });
  const gaugeBarStr = renderGaugeBar(gauge, { colored, width: 16, showLabels: true });
  const toolBadge = renderToolBadge(isAllowed, colored);
  const deltaBadge = renderDeltaBadge(options.delta, colored);

  // Info lines on the right side
  const infoLines = [
    `${blush.emoji} ${colored ? c.bold(mood.label) : mood.label} ${deltaBadge}`,
    `เกจ: ${gaugeBarStr}`,
    `เครื่องมือ: ${toolBadge} (ต้อง Tsun < 40% ถึงจะปลดล็อก)`,
    `สีหน้า: ${blush.label}`,
    options.reason ? `${colored ? c.dim(`เหตุผล: ${options.reason}`) : `เหตุผล: ${options.reason}`}` : `พิมพ์ /praise หรือ /bribe เพื่อลดความซึน!`
  ];

  // Match height between avatar lines and info lines
  const maxLines = Math.max(avatarLines.length, infoLines.length);
  const paddedAvatar = [...avatarLines];
  const paddedInfo = [...infoLines];

  while (paddedAvatar.length < maxLines) {
    paddedAvatar.push(' '.repeat(20));
  }
  while (paddedInfo.length < maxLines) {
    paddedInfo.push('');
  }

  // Box borders
  const boxWidth = 72;
  const avatarWidth = 24;
  const infoWidth = boxWidth - avatarWidth - 3;

  const topBorder = colored ? c.pink(`┌${'─'.repeat(boxWidth)}┐`) : `┌${'─'.repeat(boxWidth)}┐`;
  const bottomBorder = colored ? c.pink(`└${'─'.repeat(boxWidth)}┘`) : `└${'─'.repeat(boxWidth)}┘`;
  const midDivider = colored ? c.dim('│') : '│';

  const rows = [];
  rows.push(topBorder);

  for (let i = 0; i < maxLines; i++) {
    const leftText = padToWidth(paddedAvatar[i] || '', avatarWidth);
    const rightText = padToWidth(paddedInfo[i] || '', infoWidth);
    const row = `${midDivider} ${leftText}${midDivider} ${rightText} ${midDivider}`;
    rows.push(row);
  }

  rows.push(bottomBorder);
  return rows.join('\n');
}

/**
 * Render compact turn summary
 * @param {object} turnResult
 * @param {import('../state/TsunDereState.js').TsunDereState} state
 * @param {boolean} [colored=true]
 * @returns {string}
 */
export function renderTurnSummary(turnResult, state, colored = true) {
  const gauge = state.getGauge();
  const face = getCompactFace(gauge, colored);
  const deltaBadge = renderDeltaBadge(turnResult?.stateDelta?.delta, colored);
  const toolBadge = renderToolBadge(state.isToolAllowed(), colored);
  const reason = turnResult?.stateDelta?.reason ? `\n ${colored ? c.gray(`↳ ${turnResult.stateDelta.reason}`) : `↳ ${turnResult.stateDelta.reason}`}` : '';

  return `${face} ${deltaBadge} | เครื่องมือ: ${toolBadge}${reason}`;
}
