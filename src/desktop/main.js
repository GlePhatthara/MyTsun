import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { TsunDereState, MOODS } from '../state/TsunDereState.js';
import { parseCommand, CommandType } from '../commands/parser.js';
import { buildDynamicPrompt } from '../prompt/dynamicPrompt.js';
import { createProvider, GeminiProvider, OpenAICompatibleProvider, ClaudeProvider } from '../llm/provider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Settings storage path in User's Home directory
const CONFIG_DIR = path.join(os.homedir(), '.tsundev');
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  activeProvider: 'gemini',
  providers: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-3.8-flash',
      label: 'Google Gemini'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
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
  soundEnabled: true
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

// Global state
let currentSettings = loadSettings();
const stateMachine = new TsunDereState(100); // starts at 100% Extreme Tsun
let chatHistory = [];

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1160,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    title: 'myTsun (ツンDev) - The Tsundere AI Pair-Programmer',
    backgroundColor: '#0f1117',
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

// Get settings
ipcMain.handle('settings:get', async () => {
  return currentSettings;
});

// Save settings
ipcMain.handle('settings:save', async (_event, newSettings) => {
  currentSettings = { ...currentSettings, ...newSettings };
  const ok = saveSettings(currentSettings);
  return { success: ok, settings: currentSettings };
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
  stateMachine.gauge = 100;
  chatHistory = [];
  return {
    gauge: stateMachine.getGauge(),
    mood: stateMachine.getMood(),
    moodName: stateMachine.getMoodName()
  };
});

// Send Chat Message
ipcMain.handle('chat:send', async (_event, userInput) => {
  const parsed = parseCommand(userInput);

  // 1. Check if input is a slash command
  if (parsed.type !== CommandType.REGULAR) {
    let resultMessage = '';
    let isCommand = true;

    switch (parsed.type) {
      case CommandType.PRAISE: {
        const prevGauge = stateMachine.getGauge();
        const result = stateMachine.processInput(userInput);
        const change = result.currentGauge - prevGauge;
        resultMessage = `ฮึ่ม! ชมว่า "${parsed.arg}" งั้นเหรอ?! ย-อย่าคิดว่าพูดแค่นี้แล้วฉันจะหายโกรธนะยะ! (เกจ Tsun ${change > 0 ? '+' : ''}${change}% เหลือ ${stateMachine.getGauge()}%) 😳`;
        break;
      }
      case CommandType.BRIBE: {
        const prevGauge = stateMachine.getGauge();
        const result = stateMachine.processInput(userInput);
        const change = result.currentGauge - prevGauge;
        resultMessage = `อ-อะไรเนี่ย เอา "${parsed.arg}" มาให้ฉันทำไม?! คิดว่าฉันเห็นแก่กินรึไง! ...ต-แต่มันก็น่ากินดีนี่นา จะรับไว้ก็ได้! (เกจ Tsun ${change > 0 ? '+' : ''}${change}% เหลือ ${stateMachine.getGauge()}%) 🍰`;
        break;
      }
      case CommandType.APOLOGIZE: {
        const prevGauge = stateMachine.getGauge();
        const result = stateMachine.processInput(userInput);
        const change = result.currentGauge - prevGauge;
        resultMessage = `ร-รู้ตัวก็ดีแล้วยะ! คราวหลังอย่าทำตัวน่ารำคาญแบบนี้อีกล่ะ จำใส่กะโหลกไว้ด้วย! (เกจ Tsun ${change > 0 ? '+' : ''}${change}% เหลือ ${stateMachine.getGauge()}%) 😤`;
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
      reply: resultMessage,
      gauge: stateMachine.getGauge(),
      mood: stateMachine.getMood(),
      moodName: stateMachine.getMoodName()
    };
  }

  // 2. Regular AI prompt: process input and update gauge
  stateMachine.processInput(userInput);

  // 3. Build dynamic tsundere prompt based on current mood
  const systemInstruction = buildDynamicPrompt(stateMachine);

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
    const aiResponse = await activeProvider.generate({
      prompt: userInput,
      systemInstruction,
      history: chatHistory,
      temperature: 0.75
    });

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
      gauge: stateMachine.getGauge(),
      mood: stateMachine.getMood(),
      moodName: stateMachine.getMoodName(),
      providerUsed: providerKey
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
