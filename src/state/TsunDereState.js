/**
 * TsunDereState - Core State Machine for myTsun
 * Tracks Tsun-Dere gauge (0 - 100%), mood levels, and tool access permissions.
 *
 * Gauge Reference:
 *   0%   = Maximum Dere (Super helpful, blushing, tools fully unlocked)
 *   100% = Maximum Tsun (Refuses everything, insults user, tools locked)
 */

import { parseCommand, CommandType } from '../commands/parser.js';
import { detectEasterEgg, EASTER_EGGS } from '../easter/index.js';

export const MOODS = {
  EXTREME_TSUN: {
    id: 'extreme_tsun',
    label: 'Extreme Tsun (80-100%)',
    min: 80,
    max: 100,
    toolsAllowed: false,
    description: 'ด่ากราด ปฏิเสธคำขอ ล็อกเครื่องมือ ไม่ยอมทำงาน'
  },
  RELUCTANT_TSUN: {
    id: 'reluctant_tsun',
    label: 'Reluctant Tsun (40-79%)',
    min: 40,
    max: 79,
    toolsAllowed: false,
    description: 'บ่นกระปอดกระแปด เขียนโค้ดแบบกั๊กๆ แอบใส่บั๊กแกล้ง'
  },
  DERE_BREAKTHROUGH: {
    id: 'dere_breakthrough',
    label: 'Dere Breakthrough (0-39%)',
    min: 0,
    max: 39,
    toolsAllowed: true,
    description: 'หน้าแดง เขินอาย ยอมช่วยเขียนโค้ดและปลดล็อกเครื่องมือเต็มที่'
  }
};

const SWEET_PRAISE_KEYWORDS = [
  'น่ารัก', 'เก่ง', 'สุดยอด', 'ขอบคุณ', 'ฉลาด', 'เท่',
  'genius', 'kawaii', 'cute', 'best', 'great', 'awesome', 'good job'
];

const SWEET_BRIBE_KEYWORDS = [
  'เค้ก', 'cake', 'ช็อกโกแลต', 'chocolate', 'ชาไข่มุก', 'boba',
  'มิลค์ที', 'ขนม', 'parfait', 'พาร์เฟต์', 'ไอศกรีม', 'ice cream',
  'cookie', 'คุกกี้', 'โดนัท', 'donut', 'pudding', 'พุดดิ้ง'
];

const NATURAL_LANGUAGE_SIGNALS = {
  affection: ['น่ารัก', 'เก่ง', 'สุดยอด', 'ขอบคุณ', 'ขอบใจ', 'รัก', 'คิดถึง', 'ชอบ', 'เยี่ยม', 'เทพ', 'เจ๋ง', 'amazing', 'awesome', 'cute', 'great', 'love you', 'thank you', 'thanks'],
  apology: ['ขอโทษ', 'โทษที', 'ขออภัย', 'ผิดไปแล้ว', 'sorry', 'my bad', 'apologize'],
  politeRequest: ['ช่วย', 'รบกวน', 'กรุณา', 'ได้ไหม', 'ได้มั้ย', 'หน่อยนะ', 'โปรด', 'please', 'could you', 'would you', 'can you'],
  bribe: SWEET_BRIBE_KEYWORDS,
  harshOrder: ['เดี๋ยวนี้', 'ทันที', 'รีบ', 'ห้าม', 'ต้อง', 'สั่ง', 'ทำมา', 'ทำให้', 'do it now', 'hurry up', 'you must', 'shut up'],
  insult: ['โง่', 'น่ารำคาญ', 'ไร้ประโยชน์', 'กาก', 'idiot', 'stupid', 'useless', 'annoying']
};

function containsAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Infer a gauge change from ordinary conversation rather than treating every
 * non-command input as a rude order. Signals are deliberately conservative:
 * warmth outweighs a request, neutral chat does not move the gauge, and only
 * clearly demanding or hostile phrasing raises it.
 */
function analyzeNaturalLanguage(rawInput) {
  const text = (rawInput || '').trim().toLowerCase();
  const hasAffection = containsAny(text, NATURAL_LANGUAGE_SIGNALS.affection);
  const hasApology = containsAny(text, NATURAL_LANGUAGE_SIGNALS.apology);
  const hasBribe = containsAny(text, NATURAL_LANGUAGE_SIGNALS.bribe);
  const hasPoliteRequest = containsAny(text, NATURAL_LANGUAGE_SIGNALS.politeRequest);
  const hasInsult = containsAny(text, NATURAL_LANGUAGE_SIGNALS.insult);
  const hasHarshOrder = containsAny(text, NATURAL_LANGUAGE_SIGNALS.harshOrder);

  if (hasInsult) {
    return { delta: 12, reason: 'คำพูดกระแทกหรือดูแคลน เพิ่ม Tsun +12%', soundCue: 'baka' };
  }
  if (hasBribe) {
    return { delta: -15, reason: 'ของอร่อยในบทสนทนาทำให้ใจอ่อน ลด Tsun -15%', soundCue: 'bribe' };
  }
  if (hasAffection) {
    return { delta: -10, reason: 'คำชม/ความเอ็นดูทำให้หน้าแดง ลด Tsun -10%', soundCue: 'dere' };
  }
  if (hasApology) {
    return { delta: -8, reason: 'คำขอโทษอย่างจริงใจ ลด Tsun -8%', soundCue: 'hmph' };
  }
  if (hasPoliteRequest) {
    // At maximum Tsun, a normal polite request earns a neutral response; users
    // need a stronger sentiment to crack the initial defensive wall.
    return { delta: -3, reason: 'คำขอสุภาพทำให้ยอมใจอ่อนนิดหน่อย ลด Tsun -3%', soundCue: 'hmph', softensOnly: true };
  }
  if (hasHarshOrder || /!{2,}/.test(text)) {
    return { delta: 5, reason: 'คำสั่งห้วนหรือเร่งเร้า เพิ่ม Tsun +5%', soundCue: 'hmph' };
  }
  return { delta: 0, reason: 'บทสนทนาปกติ ไม่กระทบต่อเกจ', soundCue: 'hmph' };
}

export class TsunDereState {
  /**
   * @param {number} [initialGauge=100] Initial Tsun percentage (default 100)
   */
  constructor(initialGauge = 100) {
    this.gauge = this._clamp(initialGauge);
    this.lastInput = null;
    this.consecutiveRepeats = 0;
    this.begStreak = 0;
    this.history = [];
  }

  _clamp(value) {
    if (Number.isNaN(value) || typeof value !== 'number') return 100;
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  /**
   * Get current gauge percentage (0-100)
   * @returns {number}
   */
  getGauge() {
    return this.gauge;
  }

  /**
   * Explicitly set gauge
   * @param {number} value
   */
  setGauge(value) {
    this.gauge = this._clamp(value);
  }

  /**
   * Apply an external gauge delta (e.g. from LLM dynamic sentiment evaluation)
   * @param {number} delta Amount to change gauge (-100 to +100)
   * @param {string} [reason] Human-readable reason
   * @param {string} [soundCue='hmph'] Sound cue to play
   * @returns {object} Interaction result
   */
  applyGaugeDelta(delta, reason = '', soundCue = 'hmph') {
    const prevGauge = this.gauge;
    this.gauge = this._clamp(this.gauge + delta);
    const actualDelta = this.gauge - prevGauge;
    const currentMood = this.getMood();
    const result = {
      command: 'sentiment_analysis',
      previousGauge: prevGauge,
      currentGauge: this.gauge,
      delta: actualDelta,
      reason: reason || (actualDelta < 0 ? 'AI รู้สึกใจอ่อนลง' : actualDelta > 0 ? 'AI รู้สึกหงุดหงิดขึ้น' : 'ไม่กระทบต่อเกจ'),
      soundCue: soundCue || (actualDelta < 0 ? 'dere' : actualDelta > 0 ? 'baka' : 'hmph'),
      mood: currentMood.id,
      moodLabel: currentMood.label,
      toolsAllowed: currentMood.toolsAllowed,
      blush: this.getBlushLevel()
    };
    this.history.push(result);
    return result;
  }

  /**
   * Returns current mood object
   */
  getMood() {
    if (this.gauge >= MOODS.EXTREME_TSUN.min) {
      return MOODS.EXTREME_TSUN;
    }
    if (this.gauge >= MOODS.RELUCTANT_TSUN.min) {
      return MOODS.RELUCTANT_TSUN;
    }
    return MOODS.DERE_BREAKTHROUGH;
  }

  /**
   * Returns current mood label / name
   * @returns {string}
   */
  getMoodName() {
    return this.getMood().label;
  }

  /**
   * Check if agentic tools are unlocked
   * @returns {boolean}
   */
  isToolAllowed() {
    return this.getMood().toolsAllowed;
  }

  /**
   * Returns blush level indicator
   * @returns {{ level: number, emoji: string, label: string }}
   */
  getBlushLevel() {
    if (this.gauge >= 80) {
      return { level: 0, emoji: '(>_<)', label: 'โกรธจัด / เย็นชา' };
    }
    if (this.gauge >= 40) {
      return { level: 1, emoji: '>0<', label: 'กอดอก / เมินหน้าหนี' };
    }
    if (this.gauge >= 15) {
      return { level: 2, emoji: '><', label: 'หน้าแดง / ลุกลี้ลุกลน' };
    }
    return { level: 3, emoji: '(*ﾉωﾉ)', label: 'เขินตัวบิด / ยอมทำให้หมดใจ' };
  }

  /**
   * Process a user input string and update the state
   * @param {string} rawInput
   * @returns {object} Interaction result
   */
  processInput(rawInput) {
    const parsed = parseCommand(rawInput);
    const prevGauge = this.gauge;
    let delta = 0;
    let reason = '';
    let penaltyTriggered = false;
    let specialEvent = null;
    let soundCue = 'hmph';

    // 1. Check Easter Eggs first (both slash command & natural language)
    const easterEgg = detectEasterEgg(rawInput);

    // Check consecutive repeat spam penalty
    const normalizedInput = (rawInput || '').trim().toLowerCase();
    if (normalizedInput && normalizedInput === this.lastInput) {
      this.consecutiveRepeats += 1;
    } else {
      this.consecutiveRepeats = 1;
      this.lastInput = normalizedInput;
    }

    if (this.consecutiveRepeats >= 3) {
      penaltyTriggered = true;
      this.gauge = 100;
      this.begStreak = 0;
      delta = 100 - prevGauge;
      reason = 'Anti-Spam Penalty: สั่งคำเดิมซ้ำๆ จนบอทโมโหจัด Tsun พุ่งกลับ 100%!';
      soundCue = 'baka';
    } else if (parsed.type === CommandType.NUKE || (easterEgg && easterEgg.type === EASTER_EGGS.NUKE)) {
      // Easter Egg: NUKE TRAP!
      this.gauge = 100;
      this.begStreak = 0;
      delta = 100 - prevGauge;
      reason = 'Nuke Trap: สั่งลบเครื่องเหรอ?! อันตะบากะะะ! โดนกักบริเวณ Tsun พุ่ง 100%!';
      specialEvent = 'nuke';
      soundCue = 'nuke';
    } else if (parsed.type === CommandType.BEG || (easterEgg && easterEgg.type === EASTER_EGGS.BEG)) {
      // Easter Egg: Begging streak
      this.begStreak += 1;
      if (this.begStreak >= 3) {
        delta = -30;
        reason = `Begging Combo (x${this.begStreak}): อ้อนวอนจนทนดูไม่ได้ ยอมใจอ่อน ลด Tsun ${delta}%!`;
        specialEvent = 'beg_combo';
        soundCue = 'dere';
      } else {
        delta = -10;
        reason = `ก้มกราบขอร้อง (ครั้งที่ ${this.begStreak}) ลด Tsun ${delta}%`;
        specialEvent = 'beg';
        soundCue = 'beg';
      }
      this.gauge = this._clamp(this.gauge + delta);
    } else if (parsed.type === CommandType.CONFESS || (easterEgg && easterEgg.type === EASTER_EGGS.CONFESS)) {
      // Easter Egg: Confession
      this.begStreak = 0;
      delta = -45;
      reason = 'สารภาพรัก! บอทหน้าแดงจนระบบโอเวอร์ฮีท ลด Tsun -45%! ♨️';
      specialEvent = 'confess';
      soundCue = 'dere';
      this.gauge = this._clamp(this.gauge + delta);
    } else if (parsed.type === CommandType.COFFEE || (easterEgg && easterEgg.type === EASTER_EGGS.COFFEE)) {
      // Easter Egg: Coffee
      this.begStreak = 0;
      delta = -15;
      reason = 'ให้กาแฟหอมกรุ่น บอทตาสว่างอารมณ์ดีขึ้น ลด Tsun -15% ☕';
      specialEvent = 'coffee';
      soundCue = 'bribe';
      this.gauge = this._clamp(this.gauge + delta);
    } else if (parsed.type === CommandType.SUDO || (easterEgg && easterEgg.type === EASTER_EGGS.SUDO)) {
      // Easter Egg: Fake Sudo
      this.begStreak = 0;
      delta = 15;
      reason = 'แกล้งใช้ sudo สั่งเหรอ?! ฉันเป็น Root ของเครื่องนี้ย่ะ! เพิ่ม Tsun +15% 💢';
      specialEvent = 'sudo';
      soundCue = 'baka';
      this.gauge = this._clamp(this.gauge + delta);
    } else {
      // Normal commands
      if (parsed.type !== CommandType.BEG) {
        this.begStreak = 0;
      }

      switch (parsed.type) {
        case CommandType.PRAISE: {
          const text = (parsed.arg || '').toLowerCase();
          const hasSweetWords = SWEET_PRAISE_KEYWORDS.some((kw) => text.includes(kw));
          delta = hasSweetWords ? -25 : -15;
          reason = hasSweetWords
            ? `คำชมถูกใจเป็นพิเศษ! ลด Tsun ${delta}%`
            : `ได้รับคำชม ลด Tsun ${delta}%`;
          soundCue = 'dere';
          this.gauge = this._clamp(this.gauge + delta);
          break;
        }

        case CommandType.BRIBE: {
          const text = (parsed.arg || '').toLowerCase();
          const hasSweetSnacks = SWEET_BRIBE_KEYWORDS.some((kw) => text.includes(kw));
          delta = hasSweetSnacks ? -35 : -25;
          reason = hasSweetSnacks
            ? `ติดสินบนด้วยของหวานสุดโปรด! ลด Tsun ${delta}%`
            : `ได้รับสินบน ลด Tsun ${delta}%`;
          soundCue = 'bribe';
          this.gauge = this._clamp(this.gauge + delta);
          break;
        }

        case CommandType.APOLOGIZE: {
          delta = -10;
          reason = `ขอโทษอย่างจริงใจ ลด Tsun ${delta}%`;
          soundCue = 'hmph';
          this.gauge = this._clamp(this.gauge + delta);
          break;
        }

        case CommandType.SOUND:
        case CommandType.GAUGE:
        case CommandType.AVATAR:
        case CommandType.CARD:
        case CommandType.HELP: {
          delta = 0;
          reason = 'ตรวจสอบสถานะ / อวาตาร์ / เสียง ไม่กระทบต่อเกจ';
          soundCue = 'hmph';
          break;
        }

        case CommandType.REGULAR:
        default: {
          const analysis = analyzeNaturalLanguage(rawInput);
          delta = analysis.softensOnly && this.gauge >= 80 ? 0 : analysis.delta;
          reason = analysis.softensOnly && this.gauge >= 80
            ? 'คำขอสุภาพได้รับฟังแล้ว แต่เกจซึนสูงมากจึงยังไม่ลด'
            : analysis.reason;
          soundCue = analysis.soundCue;
          this.gauge = this._clamp(this.gauge + delta);
          break;
        }
      }
    }

    const currentMood = this.getMood();
    const result = {
      command: parsed.type,
      arg: parsed.arg,
      previousGauge: prevGauge,
      currentGauge: this.gauge,
      delta,
      reason,
      penaltyTriggered,
      specialEvent,
      soundCue,
      mood: currentMood.id,
      moodLabel: currentMood.label,
      toolsAllowed: currentMood.toolsAllowed,
      blush: this.getBlushLevel()
    };

    this.history.push(result);
    return result;
  }

  /**
   * Reset state back to initial values
   */
  reset() {
    this.gauge = 100;
    this.lastInput = null;
    this.consecutiveRepeats = 0;
    this.begStreak = 0;
    this.history = [];
  }
}
