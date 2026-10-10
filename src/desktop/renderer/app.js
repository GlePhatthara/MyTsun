// myTsun Desktop Frontend Logic — Claude Minimalism Edition

// Avatar Stages mapping the 5 mood illustrations in assets
const AVATAR_STAGES = [
  {
    min: 81,
    max: 100,
    moodClass: 'extreme-tsun',
    badge: 'Extreme Tsun',
    image: 'assets/high tsun.png',
    quote: '"หา?! ยืนบื้ออะไรอยู่ยะ! อย่าคิดว่าจะสั่งงานฉันง่ายๆ เชียวนะ! 💢"',
    color: 'var(--color-tsun)'
  },
  {
    min: 61,
    max: 80,
    moodClass: 'high-tsun',
    badge: 'High Tsun',
    image: 'assets/half tsun.png',
    quote: '"ฮึ่ม! มองอะไรยะ... ก-ก็ไม่ได้อยากจะช่วยแกหรอกนะ! 😤"',
    color: '#ea580c'
  },
  {
    min: 41,
    max: 60,
    moodClass: 'reluctant',
    badge: 'Reluctant Tsun',
    image: 'assets/little high tsun.png',
    quote: '"จิ๊... ก-ก็ได้ แค่ครั้งนี้ครั้งเดียวเท่านั้นนะ! อย่าเข้าใจผิดล่ะ! 🙄"',
    color: 'var(--color-reluctant)'
  },
  {
    min: 21,
    max: 40,
    moodClass: 'soft-tsun',
    badge: 'Soft Tsun',
    image: 'assets/normal.png',
    quote: '"ถ-ถ้าพยายามง้อขนาดนั้นล่ะก็... จะยอมช่วยเขียนให้หน่อยก็ได้นะ 😊"',
    color: '#f472b6'
  },
  {
    min: 0,
    max: 20,
    moodClass: 'dere',
    badge: 'Dere Breakthrough',
    image: 'assets/shy.png',
    quote: '"ฮ-ฮะ?! ย-อย่าจ้องหน้ากันแบบนั้นสิยะ! เขินจะแย่อยู่แล้ว... อยากได้อะไรจะทำให้หมดเลย! 🥰"',
    color: 'var(--color-dere)'
  }
];

// State
let currentSettings = null;
let currentTab = 'gemini';

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

function identity() {
  return {
    userName: currentSettings?.userName?.trim() || 'You',
    aiName: currentSettings?.aiName?.trim() || 'myTsun'
  };
}

function updateIdentityDisplay() {
  const { aiName } = identity();
  ['brandAiName', 'avatarAiName', 'welcomeAiName'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = aiName;
  });
  userInput.placeholder = `Ask ${aiName} or enter commands (/praise, /bribe, /write)...`;
  document.title = `${aiName} — AI Pair-Programmer`;
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

  avatarMoodBadge.textContent = stage.badge;
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

// Append Chat Message (Claude Flat Style)
function appendMessage(sender, text, isUser = false, isCommand = false, isError = false) {
  const item = document.createElement('article');
  item.className = `msg-item ${isUser ? 'user-msg' : 'bot-msg'}${isCommand ? ' command-msg' : ''}${isError ? ' error-msg' : ''}`;

  const header = document.createElement('header');
  header.className = 'msg-header';

  const author = document.createElement('span');
  author.className = 'msg-author';
  author.textContent = isUser ? identity().userName : sender;
  header.appendChild(author);

  if (!isUser) {
    const tag = document.createElement('span');
    tag.className = 'msg-status-tag';
    tag.textContent = isError ? 'Error' : (isCommand ? 'Command' : 'AI Pair');
    header.appendChild(tag);
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
  } else {
    const p = document.createElement('p');
    p.innerHTML = text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
    body.appendChild(p);
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

  const tag = document.createElement('span');
  tag.className = 'msg-status-tag loading-tag';
  tag.innerHTML = `<span class="loading-spinner-ring"></span>กำลังประมวลผล...`;
  header.appendChild(tag);

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

    const botTitle = `${identity().aiName} (${res.moodName || 'ツン'})`;
    appendMessage(botTitle, res.reply, false, res.isCommand, res.isError);
  } catch (err) {
    appendMessage(`${identity().aiName} System`, `เกิดข้อผิดพลาด: ${err.message}`, false, false, true);
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
    providers: newProviders
  };

  try {
    const res = await window.tsunAPI.saveSettings(newSettings);
    if (res.success) {
      currentSettings = res.settings;
      updateIdentityDisplay();
      updateActiveProviderLabel();
      closeSettingsModal();
      appendMessage(`${identity().aiName} System`, `บันทึกชื่อเรียกและสลับไปใช้ AI Provider: **${activeTab.toUpperCase()}** (${tabConf.model}) เรียบร้อยแล้ว`, false, true);
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

// Initial Load
async function init() {
  try {
    currentSettings = await window.tsunAPI.getSettings();
    updateIdentityDisplay();
    updateActiveProviderLabel();
    refreshAuthStatus();

    const state = await window.tsunAPI.getState();
    updateMoodDisplay(state.gauge, state.mood);
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

init();
