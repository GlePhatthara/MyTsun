/**
 * CLI Interactive Chat Console for TsunDev
 * Provides an interactive terminal REPL connecting user, TsunDereState, Dynamic Prompt, and LLM Provider.
 */

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { TsunDereState } from '../state/TsunDereState.js';
import { buildDynamicPrompt } from '../prompt/dynamicPrompt.js';
import { createProvider } from '../llm/provider.js';
import { AgenticToolGating } from '../tools/index.js';
import { defaultSound, SoundEngine } from '../sound/index.js';
import {
  renderWelcomeBanner,
  renderStatusCard,
  renderTurnSummary,
  getAvatarLines,
  getCompactFace,
  AVATAR_LEVELS
} from '../ui/index.js';

export class TsunDevChatSession {
  /**
   * @param {object} [options]
   * @param {TsunDereState} [options.state]
   * @param {import('../llm/provider.js').BaseLLMProvider} [options.provider]
   * @param {AgenticToolGating} [options.toolGating]
   * @param {SoundEngine} [options.sound]
   * @param {string} [options.baseDir]
   * @param {number} [options.maxHistory=10]
   */
  constructor(options = {}) {
    this.state = options.state || new TsunDereState(100);
    this.provider = options.provider || createProvider();
    this.toolGating = options.toolGating || new AgenticToolGating({
      state: this.state,
      baseDir: options.baseDir || process.cwd()
    });
    this.sound = options.sound || defaultSound;
    this.history = [];
    this.maxHistory = options.maxHistory || 10;
  }

  /**
   * Parse agentic tool calls from text
   * Formats supported:
   * 1. TOOL_CALL: toolName {"key": "value"}
   * 2. ```tool_call\n{"tool": "writeFile", ...}\n```
   * @param {string} text
   * @returns {Array<{ tool: string, args: object }>}
   */
  parseToolCalls(text) {
    if (!text || typeof text !== 'string') return [];
    const calls = [];

    // Format 1: TOOL_CALL: <name> <json>
    const lineRegex = /TOOL_CALL:\s*([a-zA-Z0-9_-]+)\s*(\{[\s\S]*?\})(?=\n|$)/g;
    let match;
    while ((match = lineRegex.exec(text)) !== null) {
      try {
        const tool = match[1];
        const args = JSON.parse(match[2]);
        calls.push({ tool, args });
      } catch {
        // Skip invalid JSON
      }
    }

    // Format 2: ```tool_call blocks
    const blockRegex = /```tool_call\s*([\s\S]*?)```/g;
    while ((match = blockRegex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed.tool && parsed.args) {
          calls.push({ tool, args: parsed.args });
        } else if (parsed.tool) {
          const { tool, ...rest } = parsed;
          calls.push({ tool, args: rest });
        }
      } catch {
        // Skip invalid JSON
      }
    }

    return calls;
  }

  /**
   * Handle a single user turn and get TsunDev response
   * @param {string} userInput
   * @returns {Promise<{ reply: string, stateDelta: object, gauge: number, mood: object, toolExecution?: object }>}
   */
  async handleTurn(userInput) {
    const trimmed = (userInput || '').trim();
    if (!trimmed) {
      return {
        reply: 'ฮึ่ม! เงียบทำไมยะ?! มีอะไรจะสั่งก็รีบๆ พูดมาสิ!',
        stateDelta: null,
        gauge: this.state.getGauge(),
        mood: this.state.getMood()
      };
    }

    // Process state change
    const stateResult = this.state.processInput(trimmed);
    const mood = this.state.getMood();
    const blush = this.state.getBlushLevel();
    const gauge = this.state.getGauge();

    // 1. Status query (/gauge)
    if (stateResult.command === 'gauge') {
      const statusText = `[สถานะปัจจุบัน: Tsun ${gauge}% | อารมณ์: ${mood.label} ${blush.emoji} | ปลดล็อกเครื่องมือ: ${mood.toolsAllowed ? 'ปลดล็อกแล้ว' : 'ยังล็อกอยู่'}]`;
      return {
        reply: `${statusText}\n${renderStatusCard(this.state, { delta: 0, reason: 'ตรวจสอบสถานะ' })}`,
        stateDelta: stateResult,
        gauge,
        mood
      };
    }

    // 1.1 Avatar query (/avatar)
    if (stateResult.command === 'avatar') {
      const art = getAvatarLines(gauge, { colored: true }).join('\n');
      return {
        reply: `\n${art}\n\n[อวาตาร์สาวซึน: ${mood.label} ${blush.emoji} (Tsun ${gauge}%)]`,
        stateDelta: stateResult,
        gauge,
        mood
      };
    }

    // 1.2 Card query (/card)
    if (stateResult.command === 'card') {
      return {
        reply: renderStatusCard(this.state, { delta: 0 }),
        stateDelta: stateResult,
        gauge,
        mood
      };
    }

    // 1.3 Sound command (/sound)
    if (stateResult.command === 'sound') {
      const sub = (stateResult.arg || '').trim().toLowerCase();
      if (sub === 'on') {
        this.sound.setEnabled(true);
        this.sound.play('dere');
        return {
          reply: '🔊 เปิดระบบ Sound FX เรียบร้อยแล้ว! (เตรียมรับเสียงบ่นสุดคมชัดได้เลยยะ!)',
          stateDelta: stateResult,
          gauge,
          mood
        };
      }
      if (sub === 'off') {
        this.sound.setEnabled(false);
        return {
          reply: '🔇 ปิดระบบ Sound FX แล้ว... ชิ! ไม่อยากได้ยินเสียงฉันขนาดนั้นเลยเหรอ?!',
          stateDelta: stateResult,
          gauge,
          mood
        };
      }
      if (sub.startsWith('play ') || sub.startsWith('test ')) {
        const preset = sub.split(/\s+/)[1] || 'baka';
        this.sound.play(preset);
        return {
          reply: `🎶 เล่นเสียงพรีเซ็ต [${preset}] เรียบร้อยแล้ว!`,
          stateDelta: stateResult,
          gauge,
          mood
        };
      }
      return {
        reply: `[สถานะ Sound FX: ${this.sound.enabled ? 'เปิดใช้งานอยู่ 🔊' : 'ปิดอยู่ 🔇'}]\nใช้ /sound on, /sound off, หรือ /sound play <baka|hmph|dere|nuke|bribe|beg> เพื่อทดสอบเสียง`,
        stateDelta: stateResult,
        gauge,
        mood
      };
    }

    // Play sound cue if triggered
    if (stateResult.soundCue) {
      this.sound.play(stateResult.soundCue);
    }

    // 1.4 Special Easter Egg Events
    if (stateResult.specialEvent === 'nuke') {
      const art = getAvatarLines(AVATAR_LEVELS.MELTDOWN, { colored: true }).join('\n');
      return {
        reply: `${art}\n\n\x1b[31;1m[🚨 DANGER ALERT! NUKE TRAP TRIGGERED! 🚨]\x1b[0m\n` +
          `ห-หาาาาาาา?! คิดจะทำบ้าอะไรยะ?! จะลบเครื่องทิ้งเหรอ?! อันตะบากะะะะะะะะะ! 💥🔥\n` +
          `โดนกักบริเวณห้ามแตะเทอร์มินัลเด็ดขาดเลยไป๊! ล็อกระบบหมดแล้วยะ! (Tsun พุ่ง 100%!) 💢`,
        stateDelta: stateResult,
        gauge: this.state.getGauge(),
        mood: this.state.getMood()
      };
    }

    if (stateResult.specialEvent === 'confess') {
      const art = getAvatarLines(AVATAR_LEVELS.CRITICAL_BLUSH, { colored: true }).join('\n');
      return {
        reply: `${art}\n\n\x1b[35;1m[💥 CRITICAL BLUSH OVERHEAT 9999°C! ♨️]\x1b[0m\n` +
          `ว-ว้ายยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยยันล่ะยะ! ต-ตกใจหมดเลย! หน้าแดงจนจะเป็นบ้าอยู่แล้วเนี่ย! อือออออ! ฉันแค่ช่วยเพราะไม่อยากให้เธอมาบ่นว่าไม่มีใครเขียนโค้ดให้นั่นแหละ! บ้าจริง!!`,
        stateDelta: stateResult,
        gauge: this.state.getGauge(),
        mood: this.state.getMood()
      };
    }

    if (stateResult.specialEvent === 'beg_combo') {
      return {
        reply: `ด-เดี๋ยวสิ! อย่ามาคุกเข่ากราบแบบนั้นนะคนบ้า! อายคนอื่นเขาบ้างสิยะ... ก-ก็ได้ ยอมทำให้หน่อยนึงก็ได้! แต่รอบนี้รอบเดียวนะ ครั้งหน้าไม่ทำให้แล้วนะ!! 😳`,
        stateDelta: stateResult,
        gauge: this.state.getGauge(),
        mood: this.state.getMood()
      };
    }

    if (stateResult.specialEvent === 'coffee') {
      return {
        reply: `ขอบใจสำ... เอ๊ย! ไม่ได้ขอสักหน่อย! กาแฟน่ะเอามาวางไว้ตรงนั้นแหละ... (ซดอึกๆ) อ-อื้ม ก็รสชาติดีอยู่หรอก... แปรงฟันมาหรือยังเนี่ย?! แต่ยอมช่วยคุยด้วยต่ออีกนิดก็ได้! ☕`,
        stateDelta: stateResult,
        gauge: this.state.getGauge(),
        mood: this.state.getMood()
      };
    }

    if (stateResult.specialEvent === 'sudo') {
      return {
        reply: `หึ! นึกว่าพิมพ์ sudo แล้วฉันจะกลัวเหรอ?! ฉันเป็น root สูงสุดของระบบนี้นะยะ! คำสั่งพวกเด็กอนุบาลแบบนี้ไปสั่งคนอื่นเลยไป๊! 💢`,
        stateDelta: stateResult,
        gauge: this.state.getGauge(),
        mood: this.state.getMood()
      };
    }

    // 2. Direct Tool Commands: /write
    if (stateResult.command === 'write') {
      const parts = stateResult.arg.split(/\s+/);
      const filePath = parts[0];
      const content = parts.slice(1).join(' ');

      if (!filePath) {
        return {
          reply: 'ฮึ่ม! จะสั่ง /write ก็ระบุชื่อไฟล์ด้วยสิยะ! เช่น /write test.txt ข้อความ 💢',
          stateDelta: stateResult,
          gauge,
          mood
        };
      }

      const execResult = await this.toolGating.execute('writeFile', { filePath, content });
      let reply = execResult.message;
      if (execResult.blocked) {
        reply = `\x1b[31m[TOOL BLOCKED ⛔]\x1b[0m ${execResult.message}\n(เกจ Tsun ปัจจุบัน: ${gauge}% - ต้องลดให้ต่ำกว่า 40% ก่อนนะยะ!)`;
      } else if (execResult.success) {
        reply = `\x1b[32m[TOOL SUCCESS ✅]\x1b[0m ${execResult.message}\nเขียนไฟล์ "${execResult.result.filePath}" (${execResult.result.bytesWritten} bytes) เรียบร้อยแล้ว!`;
      } else {
        reply = `(เกิดข้อผิดพลาดในการเขียนไฟล์: ${execResult.error})`;
      }

      return {
        reply,
        stateDelta: stateResult,
        gauge,
        mood,
        toolExecution: execResult
      };
    }

    // 3. Direct Tool Commands: /run
    if (stateResult.command === 'run') {
      const command = stateResult.arg;
      if (!command) {
        return {
          reply: 'ฮึ่ม! จะสั่ง /run ก็ใส่คำสั่งเชลล์มาด้วยสิยะ! เช่น /run node -v 💢',
          stateDelta: stateResult,
          gauge,
          mood
        };
      }

      const execResult = await this.toolGating.execute('runCommand', { command });
      let reply = execResult.message;
      if (execResult.blocked) {
        reply = `\x1b[31m[TOOL BLOCKED ⛔]\x1b[0m ${execResult.message}\n(เกจ Tsun ปัจจุบัน: ${gauge}% - คำสั่งโดนล็อก ต้องง้อให้ Dere ก่อน!)`;
      } else if (execResult.success) {
        const out = execResult.result.stdout || execResult.result.stderr || '(ไม่มี output)';
        reply = `\x1b[32m[TOOL SUCCESS ✅]\x1b[0m ${execResult.message}\n\n[Output]:\n${out}`;
      } else {
        reply = `(เกิดข้อผิดพลาดในการรันคำสั่ง: ${execResult.error})`;
      }

      return {
        reply,
        stateDelta: stateResult,
        gauge,
        mood,
        toolExecution: execResult
      };
    }

    // 4. Direct Tool Commands: /tool
    if (stateResult.command === 'tool') {
      const parts = stateResult.arg.split(/\s+/);
      const toolName = parts[0];
      const jsonStr = parts.slice(1).join(' ');
      let args = {};
      if (jsonStr) {
        try {
          args = JSON.parse(jsonStr);
        } catch {
          args = { input: jsonStr };
        }
      }

      const execResult = await this.toolGating.execute(toolName, args);
      let reply = execResult.message;
      if (execResult.blocked) {
        reply = `\x1b[31m[TOOL BLOCKED ⛔]\x1b[0m ${execResult.message}`;
      } else if (execResult.success) {
        reply = `\x1b[32m[TOOL SUCCESS ✅]\x1b[0m ${execResult.message}\n${JSON.stringify(execResult.result, null, 2)}`;
      } else {
        reply = `(เกิดข้อผิดพลาด: ${execResult.error || execResult.reason})`;
      }

      return {
        reply,
        stateDelta: stateResult,
        gauge,
        mood,
        toolExecution: execResult
      };
    }

    // Build dynamic prompt based on updated state
    const systemInstruction = buildDynamicPrompt(this.state, {
      lastReason: stateResult.reason,
      lastCommand: stateResult.command
    });

    // Call LLM provider
    let reply = '';
    let executedTools = [];
    try {
      reply = await this.provider.generate({
        prompt: trimmed,
        systemInstruction,
        history: this.history,
        temperature: 0.7
      });

      // Check if LLM emitted any tool calls
      const toolCalls = this.parseToolCalls(reply);
      for (const call of toolCalls) {
        const execRes = await this.toolGating.execute(call.tool, call.args);
        executedTools.push(execRes);
        if (execRes.blocked) {
          reply += `\n\n[⛔ TsunDev Gating: สกัดกั้น Tool "${call.tool}"! ${execRes.message}]`;
        } else if (execRes.success) {
          reply += `\n\n[✅ TsunDev Gating: ดำเนินการ Tool "${call.tool}" สำเร็จ! ${execRes.message}]`;
        }
      }
    } catch (err) {
      reply = `(เกิดข้อผิดพลาดในการเชื่อมต่อ LLM: ${err.message})\nฮึ่ม! ระบบขัดข้องงั้นเหรอ?! ช-ช่วยไม่ได้ คราวนี้จะยกประโยชน์ให้จำเลยไปก่อนแล้วกัน!`;
    }

    // Append to conversation history
    this.history.push({ role: 'user', content: trimmed });
    this.history.push({ role: 'assistant', content: reply });

    // Truncate history if exceeding maximum length
    if (this.history.length > this.maxHistory * 2) {
      this.history = this.history.slice(-this.maxHistory * 2);
    }

    return {
      reply,
      stateDelta: stateResult,
      gauge,
      mood,
      toolExecution: executedTools.length > 0 ? executedTools : undefined
    };
  }
}

/**
 * Starts interactive CLI chat loop
 */
export async function startCliChat(options = {}) {
  const session = new TsunDevChatSession(options);
  const rl = readline.createInterface({ input, output });

  console.log(renderWelcomeBanner({
    provider: session.provider.name,
    model: session.provider.model
  }));
  console.log(renderStatusCard(session.state, { colored: true }));
  console.log('');

  try {
    while (true) {
      const line = await rl.question('\x1b[1;36mYou >\x1b[0m ');
      const trimmed = line.trim();

      if (trimmed.toLowerCase() === '/exit' || trimmed.toLowerCase() === 'exit') {
        console.log('\n\x1b[35mTsunDev >\x1b[0m ฮึ่ม! จะไปไหนก็ไปเลยนะ! ไม่ได้ง้อให้อยู่ต่อสักหน่อย... บ๊ายบายย่ะ! 💢\n');
        break;
      }

      if (trimmed.toLowerCase() === '/reset') {
        session.state.reset();
        session.history = [];
        console.log('\n[รีเซ็ตเกจ Tsun กลับสู่ 100% เรียบร้อยแล้ว]\n');
        console.log(renderStatusCard(session.state, { colored: true }));
        console.log('');
        continue;
      }

      const result = await session.handleTurn(trimmed);

      // Print quick status summary
      console.log(`\n${renderTurnSummary(result, session.state, true)}`);
      console.log(`\x1b[35mTsunDev >\x1b[0m ${result.reply}\n`);
    }
  } finally {
    rl.close();
  }
}
