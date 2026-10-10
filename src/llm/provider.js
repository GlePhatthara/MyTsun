/**
 * LLM Provider Module for myTsun
 * Supports Google Gemini (Default), OpenAI/Compatible (Claude/Ollama), and MockProvider (offline/testing).
 */

export class BaseLLMProvider {
  /**
   * @param {object} options
   */
  constructor(options = {}) {
    this.name = options.name || 'BaseLLMProvider';
    this.model = options.model || 'default';
  }

  /**
   * Generates a response from the LLM
   * @param {object} params
   * @param {string} params.prompt User message
   * @param {string} [params.systemInstruction] System prompt
   * @param {Array<{role: string, content: string}>} [params.history]
   * @param {number} [params.temperature]
   * @returns {Promise<string>} Generated text
   */
  async generate(params) {
    throw new Error('generate() must be implemented by subclass');
  }
}

/**
 * MockProvider for offline development, local unit tests, and demo without API keys.
 */
export class MockProvider extends BaseLLMProvider {
  constructor(options = {}) {
    super({ name: 'MockProvider', model: 'mock-tsundere-v1', ...options });
    this.customResponses = options.responses || null;
    this.lastRequest = null;
  }

  async generate({ prompt, systemInstruction = '', history = [], temperature = 0.7 }) {
    this.lastRequest = { prompt, systemInstruction, history, temperature };

    if (this.customResponses && typeof this.customResponses === 'function') {
      return this.customResponses({ prompt, systemInstruction, history });
    }

    // Analyze prompt for mock sentiment evaluation
    let mockDelta = 0;
    let mockReason = 'คำถามทั่วไป ไม่กระทบต่อเกจ';
    let mockCategory = 'neutral';

    const pLower = (prompt || '').toLowerCase();
    if (/น่ารัก|เก่ง|สุดยอด|ขอบคุณ|รัก|เค้ก|ขนม|ช็อกโกแลต|cute|awesome|great|cake/.test(pLower)) {
      mockDelta = -15;
      mockReason = 'ได้รับคำชมหรือของหวาน ทำให้รู้สึกเขินอายและใจอ่อนลง';
      mockCategory = 'increase';
    } else if (/โง่|กาก|น่ารำคาญ|เดี๋ยวนี้|รีบ|stupid|idiot|hurry/.test(pLower)) {
      mockDelta = 10;
      mockReason = 'คำพูดกระแทกกระทั้นหรือสั่งการห้วนๆ เพิ่มความหงุดหงิด';
      mockCategory = 'decrease';
    }

    const impactTag = `\n<!-- HEART_IMPACT: {"delta": ${mockDelta}, "reason": "${mockReason}", "category": "${mockCategory}"} -->`;

    // Detect mood from systemInstruction
    if (systemInstruction.includes('Extreme Tsun')) {
      return `หา?! นี่แกสั่งอะไรของแกเนี่ย?! "${prompt}" งั้นเหรอ? บ้าหรือเปล่า! เรื่องแค่นี้ทำไมไม่ไปเขียนเองยะ! ฉันไม่ช่วยหรอกนะ ไปหัดเขียนโค้ดมาใหม่ไป๊! 💢${impactTag}`;
    }

    if (systemInstruction.includes('Reluctant Tsun')) {
      return `ฮึ่ม! ก-ก็ไม่ได้อยากจะช่วยแกเขียน "${prompt}" หรอกนะ! แต่เห็นแกนั่งงมแล้วมันขัดตาสุดๆ ช-ช่างเถอะน่า! คราวนี้จะยอมบอกวิธีทำให้ก็ได้ แต่จำไว้ด้วยล่ะว่าอย่าเข้าใจผิดเด็ดขาด! 😤${impactTag}`;
    }

    if (systemInstruction.includes('Dere Breakthrough')) {
      return `ก-ก็ถ้าเป็นเธอขอร้องล่ะก็... จะช่วยเขียน "${prompt}" ให้แบบสุดฝีมือเลยก็ได้! ย-อย่าจ้องหน้าฉันตอนเขินสิยะ ไอบ้า! รีบๆ เอาโค้ดนี้ไปรันได้แล้ว แล้วอย่าลืมพักผ่อนด้วยล่ะ... เป็นห่วงนะ... ม-หมายถึงเป็นห่วงโปรเจกต์น่ะ! 🥰😳${impactTag}`;
    }

    return `ฮึ่ม! น-นี่คำตอบสำหรับ "${prompt}" รีบๆ รับไปซะสิยะ!${impactTag}`;
  }
}

/**
 * Google Gemini Provider (Official default)
 * Connects directly using Node 18+ native fetch without heavy external dependencies.
 */
export class GeminiProvider extends BaseLLMProvider {
  /**
   * @param {object} options
   * @param {string} [options.apiKey]
   * @param {string} [options.model]
   * @param {string} [options.baseUrl]
   */
  constructor(options = {}) {
    const apiKey = options.apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
    const model = options.model || (typeof process !== 'undefined' ? process.env?.GEMINI_MODEL : '') || 'gemini-3.5-flash';
    super({ name: 'GeminiProvider', model, ...options });
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generate({ prompt, systemInstruction = '', history = [], temperature = 0.7 }) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Please set the environment variable or pass apiKey in constructor.');
    }

    const modelName = String(this.model).trim().replace(/^models\//, '');
    if (!modelName) throw new Error('A Gemini model ID is required. For example: gemini-3.5-flash');
    const endpoint = `${this.baseUrl}/models/${encodeURIComponent(modelName)}:generateContent`;

    const contents = [];

    // Map conversation history
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content || '' }]
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const requestBody = {
      contents,
      generationConfig: {
        temperature: Number(temperature) || 0.7,
        maxOutputTokens: 2048
      }
    };

    if (systemInstruction && systemInstruction.trim().length > 0) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Header auth is Google\'s current recommended form and avoids
        // exposing a key in URLs, logs, and proxy history.
        'x-goog-api-key': this.apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Gemini API Error (${response.status} ${response.statusText})`;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error?.message) {
          errorMessage += `: ${parsed.error.message}`;
        }
      } catch {
        errorMessage += `: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

    if (!candidateText) {
      throw new Error('Gemini API returned empty response candidates');
    }

    return candidateText;
  }

  /** Return every model this API key can use with generateContent. */
  async listModels() {
    if (!this.apiKey) throw new Error('Enter a Gemini API key before loading models.');
    const response = await fetch(`${this.baseUrl}/models?pageSize=1000`, {
      headers: { 'x-goog-api-key': this.apiKey }
    });
    if (!response.ok) {
      throw new Error(`Gemini model list failed (${response.status}): ${await response.text()}`);
    }
    const data = await response.json();
    return (data.models || [])
      .filter((model) => (model.supportedGenerationMethods || []).includes('generateContent'))
      .map((model) => model.name?.replace(/^models\//, ''))
      .filter(Boolean)
      .sort();
  }
}

/**
 * OpenAI / Compatible Provider (supports OpenAI, Local Ollama, Groq, OpenRouter)
 */
export class OpenAICompatibleProvider extends BaseLLMProvider {
  /**
   * @param {object} options
   * @param {string} [options.apiKey]
   * @param {string} [options.model]
   * @param {string} [options.baseUrl]
   */
  constructor(options = {}) {
    const apiKey = options.apiKey || (typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : '');
    const model = options.model || (typeof process !== 'undefined' ? process.env?.OPENAI_MODEL : '') || 'gpt-4o';
    const baseUrl = options.baseUrl || (typeof process !== 'undefined' ? process.env?.OPENAI_BASE_URL : '') || 'https://api.openai.com/v1';
    super({ name: 'OpenAICompatibleProvider', model, ...options });
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async generate({ prompt, systemInstruction = '', history = [], temperature = 0.7 }) {
    const endpoint = `${this.baseUrl}/chat/completions`;
    const messages = [];

    if (systemInstruction && systemInstruction.trim().length > 0) {
      messages.push({ role: 'system', content: systemInstruction });
    }

    if (Array.isArray(history)) {
      for (const item of history) {
        messages.push({
          role: item.role === 'model' ? 'assistant' : item.role,
          content: item.content || ''
        });
      }
    }

    messages.push({ role: 'user', content: prompt });

    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: Number(temperature) || 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI-compatible API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    return choice?.message?.content?.trim() || '';
  }
}

/**
 * Anthropic Claude Provider
 */
export class ClaudeProvider extends BaseLLMProvider {
  /**
   * @param {object} options
   * @param {string} [options.apiKey]
   * @param {string} [options.model]
   * @param {string} [options.baseUrl]
   */
  constructor(options = {}) {
    const apiKey = options.apiKey || (typeof process !== 'undefined' ? process.env?.ANTHROPIC_API_KEY : '');
    const model = options.model || (typeof process !== 'undefined' ? process.env?.ANTHROPIC_MODEL : '') || 'claude-3-7-sonnet-20250219';
    const baseUrl = options.baseUrl || 'https://api.anthropic.com/v1';
    super({ name: 'ClaudeProvider', model, ...options });
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async generate({ prompt, systemInstruction = '', history = [], temperature = 0.7 }) {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set. Please provide API Key in settings or environment variable.');
    }

    const endpoint = `${this.baseUrl}/messages`;
    const messages = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        messages.push({
          role: item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user',
          content: item.content || ''
        });
      }
    }

    messages.push({ role: 'user', content: prompt });

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };

    const requestBody = {
      model: this.model,
      max_tokens: 2048,
      temperature: Number(temperature) || 0.7,
      messages
    };

    if (systemInstruction && systemInstruction.trim().length > 0) {
      requestBody.system = systemInstruction;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `Claude API Error (${response.status} ${response.statusText})`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) {
          errMsg += `: ${parsed.error.message}`;
        }
      } catch {
        errMsg += `: ${errText}`;
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    const textBlock = data.content?.find(c => c.type === 'text');
    return textBlock?.text?.trim() || '';
  }
}

/**
 * Factory function to create appropriate provider
 * @param {object} [options]
 * @returns {BaseLLMProvider}
 */
export function createProvider(options = {}) {
  const providerType = (options.provider || (typeof process !== 'undefined' ? process.env?.LLM_PROVIDER : null) || '').toLowerCase();

  if (providerType === 'mock') {
    return new MockProvider(options);
  }

  if (providerType === 'claude' || providerType === 'anthropic') {
    return new ClaudeProvider(options);
  }

  if (providerType === 'openai') {
    return new OpenAICompatibleProvider({
      baseUrl: options.baseUrl || 'https://api.openai.com/v1',
      model: options.model || 'gpt-4o-mini',
      ...options
    });
  }

  if (providerType === 'openrouter') {
    return new OpenAICompatibleProvider({
      baseUrl: options.baseUrl || 'https://openrouter.ai/api/v1',
      model: options.model || 'meta-llama/llama-3.3-70b-instruct',
      ...options
    });
  }

  if (providerType === 'ollama') {
    return new OpenAICompatibleProvider({
      baseUrl: options.baseUrl || 'http://localhost:11434/v1',
      model: options.model || 'llama3',
      apiKey: options.apiKey || 'ollama',
      ...options
    });
  }

  // If apiKey is explicitly provided or GEMINI_API_KEY exists, use Gemini
  const geminiKey = options.apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  if (geminiKey || providerType === 'gemini') {
    return new GeminiProvider({ ...options, apiKey: geminiKey });
  }

  const openAiKey = typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : '';
  if (openAiKey) {
    return new OpenAICompatibleProvider(options);
  }

  const claudeKey = typeof process !== 'undefined' ? process.env?.ANTHROPIC_API_KEY : '';
  if (claudeKey) {
    return new ClaudeProvider(options);
  }

  // Default fallback when no key is set: MockProvider for instant zero-config usability!
  return new MockProvider(options);
}
