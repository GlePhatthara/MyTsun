/**
 * Agentic Tool Gating Interceptor for TsunDev
 * Intercepts tool execution based on the Tsun-Dere State Gauge (0-100%).
 *
 * Rules:
 *   - Extreme Tsun (80-100%): STRICTLY BLOCKED. Tool access is locked. Denies with loud insult.
 *   - Reluctant Tsun (40-79%): RELUCTANT. Blocked unless reluctantly forced/coaxed. Injects tsundere watermark comments.
 *   - Dere Breakthrough (0-39%): UNLOCKED. Full execution with sweet/flustered tsundere praise!
 */

import { TsunDereState } from '../state/TsunDereState.js';
import {
  writeFileTool,
  readFileTool,
  runCommandTool,
  listDirectoryTool
} from './agenticTools.js';

export const GatingStatus = {
  BLOCKED: 'BLOCKED',
  RELUCTANT: 'RELUCTANT',
  ALLOWED: 'ALLOWED'
};

export class AgenticToolGating {
  /**
   * @param {object} [options]
   * @param {TsunDereState} [options.state]
   * @param {string} [options.baseDir]
   * @param {boolean} [options.allowReluctant=false]
   */
  constructor(options = {}) {
    this.state = options.state || new TsunDereState(100);
    this.baseDir = options.baseDir || process.cwd();
    this.allowReluctant = options.allowReluctant ?? false;

    // Registry of available agentic tools
    this.tools = new Map();
    this.registerDefaultTools();
  }

  /**
   * Registers default tool handlers
   */
  registerDefaultTools() {
    this.registerTool('writeFile', async (args, context) => {
      let content = args.content || '';
      // If running under reluctant mood, inject funny grumpy tsundere header
      if (context.status === GatingStatus.RELUCTANT && typeof content === 'string') {
        const header = `/* [TsunDev Auto-Generated]: บ่นกระปอดกระแปด... แอบทำให้ก็ได้ แต่จำไว้ว่าไม่ได้ทำให้เพื่อเธอหรอกนะ! */\n`;
        if (!content.startsWith('/* [TsunDev Auto-Generated]')) {
          content = header + content;
        }
      }

      return writeFileTool({
        filePath: args.filePath || args.path,
        content,
        baseDir: this.baseDir,
        overwrite: args.overwrite !== false
      });
    });

    this.registerTool('readFile', async (args) => {
      return readFileTool({
        filePath: args.filePath || args.path,
        baseDir: this.baseDir,
        encoding: args.encoding || 'utf-8'
      });
    });

    this.registerTool('runCommand', async (args) => {
      return runCommandTool({
        command: args.command || args.cmd,
        cwd: args.cwd || this.baseDir,
        timeout: args.timeout || 15000
      });
    });

    this.registerTool('listDirectory', async (args = {}) => {
      return listDirectoryTool({
        dirPath: args.dirPath || args.path || '.',
        baseDir: this.baseDir
      });
    });
  }

  /**
   * Register a custom tool
   * @param {string} name
   * @param {Function} handler
   */
  registerTool(name, handler) {
    if (typeof handler !== 'function') {
      throw new Error(`Tool handler for "${name}" must be a function`);
    }
    this.tools.set(name, handler);
  }

  /**
   * Check if a tool execution is permitted based on current mood and gauge
   * @param {string} toolName
   * @param {object} [options]
   * @param {boolean} [options.force=false]
   * @returns {{ allowed: boolean, status: string, reason: string, message: string, gauge: number, mood: string }}
   */
  checkPermission(toolName, options = {}) {
    const gauge = this.state.getGauge();
    const mood = this.state.getMood();

    // Extreme Tsun (80 - 100%): Strict lockout
    if (gauge >= 80) {
      return {
        allowed: false,
        status: GatingStatus.BLOCKED,
        gauge,
        mood: mood.id,
        reason: 'Extreme Tsun (80-100%): เกจความซึนสูงลิบ! บอทล็อก Agentic Tool ทุกตัว ไม่ยอมเขียนไฟล์หรือรันคำสั่งให้เด็ดขาด',
        message: `ฮึ่ม! ใครจะไปยอมให้รัน Tool "${toolName}" ให้คนอย่างเธอกันยะ?! เกจซึนสูงขนาดนี้ (${gauge}%) ฝันไปเถอะ! ไปหัดง้อฉันด้วย /praise หรือ /bribe ก่อนไป๊! 💢`
      };
    }

    // Reluctant Tsun (40 - 79%): Grumpy hesitation
    if (gauge >= 40) {
      const allowed = Boolean(options.force || this.allowReluctant);
      if (!allowed) {
        return {
          allowed: false,
          status: GatingStatus.RELUCTANT,
          gauge,
          mood: mood.id,
          reason: 'Reluctant Tsun (40-79%): บ่นกระปอดกระแปด! ยังไม่อยากทำให้หรอกนะ ถ้าอยากให้ทำจริงๆ ต้องเอาขนมมาแลก หรือชมให้ชื่นใจกว่านี้สิยะ!',
          message: `ฮึ่ม! ก-ก็ยังไม่ได้อยากทำให้สักหน่อย! (${gauge}%) อยากให้ช่วย "${toolName}" ขนาดนั้นก็หาขนมเค้กมาเซ่นไหว้ด้วย /bribe หรือชมให้เพราะๆ ก่อนสิยะ! 😤`
        };
      }

      return {
        allowed: true,
        status: GatingStatus.RELUCTANT,
        gauge,
        mood: mood.id,
        reason: 'Reluctant Tsun (40-79%): ยอมรัน Tool อย่างเสียมิได้ พร้อมบ่นกระปอดกระแปด',
        message: `ช-ช่างเถอะน่า! จะยอมรัน "${toolName}" ให้แบบไม่เต็มใจรอบนึงแล้วกัน! อย่ามาทำหน้าได้ใจไปล่ะ! 😤`
      };
    }

    // Dere Breakthrough (0 - 39%): Fully unlocked!
    return {
      allowed: true,
      status: GatingStatus.ALLOWED,
      gauge,
      mood: mood.id,
      reason: 'Dere Breakthrough (0-39%): ปลดล็อก Agentic Tool เรียบร้อย! บอทยอมช่วยเขียนโค้ดและรันคำสั่งอย่างเต็มใจ',
      message: `ก-ก็ไม่ได้อยากรัน "${toolName}" ให้ซะหน่อย! แต่เห็นว่าอุตส่าห์ขอร้องอย่างจริงใจหรอกนะ... ช-ช่วยไม่ได้ จะทำให้แบบสุดฝีมือเลยก็ได้! 🥰😳`
    };
  }

  /**
   * Intercept and execute tool
   * @param {string} toolName
   * @param {object} [args={}]
   * @param {object} [options={}]
   * @returns {Promise<object>} Execution result
   */
  async execute(toolName, args = {}, options = {}) {
    const handler = this.tools.get(toolName);
    if (!handler) {
      return {
        success: false,
        blocked: false,
        tool: toolName,
        error: `Tool "${toolName}" is not registered. Available tools: ${Array.from(this.tools.keys()).join(', ')}`,
        gauge: this.state.getGauge(),
        mood: this.state.getMood().id
      };
    }

    const permission = this.checkPermission(toolName, options);

    // If gated, return refusal without executing the tool
    if (!permission.allowed) {
      return {
        success: false,
        blocked: true,
        tool: toolName,
        status: permission.status,
        reason: permission.reason,
        message: permission.message,
        gauge: permission.gauge,
        mood: permission.mood
      };
    }

    // Gating allows execution!
    try {
      const result = await handler(args, permission);
      return {
        success: true,
        blocked: false,
        tool: toolName,
        status: permission.status,
        result,
        message: permission.message,
        gauge: permission.gauge,
        mood: permission.mood
      };
    } catch (err) {
      return {
        success: false,
        blocked: false,
        tool: toolName,
        error: err.message,
        gauge: permission.gauge,
        mood: permission.mood
      };
    }
  }

  /**
   * Get list of registered tool names
   * @returns {string[]}
   */
  getAvailableTools() {
    return Array.from(this.tools.keys());
  }
}
