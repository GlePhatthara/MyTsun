/**
 * TsunDev (ツンDev)
 * The Tsundere AI Pair-Programmer for Stupid Hackathon Thailand (SHTX)
 */

export { TsunDereState, MOODS } from './state/TsunDereState.js';
export { parseCommand, CommandType } from './commands/parser.js';
export { buildDynamicPrompt, PERSONA_PROMPTS } from './prompt/dynamicPrompt.js';
export {
  BaseLLMProvider,
  MockProvider,
  GeminiProvider,
  OpenAICompatibleProvider,
  createProvider
} from './llm/provider.js';
export { TsunDevChatSession, startCliChat } from './cli/chat.js';
export * from './ui/index.js';
export * from './tools/index.js';
export * from './sound/index.js';
export * from './easter/index.js';

// Auto-run interactive chat if executed directly via CLI
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  import('./cli/chat.js').then(({ startCliChat }) => {
    startCliChat().catch(console.error);
  });
}
