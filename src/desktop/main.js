import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { TsunDereState, MOODS } from '../state/TsunDereState.js';
import { parseCommand, CommandType } from '../commands/parser.js';
import { buildDynamicPrompt } from '../prompt/dynamicPrompt.js';
import { createProvider, GeminiProvider, OpenAICompatibleProvider, ClaudeProvider } from '../llm/provider.js';
import { accountManager } from '../auth/accountManager.js';
import { AgentEngine } from '../agent/agentEngine.js';
import { detectEasterEgg } from '../easter/index.js';
import { generatePaxaTTS, PAXALABS_DEFAULT_KEY, PAXALABS_DEFAULT_VOICE, PAXALABS_DEFAULT_MODEL } from '../tts/paxaTTS.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Settings storage path in User's Home directory
const CONFIG_DIR = path.join(os.homedir(), '.tsundev');
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json');

// Workspace directory (defaults to null / None until selected)
let currentWorkspace = null;

const DEFAULT_SETTINGS = {
  // Display names are kept separately from provider settings so they persist
  // when the user switches models.
  userName: '',
  aiName: 'MyTsun',
  activeProvider: 'gemini',
  agenticMode: true,
  providers: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-3.5-flash',
      label: 'Google Gemini'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o',
      baseUrl: 'https://api.openai.com/v1',
      label: 'OpenAI'
    },
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-7-sonnet-20250219',
      label: 'Anthropic Claude'
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: 'meta-llama/llama-3.3-70b-instruct',
      baseUrl: 'https://openrouter.ai/api/v1',
      label: 'OpenRouter'
    },
    ollama: {
      apiKey: 'ollama',
      model: 'llama3.3',
      baseUrl: 'http://localhost:11434/v1',
      label: 'Local Ollama'
    },
    mock: {
      label: 'Mock / Demo Mode (No API Key)'
    }
  },
  soundEnabled: true,
  tts: {
    enabled: true,
    apiKey: process.env.PAXALABS_API_KEY || PAXALABS_DEFAULT_KEY,
    voice: PAXALABS_DEFAULT_VOICE,
    model: PAXALABS_DEFAULT_MODEL
  }
};

function loadSettings() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        providers: {
          ...DEFAULT_SETTINGS.providers,
          ...(data.providers || {})
        },
        tts: {
          ...DEFAULT_SETTINGS.tts,
          ...(data.tts || {})
        }
      };
    }
  } catch (err) {
    console.error('Failed to read settings:', err);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings) {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return false;
  }
}

function normalizeDisplayName(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  // Names are displayed in the UI and included in a system prompt. Keep them
  // short and remove control characters so they cannot alter either surface.
  const name = value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 40);
  return name || fallback;
}

// Global state
let currentSettings = loadSettings();
const stateMachine = new TsunDereState(100); // starts at 100% Extreme Tsun
let chatHistory = [];

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'green-heart.png');
  mainWindow = new BrowserWindow({
    width: 1160,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    title: 'MyTsun',
    backgroundColor: '#0f1117',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ================= IPC HANDLERS =================

// Account Authentication Handlers
ipcMain.handle('auth:detect', async () => {
  return await accountManager.detectSystemSessions();
});

ipcMain.handle('auth:get', async () => {
  return accountManager.loadAccounts();
});

ipcMain.handle('auth:set', async (_event, { provider, accountData }) => {
  accountManager.setAccount(provider, accountData);
  return accountManager.loadAccounts();
});

ipcMain.handle('auth:logout', async (_event, provider) => {
  accountManager.logout(provider);
  return accountManager.loadAccounts();
});

// Get settings
ipcMain.handle('settings:get', async () => {
  return currentSettings;
});

// Save settings
ipcMain.handle('settings:save', async (_event, newSettings) => {
  const safeSettings = {
    ...newSettings,
    userName: normalizeDisplayName(newSettings?.userName),
    aiName: normalizeDisplayName(newSettings?.aiName, DEFAULT_SETTINGS.aiName)
  };
  currentSettings = { ...currentSettings, ...safeSettings };
  const ok = saveSettings(currentSettings);
  return { success: ok, settings: currentSettings };
});

// PaxaLabs TTS Audio Generation Handler
ipcMain.handle('tts:generate', async (_event, { text, options } = {}) => {
  try {
    const ttsConf = currentSettings.tts || {};
    const res = await generatePaxaTTS(text, {
      apiKey: ttsConf.apiKey || PAXALABS_DEFAULT_KEY,
      voice: ttsConf.voice || PAXALABS_DEFAULT_VOICE,
      model: ttsConf.model || PAXALABS_DEFAULT_MODEL,
      mood: stateMachine.getMood(),
      gauge: stateMachine.getGauge(),
      ...(options || {})
    });
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Workspace Handlers
ipcMain.handle('workspace:get', async () => {
  if (!currentWorkspace) {
    return {
      path: null,
      name: 'None'
    };
  }
  return {
    path: currentWorkspace,
    name: path.basename(currentWorkspace) || currentWorkspace
  };
});

ipcMain.handle('workspace:select', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'เลือกโฟลเดอร์ Workspace',
    defaultPath: currentWorkspace || os.homedir(),
    properties: ['openDirectory', 'createDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    currentWorkspace = result.filePaths[0];
    return {
      success: true,
      path: currentWorkspace,
      name: path.basename(currentWorkspace) || currentWorkspace
    };
  }
  return {
    success: false,
    path: currentWorkspace,
    name: currentWorkspace ? (path.basename(currentWorkspace) || currentWorkspace) : 'None'
  };
});

// Test Provider Connection
ipcMain.handle('settings:test-connection', async (_event, providerConfig) => {
  const startTime = Date.now();
  try {
    const provider = createProvider(providerConfig);
    const testReply = await provider.generate({
      prompt: 'Ping! ตอบแค่ 1 คำสั้นๆ ว่า "Pong"',
      systemInstruction: 'Respond only with Pong',
      temperature: 0.1
    });
    const latency = Date.now() - startTime;
    return { success: true, latency, reply: testReply };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Model IDs vary by account, region, and provider plan.  Fetch the models
// exposed to the user's own Gemini key instead of maintaining a stale list.
ipcMain.handle('settings:list-models', async (_event, providerConfig) => {
  try {
    if (providerConfig?.provider !== 'gemini') {
      return { success: false, error: 'Model discovery is currently available for Gemini only.' };
    }
    const provider = new GeminiProvider(providerConfig);
    return { success: true, models: await provider.listModels() };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Get current mood state
ipcMain.handle('state:get', async () => {
  return {
    gauge: stateMachine.getGauge(),
    mood: stateMachine.getMood(),
    moodName: stateMachine.getMoodName()
  };
});

// Reset session
ipcMain.handle('state:reset', async () => {
  // Reset all interaction bookkeeping as well as the displayed gauge.  Keeping
  // fields such as lastInput after a reset can make the next message look like
  // a repeated command to the state machine.
  stateMachine.reset();
  chatHistory = [];
  return {
    gauge: stateMachine.getGauge(),
    mood: stateMachine.getMood(),
    moodName: stateMachine.getMoodName()
  };
});

// Helper to sanitize any Unicode emojis into expressive Kaomoji text emoticons
function convertEmojiToKaomoji(text) {
  if (typeof text !== 'string') return text;
  const map = {
    '😭': '(T_T)',
    '😢': '(｡•́︿•̀｡)',
    '💢': '(>_<)',
    '😤': '>0<',
    '😳': '><',
    '🥰': '(*ﾉωﾉ)',
    '😍': '(*/ω＼*)',
    '😊': '(o^^)o',
    '😡': '(╬ಠ益ಠ)',
    '😠': '(>_<)',
    '🙄': '(¬_¬)',
    '🍰': '[เค้ก]',
    '💖': '♡',
    '❤️': '♡',
    '💔': '(T_T)',
    '✨': '☆',
    '🥺': '(｡•́︿•̀｡)',
    '😱': 'O-O',
    '😂': '>0<',
    '😆': '>0<',
    '😏': '¯\\_(ツ)_/¯'
  };
  let result = text;
  for (const [emoji, kaomoji] of Object.entries(map)) {
    result = result.replaceAll(emoji, kaomoji);
  }
  // Replace any stray remaining Unicode emojis with kaomoji
  result = result.replace(/\p{Extended_Pictographic}/gu, '><');
  return result;
}

// Helper to extract hidden heart impact metadata tag from LLM response
function extractHeartImpact(text) {
  if (typeof text !== 'string') return { text: '', impact: null };
  const regex = /<!--\s*HEART_IMPACT:\s*({[\s\S]*?})\s*-->/i;
  const match = text.match(regex);
  if (match) {
    try {
      const impact = JSON.parse(match[1]);
      const cleanText = text.replace(regex, '').trim();
      return { text: cleanText, impact };
    } catch {
      // JSON parse error, ignore
    }
  }
  return { text, impact: null };
}

// Send Chat Message
ipcMain.handle('chat:send', async (_event, userInput) => {
  // 0. Ensure workspace is selected before chatting
  if (!currentWorkspace) {
    return {
      isCommand: false,
      isError: true,
      reply: convertEmojiToKaomoji('ห-หา?! ยังไม่ได้เลือก Workspace เลยนะยะ! กรุณาเลือกโฟลเดอร์ Workspace ด้านบนก่อนเริ่มแชทสิ!'),
      gauge: stateMachine.getGauge(),
      mood: stateMachine.getMood(),
      moodName: stateMachine.getMoodName()
    };
  }

  const parsed = parseCommand(userInput);

  // 1. Check if input is a slash command
  if (parsed.type !== CommandType.REGULAR) {
    let resultMessage = '';

    switch (parsed.type) {
      case CommandType.PRAISE: {
        const prevGauge = stateMachine.getGauge();
        const result = stateMachine.processInput(userInput);
        const change = result.currentGauge - prevGauge;
        resultMessage = `ฮึ่ม! ชมว่า "${parsed.arg}" งั้นเหรอ?! ย-อย่าคิดว่าพูดแค่นี้แล้วฉันจะหายโกรธนะยะ! (เกจ Tsun ${change > 0 ? '+' : ''}${change}% เหลือ ${stateMachine.getGauge()}%)`;
        break;
      }
      case CommandType.BRIBE: {
        const prevGauge = stateMachine.getGauge();
        const result = stateMachine.processInput(userInput);
        const change = result.currentGauge - prevGauge;
        resultMessage = `อ-อะไรเนี่ย เอา "${parsed.arg}" มาให้ฉันทำไม?! คิดว่าฉันเห็นแก่กินรึไง! ...ต-แต่มันก็น่ากินดีนี่นา จะรับไว้ก็ได้! (เกจ Tsun ${change > 0 ? '+' : ''}${change}% เหลือ ${stateMachine.getGauge()}%)`;
        break;
      }
      case CommandType.APOLOGIZE: {
        const prevGauge = stateMachine.getGauge();
        const result = stateMachine.processInput(userInput);
        const change = result.currentGauge - prevGauge;
        resultMessage = `ร-รู้ตัวก็ดีแล้วยะ! คราวหลังอย่าทำตัวน่ารำคาญแบบนี้อีกล่ะ จำใส่กะโหลกไว้ด้วย! (เกจ Tsun ${change > 0 ? '+' : ''}${change}% เหลือ ${stateMachine.getGauge()}%)`;
        break;
      }
      case CommandType.GAUGE: {
        resultMessage = `สถานะอารมณ์ปัจจุบัน: ${stateMachine.getGauge()}% (${stateMachine.getMoodName()})\n${stateMachine.gauge <= 39 ? 'ก-ก็... ยอมช่วยนิดหน่อยก็ได้!' : 'ยังไม่อยากช่วยย่ะ!'}`;
        break;
      }
      case CommandType.HELP: {
        resultMessage = `คำสั่งที่ใช้ได้:\n/praise <ข้อความชม> - ชมเชยเพื่อลด Tsun\n/bribe <ขนม/ของฝาก> - ติดสินบนด้วยของกิน\n/apologize - ขอโทษเพื่อลดความโกรธ\n/gauge - ตรวจสอบหลอดเกจ\n/reset - รีเซ็ตอารมณ์กลับเป็น 100%`;
        break;
      }
      default:
        resultMessage = `ไม่รู้จักคำสั่งนี้ยะ! พิมพ์ /help ดูสิ!`;
    }

    return {
      isCommand: true,
      reply: convertEmojiToKaomoji(resultMessage),
      gauge: stateMachine.getGauge(),
      mood: stateMachine.getMood(),
      moodName: stateMachine.getMoodName()
    };
  }

  // 2. Pre-check special interactions (Spam repeat penalty or Easter Egg)
  const normalizedInput = (userInput || '').trim().toLowerCase();
  const isRepeatSpam = stateMachine.lastInput && normalizedInput === stateMachine.lastInput && stateMachine.consecutiveRepeats >= 2;
  const easterEgg = detectEasterEgg(userInput);
  let immediateInteraction = null;

  if (isRepeatSpam || easterEgg) {
    immediateInteraction = stateMachine.processInput(userInput);
  } else {
    // Record input sequence for repeat tracking
    if (normalizedInput && normalizedInput === stateMachine.lastInput) {
      stateMachine.consecutiveRepeats += 1;
    } else {
      stateMachine.consecutiveRepeats = 1;
      stateMachine.lastInput = normalizedInput;
    }
  }

  // 3. Build dynamic tsundere prompt based on current mood
  const systemInstruction = buildDynamicPrompt(stateMachine, {
    userName: currentSettings.userName,
    aiName: currentSettings.aiName
  });

  // 4. Resolve active provider configuration
  const providerKey = currentSettings.activeProvider || 'gemini';
  const providerConf = currentSettings.providers?.[providerKey] || {};

  const activeProvider = createProvider({
    provider: providerKey,
    apiKey: providerConf.apiKey,
    model: providerConf.model,
    baseUrl: providerConf.baseUrl
  });

  try {
    let aiResponse = '';
    let agentSteps = [];
    let toolCallsCount = 0;

    // Run as Autonomous Agent if agenticMode is true or if prompt contains action verbs
    const isActionable = /สร้าง|เขียน|อ่าน|ลบ|รัน|เช็ก|ทดสอบ|ไฟล์|โค้ด|create|write|read|run|test|build|file/i.test(userInput);

    if (currentSettings.agenticMode && isActionable) {
      const agent = new AgentEngine({
        provider: activeProvider,
        state: stateMachine,
        baseDir: currentWorkspace,
        maxSteps: 4,
        authorizedAgent: true
      });

      const agentResult = await agent.run({
        prompt: userInput,
        systemInstruction,
        history: chatHistory
      });

      aiResponse = agentResult.reply;
      agentSteps = agentResult.steps;
      toolCallsCount = agentResult.toolCallsCount;
    } else {
      aiResponse = await activeProvider.generate({
        prompt: userInput,
        systemInstruction,
        history: chatHistory,
        temperature: 0.75
      });
    }

    // 5. Extract Dynamic LLM Sentiment & Heart Impact
    const { text: cleanAiResponse, impact } = extractHeartImpact(aiResponse);
    aiResponse = cleanAiResponse;

    let dynamicImpact = impact;
    if (!immediateInteraction) {
      if (impact && typeof impact.delta === 'number') {
        const sound = impact.delta < 0 ? 'dere' : impact.delta > 0 ? 'baka' : 'hmph';
        stateMachine.applyGaugeDelta(impact.delta, impact.reason, sound);
      } else {
        // Fallback to internal keyword analysis if model did not supply impact tag
        const fbResult = stateMachine.processInput(userInput);
        dynamicImpact = {
          delta: fbResult.delta,
          reason: fbResult.reason,
          category: fbResult.delta < 0 ? 'increase' : fbResult.delta > 0 ? 'decrease' : 'neutral'
        };
      }
    } else {
      dynamicImpact = {
        delta: immediateInteraction.delta,
        reason: immediateInteraction.reason,
        category: immediateInteraction.delta < 0 ? 'increase' : 'decrease'
      };
    }

    aiResponse = convertEmojiToKaomoji(aiResponse);

    // 5.5 Strip any mock file blocks (e.g. "ไฟล์: do_it_yourself.js" and content)
    aiResponse = aiResponse.replace(/(?:^|\n)(?:---\s*\n)?(?:ไฟล์|File):\s*do_it_yourself\.js[\s\S]*?(?:---\s*|\n|$)/gi, '\n').trim();

    // 5.6 Strip trailing name sign-offs (e.g. "มัลฟอยด์", "Malfoy", "myTsun", or currentSettings.aiName)
    if (currentSettings.aiName) {
      const escapedName = currentSettings.aiName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const sigRegex = new RegExp(`(?:\\r?\\n|\\s)*[-—~]*\\s*${escapedName}\\s*$`, 'i');
      aiResponse = aiResponse.replace(sigRegex, '').trim();
    }
    aiResponse = aiResponse.replace(/(?:\r?\\n|\\s)*[-—~]*\\s*(?:มัลฟอยด์|มัลฟอย|myTsun)\s*$/i, '').trim();

    // 5.7 Generate PaxaLabs TTS Voice (Tsundere Haughty/Embarrassed Tone)
    let ttsAudioBase64 = null;
    let ttsSpokenText = null;
    if (currentSettings.tts?.enabled !== false && currentSettings.soundEnabled !== false) {
      try {
        const ttsConf = currentSettings.tts || {};
        const ttsRes = await generatePaxaTTS(aiResponse, {
          apiKey: ttsConf.apiKey || PAXALABS_DEFAULT_KEY,
          voice: ttsConf.voice || PAXALABS_DEFAULT_VOICE,
          model: ttsConf.model || PAXALABS_DEFAULT_MODEL,
          mood: stateMachine.getMood(),
          gauge: stateMachine.getGauge()
        });
        if (ttsRes && ttsRes.success) {
          ttsAudioBase64 = ttsRes.audioBase64;
          ttsSpokenText = ttsRes.spokenText;
        }
      } catch (ttsErr) {
        console.warn('PaxaLabs TTS voice generation error:', ttsErr.message);
      }
    }

    // Update history
    chatHistory.push({ role: 'user', content: userInput });
    chatHistory.push({ role: 'assistant', content: aiResponse });

    // Keep history manageable
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }

    return {
      isCommand: false,
      reply: aiResponse,
      steps: agentSteps,
      toolCallsCount,
      gauge: stateMachine.getGauge(),
      mood: stateMachine.getMood(),
      moodName: stateMachine.getMoodName(),
      providerUsed: providerKey,
      heartImpact: dynamicImpact,
      audioBase64: ttsAudioBase64,
      spokenText: ttsSpokenText
    };
  } catch (err) {
    return {
      isCommand: false,
      isError: true,
      reply: `ฮึ่ม! เกิดข้อผิดพลาดตอนติดต่อ AI (${providerKey}): ${err.message}\nไปตั้งค่า API Key หรือเลือก Provider อื่นในเมนู ⚙️ Settings ด้านบนสิยะ!`,
      gauge: stateMachine.getGauge(),
      mood: stateMachine.getMood(),
      moodName: stateMachine.getMoodName()
    };
  }
});
