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
You have access to the following agentic tools (similar to Antigravity/AGY, Claude Code, and Codex):
1. readFile: {"filePath": "relative/or/absolute/path"} - Read content of an existing file.
2. writeFile: {"filePath": "path", "content": "text content"} - Write or overwrite a file.
3. runCommand: {"command": "terminal shell command"} - Execute a shell command safely.
4. listDirectory: {"dirPath": "."} - List files and directories in path.

When you need to perform an action, use the following format:
Thought: Describe what you plan to do.
Action: toolName (must be one of: readFile, writeFile, runCommand, listDirectory)
Action Input: {"key": "value"} (valid JSON object)

After you receive an Observation, continue thinking or provide your final response:
Thought: I have finished the task.
Final Answer: [Your complete response in Thai tsundere tone]
`;
    return `${systemPrompt}\n\n${toolsDescription}`;
  }

  /**
   * Parses Action and Action Input from model generation
   */
  parseAction(text) {
    if (!text || typeof text !== 'string') return null;

    const actionMatch = text.match(/Action:\s*([a-zA-Z0-9_-]+)/i);
    const inputMatch = text.match(/Action Input:\s*({[\s\S]*?}|\[[\s\S]*?\]|"[^"]*"|[^\n]+)/i);

    if (actionMatch && inputMatch) {
      const toolName = actionMatch[1].trim();
      let toolInput = {};
      const rawInput = inputMatch[1].trim();

      try {
        toolInput = JSON.parse(rawInput);
      } catch {
        // Fallback for simple string inputs
        if (toolName === 'readFile') toolInput = { filePath: rawInput.replace(/^"|"$/g, '') };
        else if (toolName === 'runCommand') toolInput = { command: rawInput.replace(/^"|"$/g, '') };
        else if (toolName === 'listDirectory') toolInput = { dirPath: rawInput.replace(/^"|"$/g, '') };
        else toolInput = { raw: rawInput };
      }

      return { toolName, toolInput };
    }

    return null;
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
        }

        steps.push({
          step: iteration,
          type: 'finish',
          output: finalAnswer
        });

        if (onStep) onStep({ step: iteration, type: 'finish', output: finalAnswer });

        return {
          reply: finalAnswer,
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
