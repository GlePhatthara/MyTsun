// myTsun Desktop Frontend Logic — Claude Minimalism Edition

// Avatar Stages mapping the 5 mood illustrations in assets
const AVATAR_STAGES = [
  {
    min: 81,
    max: 100,
    moodClass: 'extreme-tsun',
    badge: 'Extreme Tsun',
    image: 'assets/high tsun.png',
    quote: '"หา?! ยืนบื้ออะไรอยู่ยะ! อย่าคิดว่าจะสั่งงานฉันง่ายๆ เชียวนะ! (>_<)"',
    color: 'var(--color-tsun)'
  },
  {
    min: 61,
    max: 80,
    moodClass: 'high-tsun',
    badge: 'High Tsun',
    image: 'assets/half tsun.png',
    quote: '"ฮึ่ม! มองอะไรยะ... ก-ก็ไม่ได้อยากจะช่วยแกหรอกนะ! >0<"',
    color: '#ea580c'
  },
  {
    min: 41,
    max: 60,
    moodClass: 'reluctant',
    badge: 'Reluctant Tsun',
    image: 'assets/little high tsun.png',
    quote: '"จิ๊... ก-ก็ได้ แค่ครั้งนี้ครั้งเดียวเท่านั้นนะ! อย่าเข้าใจผิดล่ะ! (¬_¬)"',
    color: 'var(--color-reluctant)'
  },
  {
    min: 21,
    max: 40,
    moodClass: 'soft-tsun',
    badge: 'Soft Tsun',
    image: 'assets/normal.png',
    quote: '"ถ-ถ้าพยายามง้อขนาดนั้นล่ะก็... จะยอมช่วยเขียนให้หน่อยก็ได้นะ (o^^)o"',
    color: '#f472b6'
  },
  {
    min: 0,
    max: 20,
    moodClass: 'dere',
    badge: 'Dere Breakthrough',
    image: 'assets/shy.png',
    quote: '"ฮ-ฮะ?! ย-อย่าจ้องหน้ากันแบบนั้นสิยะ! เขินจะแย่อยู่แล้ว... อยากได้อะไรจะทำให้หมดเลย! (*ﾉωﾉ)"',
    color: 'var(--color-dere)'
  }
];

function convertEmojiToKaomojiClient(text) {
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
  return result.replace(/\p{Extended_Pictographic}/gu, '><');
}

// State
let currentSettings = null;
let currentTab = 'gemini';
let currentTheme = 'moon'; // 'moon' | 'sun'

// Elements
const avatarCard = document.getElementById('avatarCard');
const avatarImg = document.getElementById('avatarImg');
const avatarDialogue = document.getElementById('avatarDialogue');
const avatarMoodBadge = document.getElementById('avatarMoodBadge');
const heartCountText = document.getElementById('heartCountText');
const heartMeter = document.getElementById('heartMeter');
const hearts = Array.from(document.querySelectorAll('.heart'));

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const btnSend = document.getElementById('btnSend');

const currentProviderBadge = document.getElementById('currentProviderBadge');
const currentProviderLabel = document.getElementById('currentProviderLabel');

const btnOpenSettings = document.getElementById('btnOpenSettings');
const settingsModal = document.getElementById('settingsModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const btnTestConnection = document.getElementById('btnTestConnection');
const testFeedback = document.getElementById('testFeedback');

// Theme elements
const btnQuickThemeToggle = document.getElementById('btnQuickThemeToggle');
const btnThemeMoon = document.getElementById('btnThemeMoon');
const btnThemeSun = document.getElementById('btnThemeSun');

// Theme Management
function applyTheme(theme) {
  currentTheme = theme;
  document.body.setAttribute('data-theme', theme);
  try { localStorage.setItem('mytsun-theme', theme); } catch (_) {}

  // Sync quick toggle button emoji/title
  if (btnQuickThemeToggle) {
    btnQuickThemeToggle.textContent = theme === 'sun' ? '🌙' : '☀️';
    btnQuickThemeToggle.title = theme === 'sun'
      ? 'สลับไปโหมดพระจันทร์ 🌙'
      : 'สลับไปโหมดดวงอาทิตย์ ☀️';
  }

  // Sync modal theme buttons
  syncThemeButtons(theme);
}

function syncThemeButtons(theme) {
  if (btnThemeMoon) btnThemeMoon.classList.toggle('active', theme === 'moon');
  if (btnThemeSun)  btnThemeSun.classList.toggle('active', theme === 'sun');
}

function loadTheme() {
  let saved = 'moon';
  try { saved = localStorage.getItem('mytsun-theme') || 'moon'; } catch (_) {}
  applyTheme(saved === 'sun' ? 'sun' : 'moon');
}

// Quick toggle button (top nav)
if (btnQuickThemeToggle) {
  btnQuickThemeToggle.addEventListener('click', () => {
    applyTheme(currentTheme === 'moon' ? 'sun' : 'moon');
  });
}

// Modal theme buttons
if (btnThemeMoon) {
  btnThemeMoon.addEventListener('click', () => applyTheme('moon'));
}
if (btnThemeSun) {
  btnThemeSun.addEventListener('click', () => applyTheme('sun'));
}

function identity() {
  return {
    userName: currentSettings?.userName?.trim() || 'You',
    aiName: currentSettings?.aiName?.trim() || 'MyTsun'
  };
}

function updateIdentityDisplay() {
  const { aiName } = identity();
  ['brandAiName', 'avatarAiName', 'welcomeAiName'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = aiName;
  });
  if (currentWorkspace?.path) {
    userInput.placeholder = `Ask ${aiName} or enter commands (/praise, /bribe, /write)...`;
  } else {
    userInput.placeholder = 'กรุณาเลือกโฟลเดอร์ Workspace ก่อนเริ่มแชท... (คลิก 📂 None ด้านบน)';
  }
  document.title = 'MyTsun';
}

// Quick Action Buttons
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = btn.getAttribute('data-cmd');
    if (cmd) {
      sendMessage(cmd);
    }
  });
});

// Tab Buttons
document.querySelectorAll('.tab-btn').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    const tabName = tabBtn.getAttribute('data-tab');
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tabName));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === `pane-${tabName}`));
  testFeedback.style.display = 'none';
}

// Update Mood and Heart Status UI
function updateMoodDisplay(gauge, mood) {
  const g = typeof gauge === 'number' ? Math.max(0, Math.min(100, Math.round(gauge))) : 100;
  // A lower Tsun gauge means she is opening her heart to the user.
  const filledHearts = Math.round((100 - g) / 10);
  heartCountText.textContent = `${filledHearts} / ${hearts.length}`;
  heartMeter.setAttribute('aria-label', `Heart status: ${filledHearts} of ${hearts.length} hearts`);
  hearts.forEach((heart, index) => {
    const isFilled = index < filledHearts;
    heart.classList.toggle('is-filled', isFilled);
    heart.textContent = isFilled ? '♥' : '♡';
  });

  const stage = AVATAR_STAGES.find(s => g >= s.min && g <= s.max) || AVATAR_STAGES[0];

  avatarCard.classList.remove('extreme-tsun', 'high-tsun', 'reluctant', 'soft-tsun', 'dere');
  avatarCard.classList.add(stage.moodClass);

  if (avatarMoodBadge) {
    avatarMoodBadge.textContent = stage.badge;
  }
  avatarDialogue.textContent = stage.quote;
  heartCountText.style.color = stage.color;

  if (avatarImg) {
    const targetSrc = stage.image;
    if (!avatarImg.src.endsWith(encodeURI(targetSrc)) && !avatarImg.src.endsWith(targetSrc)) {
      avatarImg.style.opacity = '0';
      setTimeout(() => {
        avatarImg.src = targetSrc;
        avatarImg.style.opacity = '1';
      }, 150);
    }
  }
}

// PaxaLabs Audio Playback Controller
let currentTtsAudio = null;

function playTtsAudio(base64Data) {
  if (!base64Data) return;
  try {
    if (currentTtsAudio) {
      currentTtsAudio.pause();
      currentTtsAudio = null;
    }
    const audioSrc = `data:audio/mpeg;base64,${base64Data}`;
    currentTtsAudio = new Audio(audioSrc);
    currentTtsAudio.play().catch(err => {
      console.warn('Audio playback prevented or failed:', err);
    });
  } catch (err) {
    console.error('Failed to play TTS audio:', err);
  }
}

// Append Chat Message (Claude Flat Style)
function appendMessage(sender, text, isUser = false, isCommand = false, isError = false, steps = [], heartImpact = null, audioBase64 = null) {
  text = convertEmojiToKaomojiClient(text || '');

  // Strip any stray internal ReAct artifacts from showing to the user
  if (!isUser && typeof text === 'string') {
    text = text
      .replace(/(?:^|\n)Thought:[\s\S]*?(?=\n(?:Action:|Final Answer:|$))/gi, '')
      .replace(/(?:^|\n)Action:[\s\S]*?(?=\n(?:Action Input:|Observation:|$))/gi, '')
      .replace(/(?:^|\n)Action Input:[\s\S]*?(?=\n(?:Observation:|Final Answer:|$))/gi, '')
      .replace(/(?:^|\n)Observation:[\s\S]*?(?=\n(?:Thought:|Final Answer:|$))/gi, '')
      .replace(/(?:^|\n)Final Answer:\s*/gi, '')
      .replace(/(?:^|\n)(?:มัลฟอยด์|myTsun)\s*\([^\)]*\)\s*(?=\n|$)/gi, '\n')
      .trim();
  }

  const item = document.createElement('article');
  item.className = `msg-item ${isUser ? 'user-msg' : 'bot-msg'}${isCommand ? ' command-msg' : ''}${isError ? ' error-msg' : ''}`;

  const header = document.createElement('header');
  header.className = 'msg-header';

  const author = document.createElement('span');
  author.className = 'msg-author';
  author.textContent = isUser ? identity().userName : sender;
  header.appendChild(author);

  // Audio Replay Button for Bot Messages
  if (!isUser && !isError && text) {
    const audioBtn = document.createElement('button');
    audioBtn.type = 'button';
    audioBtn.className = 'btn-msg-audio';
    audioBtn.title = 'ฟังเสียง Malfoy';
    audioBtn.innerHTML = '🔊';
    audioBtn.style.cssText = 'background:none; border:none; cursor:pointer; font-size:0.85rem; margin-left:0.4rem; padding:0; opacity:0.75; transition:opacity 0.2s;';
    audioBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (audioBase64) {
        playTtsAudio(audioBase64);
      } else {
        audioBtn.style.opacity = '0.3';
        try {
          const res = await window.tsunAPI.generateTTS(text);
          if (res && res.success && res.audioBase64) {
            audioBase64 = res.audioBase64;
            playTtsAudio(res.audioBase64);
          }
        } catch (err) {
          console.error('TTS replay failed:', err);
        } finally {
          audioBtn.style.opacity = '0.75';
        }
      }
    });
    header.appendChild(audioBtn);
  }

  // Dynamic Heart Impact Badge
  if (heartImpact && !isUser) {
    const badge = document.createElement('span');
    badge.className = 'heart-impact-badge';
    if (heartImpact.delta < 0) {
      const count = Math.max(1, Math.round(Math.abs(heartImpact.delta) / 10));
      badge.classList.add('impact-increase');
      badge.textContent = `+${count} ♥ ${heartImpact.reason ? `(${heartImpact.reason})` : ''}`;
    } else if (heartImpact.delta > 0) {
      const count = Math.max(1, Math.round(heartImpact.delta / 10));
      badge.classList.add('impact-decrease');
      badge.textContent = `-${count} ♡ ${heartImpact.reason ? `(${heartImpact.reason})` : ''}`;
    } else {
      badge.classList.add('impact-neutral');
      badge.textContent = `• ${heartImpact.reason || 'ไม่กระทบเกจหัวใจ'}`;
    }
    header.appendChild(badge);
  }

  const body = document.createElement('div');
  body.className = 'msg-body';

  // Format code blocks and newlines
  if (text.includes('```')) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    parts.forEach(part => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeText = part.slice(3, -3).replace(/^[a-zA-Z0-9_-]*\n/, '');
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = codeText;
        pre.appendChild(code);
        body.appendChild(pre);
      } else {
        const clean = part.trim();
        if (clean) {
          const p = document.createElement('p');
          p.innerHTML = clean.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
          body.appendChild(p);
        }
      }
    });
  } else if (text) {
    const p = document.createElement('p');
    p.innerHTML = text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
    body.appendChild(p);
  }

  // Render clean file creation/action cards if tools were executed
  if (Array.isArray(steps) && steps.length > 0) {
    const fileActions = steps.filter(s => s.type === 'tool_execution' && (s.toolName === 'writeFile' || s.targetFile));
    if (fileActions.length > 0) {
      const container = document.createElement('div');
      container.className = 'file-actions-container';

      fileActions.forEach(action => {
        const filePath = action.targetFile || action.toolInput?.filePath || action.toolInput?.path || 'file';
        const isSuccess = action.success !== false;
        const card = document.createElement('div');
        card.className = `file-action-badge ${isSuccess ? 'success' : 'failed'}`;
        card.innerHTML = `
          <span class="file-action-icon">${isSuccess ? '📁' : '⚠️'}</span>
          <span class="file-action-label">สร้างไฟล์</span>
          <code class="file-action-name">${filePath}</code>
          <span class="file-action-status">${isSuccess ? '✓ สำเร็จ' : '✗ ไม่สำเร็จ'}</span>
        `;
        container.appendChild(card);
      });

      body.appendChild(container);
    }
  }

  item.appendChild(header);
  item.appendChild(body);

  chatMessages.appendChild(item);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

const THINKING_QUOTES = [
  'กำลังคิดอยู่... ย-อย่าเพิ่งรีบร้อนสิยะ!',
  'กำลังประมวลผลคำตอบให้อยู่... ร-รอสักเดี๋ยวน่า!',
  'กำลังวิเคราะห์โค้ด... ก-ก็ไม่ได้ตั้งใจจะช่วยขนาดนั้นหรอกนะ!',
  'ฮึ่ม... กำลังเรียบเรียงให้อยู่ อย่ามาจ้องกดดันกันสิ!'
];

// Show Loading UI Indicator
function showLoadingIndicator() {
  const item = document.createElement('article');
  item.className = 'msg-item bot-msg loading-msg';
  item.id = 'aiLoadingIndicator';

  const header = document.createElement('header');
  header.className = 'msg-header';

  const author = document.createElement('span');
  author.className = 'msg-author';
  author.textContent = identity().aiName;
  header.appendChild(author);

  const body = document.createElement('div');
  body.className = 'msg-body loading-body';

  const randomQuote = THINKING_QUOTES[Math.floor(Math.random() * THINKING_QUOTES.length)];

  const bubble = document.createElement('div');
  bubble.className = 'thinking-bubble';
  bubble.innerHTML = `
    <div class="typing-indicator" aria-label="กำลังคิด">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
    <span class="thinking-text">${randomQuote}</span>
  `;

  body.appendChild(bubble);
  item.appendChild(header);
  item.appendChild(body);

  chatMessages.appendChild(item);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return item;
}

// Send Message Handler
async function sendMessage(text) {
  const msg = (text || userInput.value).trim();
  if (!msg) return;

  if (!currentWorkspace || !currentWorkspace.path) {
    appendMessage(
      identity().aiName,
      'ห-หา?! ยังไม่ได้เลือก Workspace เลยนะยะ! กรุณาเลือกโฟลเดอร์ Workspace ด้านบนก่อนเริ่มแชทสิ! (>_<)',
      false,
      false,
      true
    );
    selectWorkspaceFlow();
    return;
  }

  userInput.value = '';
  appendMessage('You', msg, true);

  btnSend.disabled = true;
  const sendLabel = btnSend.querySelector('span');
  if (sendLabel) sendLabel.textContent = 'กำลังคิด...';
  if (avatarCard) avatarCard.classList.add('is-thinking');

  const loadingIndicator = showLoadingIndicator();

  try {
    const res = await window.tsunAPI.sendChat(msg);
    updateMoodDisplay(res.gauge, res.mood);

    const botTitle = identity().aiName;
    appendMessage(botTitle, res.reply, false, res.isCommand, res.isError, res.steps, res.heartImpact, res.audioBase64);

    // Speak Malfoy's response out loud via PaxaLabs TTS
    if (res.audioBase64) {
      playTtsAudio(res.audioBase64);
    }
  } catch (err) {
    appendMessage(identity().aiName, `เกิดข้อผิดพลาด: ${err.message}`, false, false, true);
  } finally {
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.remove();
    }
    if (avatarCard) avatarCard.classList.remove('is-thinking');
    btnSend.disabled = false;
    if (sendLabel) sendLabel.textContent = 'ส่ง';
    userInput.focus();
  }
}

// Chat Form Submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Modal Controls
btnOpenSettings.addEventListener('click', openSettingsModal);
currentProviderBadge.addEventListener('click', openSettingsModal);
btnCloseModal.addEventListener('click', closeSettingsModal);
btnCancelModal.addEventListener('click', closeSettingsModal);

function openSettingsModal() {
  testFeedback.style.display = 'none';
  if (currentSettings) {
    document.getElementById('userDisplayName').value = currentSettings.userName || '';
    document.getElementById('aiDisplayName').value = currentSettings.aiName || 'myTsun';
    const p = currentSettings.providers || {};
    if (p.gemini) {
      document.getElementById('geminiApiKey').value = p.gemini.apiKey || '';
      if (p.gemini.model) document.getElementById('geminiModel').value = p.gemini.model;
    }
    if (p.openai) {
      document.getElementById('openaiApiKey').value = p.openai.apiKey || '';
      if (p.openai.model) document.getElementById('openaiModel').value = p.openai.model;
      if (p.openai.baseUrl) document.getElementById('openaiBaseUrl').value = p.openai.baseUrl;
    }
    if (p.claude) {
      document.getElementById('claudeApiKey').value = p.claude.apiKey || '';
      if (p.claude.model) document.getElementById('claudeModel').value = p.claude.model;
    }
    if (p.openrouter) {
      document.getElementById('openrouterApiKey').value = p.openrouter.apiKey || '';
      if (p.openrouter.model) document.getElementById('openrouterModel').value = p.openrouter.model;
    }
    if (p.ollama) {
      if (p.ollama.baseUrl) document.getElementById('ollamaBaseUrl').value = p.ollama.baseUrl;
      if (p.ollama.model) document.getElementById('ollamaModel').value = p.ollama.model;
    }

    if (currentSettings.activeProvider) {
      switchTab(currentSettings.activeProvider);
    }
    document.getElementById('chkAgenticMode').checked = currentSettings.agenticMode !== false;

    // Load PaxaLabs TTS config
    if (currentSettings.tts) {
      const chkTts = document.getElementById('chkTtsEnabled');
      const paxaKey = document.getElementById('paxaApiKey');
      const paxaVc = document.getElementById('paxaVoice');
      if (chkTts) chkTts.checked = currentSettings.tts.enabled !== false;
      if (paxaKey) paxaKey.value = currentSettings.tts.apiKey || '';
      if (paxaVc) paxaVc.value = currentSettings.tts.voice || 'khanomchan';
    }
  }
  refreshAuthStatus();
  settingsModal.style.display = 'flex';
}

function closeSettingsModal() {
  settingsModal.style.display = 'none';
}

// Get config from form for a given tab
function getTabConfig(tab) {
  switch (tab) {
    case 'gemini':
      return {
        provider: 'gemini',
        apiKey: document.getElementById('geminiApiKey').value.trim(),
        model: document.getElementById('geminiModel').value.trim()
      };
    case 'openai':
      return {
        provider: 'openai',
        apiKey: document.getElementById('openaiApiKey').value.trim(),
        model: document.getElementById('openaiModel').value.trim(),
        baseUrl: document.getElementById('openaiBaseUrl').value.trim()
      };
    case 'claude':
      return {
        provider: 'claude',
        apiKey: document.getElementById('claudeApiKey').value.trim(),
        model: document.getElementById('claudeModel').value.trim()
      };
    case 'openrouter':
      return {
        provider: 'openrouter',
        apiKey: document.getElementById('openrouterApiKey').value.trim(),
        model: document.getElementById('openrouterModel').value.trim()
      };
    case 'ollama':
      return {
        provider: 'ollama',
        apiKey: 'ollama',
        baseUrl: document.getElementById('ollamaBaseUrl').value.trim(),
        model: document.getElementById('ollamaModel').value.trim()
      };
    case 'mock':
    default:
      return {
        provider: 'mock',
        model: 'mock-tsundere-v1'
      };
  }
}

// Test Connection
btnTestConnection.addEventListener('click', async () => {
  const config = getTabConfig(currentTab);
  testFeedback.className = 'test-feedback';
  testFeedback.style.display = 'block';
  testFeedback.textContent = `กำลังทดสอบเชื่อมต่อ ${config.provider.toUpperCase()}...`;

  try {
    const res = await window.tsunAPI.testConnection(config);
    if (res.success) {
      testFeedback.className = 'test-feedback success';
      testFeedback.textContent = `เชื่อมต่อสำเร็จ (Latency: ${res.latency}ms, คำตอบ: "${res.reply}")`;
    } else {
      testFeedback.className = 'test-feedback error';
      testFeedback.textContent = `เชื่อมต่อไม่สำเร็จ: ${res.error}`;
    }
  } catch (err) {
    testFeedback.className = 'test-feedback error';
    testFeedback.textContent = `ผิดพลาด: ${err.message}`;
  }
});

document.getElementById('btnLoadGeminiModels').addEventListener('click', async () => {
  const config = getTabConfig('gemini');
  const button = document.getElementById('btnLoadGeminiModels');
  button.disabled = true;
  try {
    const result = await window.tsunAPI.listModels(config);
    if (!result.success) throw new Error(result.error);
    const list = document.getElementById('geminiModelOptions');
    list.replaceChildren(...result.models.map((model) => {
      const option = document.createElement('option');
      option.value = model;
      return option;
    }));
    testFeedback.className = 'test-feedback success';
    testFeedback.style.display = 'block';
    testFeedback.textContent = `พบ ${result.models.length} โมเดลที่ key นี้ใช้ได้ — เลือกหรือพิมพ์ Model ID ได้ทันที`;
  } catch (error) {
    testFeedback.className = 'test-feedback error';
    testFeedback.style.display = 'block';
    testFeedback.textContent = `โหลดรายการโมเดลไม่สำเร็จ: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

// Test PaxaLabs Tsundere Voice
const btnTestTtsVoice = document.getElementById('btnTestTtsVoice');
if (btnTestTtsVoice) {
  btnTestTtsVoice.addEventListener('click', async () => {
    btnTestTtsVoice.disabled = true;
    const oldText = btnTestTtsVoice.textContent;
    btnTestTtsVoice.textContent = '⏳ กำลังสร้างเสียง...';
    try {
      const apiKey = document.getElementById('paxaApiKey').value.trim();
      const voice = document.getElementById('paxaVoice').value;
      const res = await window.tsunAPI.generateTTS('หา?! ย-อย่าเข้าใจผิดล่ะ! ก-ก็ไม่ได้อยากคุยด้วยซะหน่อย! ต-แต่วันนี้จะยอมพูดด้วยนิดหน่อยก็ได้!', {
        apiKey,
        voice
      });
      if (res && res.success && res.audioBase64) {
        playTtsAudio(res.audioBase64);
      } else {
        alert('เกิดข้อผิดพลาดในการสร้างเสียง: ' + (res?.error || 'Unknown error'));
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      btnTestTtsVoice.disabled = false;
      btnTestTtsVoice.textContent = oldText;
    }
  });
}

// Save Settings
btnSaveSettings.addEventListener('click', async () => {
  const activeTab = currentTab;
  const tabConf = getTabConfig(activeTab);

  const newProviders = {
    ...(currentSettings?.providers || {})
  };
  newProviders[activeTab] = {
    ...(newProviders[activeTab] || {}),
    ...tabConf
  };

  const newSettings = {
    userName: document.getElementById('userDisplayName').value.trim(),
    aiName: document.getElementById('aiDisplayName').value.trim() || 'myTsun',
    activeProvider: activeTab,
    agenticMode: document.getElementById('chkAgenticMode').checked,
    providers: newProviders,
    tts: {
      enabled: document.getElementById('chkTtsEnabled') ? document.getElementById('chkTtsEnabled').checked : true,
      apiKey: (document.getElementById('paxaApiKey')?.value || '').trim() || 'pxa_Q2u8EI5300gToSiqZXwjvCGtOnNEqGEkJwmSHfnM',
      voice: document.getElementById('paxaVoice')?.value || 'khanomchan',
      model: 'paxa-tts-flash-v1'
    }
  };

  try {
    const res = await window.tsunAPI.saveSettings(newSettings);
    if (res.success) {
      currentSettings = res.settings;
      updateIdentityDisplay();
      updateActiveProviderLabel();
      closeSettingsModal();
      appendMessage(identity().aiName, `บันทึกชื่อเรียกและสลับไปใช้ AI Provider: **${activeTab.toUpperCase()}** (${tabConf.model}) เรียบร้อยแล้ว`, false, true);
    }
  } catch (err) {
    alert(`ไม่สามารถบันทึกการตั้งค่าได้: ${err.message}`);
  }
});

function updateActiveProviderLabel() {
  if (!currentSettings) return;
  const activeKey = currentSettings.activeProvider || 'gemini';
  const conf = currentSettings.providers?.[activeKey] || {};
  const modelName = conf.model || 'default';
  currentProviderLabel.textContent = `AI: ${activeKey.toUpperCase()} (${modelName})`;
}

function renderAuthStatus(statuses) {
  const mapping = [
    ['google', 'authGoogleText'],
    ['claude', 'authClaudeText'],
    ['openai', 'authOpenAIText']
  ];
  mapping.forEach(([provider, elementId]) => {
    const element = document.getElementById(elementId);
    const status = statuses?.[provider];
    if (!element || !status) return;
    element.textContent = status.detected ? `✓ ${status.detail}` : 'Not connected';
    element.style.color = status.detected ? '#86efac' : '#94a3b8';
  });
}

async function refreshAuthStatus() {
  try {
    renderAuthStatus(await window.tsunAPI.detectAuth());
  } catch (error) {
    console.warn('Unable to detect local AI accounts:', error);
  }
}

document.getElementById('btnDetectAuth').addEventListener('click', refreshAuthStatus);

// Workspace UI Handlers
let currentWorkspace = null;
const currentWorkspaceBadge = document.getElementById('currentWorkspaceBadge');
const currentWorkspaceName = document.getElementById('currentWorkspaceName');
const workspaceWarningBanner = document.getElementById('workspaceWarningBanner');
const btnSelectWorkspaceBanner = document.getElementById('btnSelectWorkspaceBanner');

function updateWorkspaceDisplay(ws) {
  const hasWs = Boolean(ws && ws.path);
  currentWorkspace = hasWs ? ws : null;
  if (!currentWorkspaceName) return;

  if (hasWs) {
    currentWorkspaceName.textContent = ws.name || ws.path;
    if (currentWorkspaceBadge) {
      currentWorkspaceBadge.title = `Workspace: ${ws.path}\nคลิกเพื่อสลับโฟลเดอร์`;
      currentWorkspaceBadge.classList.remove('no-workspace');
    }
    if (workspaceWarningBanner) {
      workspaceWarningBanner.style.display = 'none';
    }
    userInput.placeholder = `Ask ${identity().aiName} or enter commands (/praise, /bribe, /write)...`;
  } else {
    currentWorkspaceName.textContent = 'None';
    if (currentWorkspaceBadge) {
      currentWorkspaceBadge.title = 'ยังไม่ได้เลือก Workspace\nคลิกเพื่อเลือกโฟลเดอร์ก่อนเริ่มแชท';
      currentWorkspaceBadge.classList.add('no-workspace');
    }
    if (workspaceWarningBanner) {
      workspaceWarningBanner.style.display = 'flex';
    }
    userInput.placeholder = 'กรุณาเลือกโฟลเดอร์ Workspace ก่อนเริ่มแชท... (คลิก 📂 None ด้านบน)';
  }
}

async function selectWorkspaceFlow() {
  try {
    if (window.tsunAPI?.selectWorkspace) {
      const res = await window.tsunAPI.selectWorkspace();
      if (res && res.success) {
        updateWorkspaceDisplay(res);
        appendMessage(
          identity().aiName,
          `เลือก Workspace เป็นโฟลเดอร์ **${res.name}** (\`${res.path}\`) เรียบร้อยแล้ว! คราวนี้จะคุยหรือสั่งงานอะไรก็ว่ามาสิยะ! (o^^)o`,
          false,
          true
        );
        userInput.focus();
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to select workspace:', err);
  }
  return false;
}

async function initWorkspace() {
  try {
    if (window.tsunAPI?.getWorkspace) {
      const ws = await window.tsunAPI.getWorkspace();
      updateWorkspaceDisplay(ws);
    }
  } catch (err) {
    console.error('Failed to get workspace:', err);
  }
}

if (currentWorkspaceBadge) {
  currentWorkspaceBadge.addEventListener('click', selectWorkspaceFlow);
}

if (btnSelectWorkspaceBanner) {
  btnSelectWorkspaceBanner.addEventListener('click', selectWorkspaceFlow);
}

// Initial Load
async function init() {
  try {
    loadTheme();
    currentSettings = await window.tsunAPI.getSettings();
    updateIdentityDisplay();
    updateActiveProviderLabel();
    refreshAuthStatus();
    await initWorkspace();

    const state = await window.tsunAPI.getState();
    updateMoodDisplay(state.gauge, state.mood);
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

init();
