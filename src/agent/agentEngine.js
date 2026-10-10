import { AgenticToolGating, GatingStatus } from '../tools/toolGating.js';
import { TsunDereState } from '../state/TsunDereState.js';

/**
 * Autonomous Agent Engine for myTsun
 * Operates like AGY (Antigravity), Claude Code, and OpenAI Codex:
 * Executes multi-step ReAct loops (Thought -> Action -> Observation -> Final Solution)
 * gated by Tsun-Dere mood level.
 */
export class AgentEngine {
  /**
   * @param {object} options
   * @param {object} options.provider Active LLM Provider
   * @param {TsunDereState} options.state TsunDere state instance
   * @param {string} [options.baseDir] Project working directory
   * @param {number} [options.maxSteps=4] Maximum iteration steps per task
   * @param {boolean} [options.authorizedAgent=true] User explicitly enabled agent mode
   */
  constructor(options = {}) {
    this.provider = options.provider;
    this.state = options.state || new TsunDereState(100);
    this.baseDir = options.baseDir || process.cwd();
    this.maxSteps = options.maxSteps || 4;
    this.authorizedAgent = options.authorizedAgent ?? true;
    this.gating = new AgenticToolGating({
      state: this.state,
      baseDir: this.baseDir
    });
  }

  /**
   * Builds the Agent System prompt describing tools and ReAct format
   */
  buildAgentInstructions(systemPrompt = '') {
    const toolsDescription = `
# AUTONOMOUS AGENT EXECUTION RULES:
You have access to the following agentic tools:
1. readFile: {"filePath": "relative/or/absolute/path"} - Read content of an existing file.
2. writeFile: {"filePath": "path", "content": "text content"} - Write or overwrite a file.
3. runCommand: {"command": "terminal shell command"} - Execute a shell command safely.
4. listDirectory: {"dirPath": "."} - List files and directories in path.

CRITICAL EXECUTION PROTOCOL:
- When using tools, be QUIET. Do NOT output any roleplay greetings, character signatures, or conversational dialogue before or during Action execution!
- Output ONLY internal reasoning and tool calls in this exact format:
Thought: Brief internal reasoning in English or concise Thai.
Action: toolName (one of: readFile, writeFile, runCommand, listDirectory)
Action Input: {"key": "value"} (valid JSON object)

- When all tool actions are completed, provide your user-facing response ONLY in Final Answer:
Thought: I have finished the task.
Final Answer: [Your complete dialogue in Thai tsundere tone]

CRITICAL PERSONA CONSISTENCY:
- Maintain STRICTLY ONE consistent emotional mood in Final Answer aligned with your current status.
- NEVER switch back and forth between different moods in the same reply (do NOT mix Dere and Extreme Tsun together).
- Do NOT simulate fake files like baka.c or fake conversations. Just deliver the requested work with your tsundere personality!
`;
    return `${systemPrompt}\n\n${toolsDescription}`;
  }

  /**
   * Parses Action and Action Input from model generation
   */
  parseAction(text) {
    if (!text || typeof text !== 'string') return null;

    const actionMatch = text.match(/Action:\s*([a-zA-Z0-9_-]+)/i);
    if (!actionMatch) return null;
    const toolName = actionMatch[1].trim();

    // Look for Action Input block up until the next section (Observation, Thought, Final Answer) or end of text
    const inputMatch = text.match(/Action Input:\s*([\s\S]*?)(?=\n\s*(?:Observation|Thought:|Final Answer:|$))/i);
    if (!inputMatch) return null;

    let raw = inputMatch[1].trim();
    // Strip markdown code fences if model wrapped the input in ```json ... ```
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let toolInput = {};

    // 1. Try direct JSON parse
    try {
      toolInput = JSON.parse(raw);
      return { toolName, toolInput };
    } catch {}

    // 2. If direct parse failed, extract the balanced outer JSON block
    const firstBrace = raw.search(/[{[]/);
    if (firstBrace !== -1) {
      const openChar = raw[firstBrace];
      const closeChar = openChar === '{' ? '}' : ']';
      let depth = 0;
      let inString = false;
      let escape = false;
      let endIndex = -1;

      for (let i = firstBrace; i < raw.length; i++) {
        const ch = raw[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === '\\') {
          escape = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (ch === openChar) depth++;
          else if (ch === closeChar) {
            depth--;
            if (depth === 0) {
              endIndex = i;
              break;
            }
          }
        }
      }

      if (endIndex !== -1) {
        const jsonCandidate = raw.slice(firstBrace, endIndex + 1);
        try {
          toolInput = JSON.parse(jsonCandidate);
          return { toolName, toolInput };
        } catch {}
      }
    }

    // 3. Fallback for simple string inputs
    if (toolName === 'readFile') toolInput = { filePath: raw.replace(/^"|"$/g, '').trim() };
    else if (toolName === 'runCommand') toolInput = { command: raw.replace(/^"|"$/g, '').trim() };
    else if (toolName === 'listDirectory') toolInput = { dirPath: raw.replace(/^"|"$/g, '').trim() };
    else toolInput = { raw };

    return { toolName, toolInput };
  }

  /**
   * Executes the autonomous agent loop
   * @param {object} params
   * @param {string} params.prompt User task / goal
   * @param {string} [params.systemInstruction]
   * @param {Array} [params.history]
   * @param {Function} [params.onStep] Step callback for UI telemetry
   * @returns {Promise<{ reply: string, steps: Array, toolCallsCount: number }>}
   */
  async run({ prompt, systemInstruction = '', history = [], onStep = null }) {
    const steps = [];
    let currentScratchpad = `User Task: ${prompt}\n`;
    let iteration = 0;
    const fullSystemInstruction = this.buildAgentInstructions(systemInstruction);

    while (iteration < this.maxSteps) {
      iteration++;

      // Query the provider
      const modelOutput = await this.provider.generate({
        prompt: currentScratchpad,
        systemInstruction: fullSystemInstruction,
        history,
        temperature: 0.2
      });

      const parsedAction = this.parseAction(modelOutput);

      if (!parsedAction) {
        // No tool action needed; model answered directly
        let finalAnswer = modelOutput;
        const finalMatch = modelOutput.match(/Final Answer:\s*([\s\S]+)$/i);
        if (finalMatch) {
          finalAnswer = finalMatch[1].trim();
        } else {
          // If no explicit Final Answer prefix, strip out any stray Thought/Action/Observation lines
          finalAnswer = finalAnswer
            .replace(/(?:^|\n)Thought:[\s\S]*?(?=\n(?:Action:|Final Answer:|$))/gi, '')
            .replace(/(?:^|\n)Action:[\s\S]*?(?=\n(?:Action Input:|Observation:|$))/gi, '')
            .replace(/(?:^|\n)Action Input:[\s\S]*?(?=\n(?:Observation:|Final Answer:|$))/gi, '')
            .replace(/(?:^|\n)Observation:[\s\S]*?(?=\n(?:Thought:|Final Answer:|$))/gi, '')
            .trim();
        }

        // Clean any signature leaks if duplicated
        finalAnswer = finalAnswer.replace(/(?:^|\n)(?:มัลฟอยด์|myTsun)\s*\([^\)]*\)\s*(?=\n|$)/gi, '\n').trim();

        steps.push({
          step: iteration,
          type: 'finish',
          output: finalAnswer
        });

        if (onStep) onStep({ step: iteration, type: 'finish', output: finalAnswer });

        return {
          reply: finalAnswer || modelOutput,
          steps,
          toolCallsCount: steps.filter(s => s.type === 'tool_execution').length
        };
      }

      // Execute tool through Tsun-Dere Gating
      const { toolName, toolInput } = parsedAction;
      let executionResult;

      try {
        executionResult = await this.gating.execute(toolName, toolInput, {
          authorizedAgent: this.authorizedAgent
        });
      } catch (err) {
        executionResult = {
          success: false,
          status: GatingStatus.BLOCKED,
          error: err.message
        };
      }

      const observationStr = executionResult.success
        ? JSON.stringify(executionResult.result, null, 2)
        : `Tool Error [${executionResult.status}]: ${executionResult.error || executionResult.message || 'Execution failed'}`;

      const stepRecord = {
        step: iteration,
        type: 'tool_execution',
        toolName,
        toolInput,
        targetFile: toolInput?.filePath || toolInput?.path || executionResult?.result?.filePath || null,
        status: executionResult.status,
        success: executionResult.success,
        observation: observationStr
      };

      steps.push(stepRecord);
      if (onStep) onStep(stepRecord);

      // Append to scratchpad for the next ReAct iteration
      currentScratchpad += `\n${modelOutput}\nObservation: ${observationStr}\n`;
    }

    // If max steps reached
    const finalAnswer = `งานนี้ขั้นตอนเยอะเกินไปแล้วนะยะ! ฉันทำไปตั้ง ${this.maxSteps} ขั้นตอนแล้ว! ตรวจสอบผลลัพธ์ในโปรเจกต์เองละกัน ช-ช่างเถอะ!`;
    return {
      reply: finalAnswer,
      steps,
      toolCallsCount: steps.length
    };
  }
}
