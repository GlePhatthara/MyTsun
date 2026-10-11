/**
 * PaxaLabs Text-to-Speech (TTS) Integration for MyTsun
 * Specialized for Tsundere Persona voice ("khanomchan" with dynamic emotion tags)
 */

export const PAXALABS_DEFAULT_KEY = 'pxa_Q2u8EI5300gToSiqZXwjvCGtOnNEqGEkJwmSHfnM';
export const PAXALABS_DEFAULT_VOICE = 'khanomchan';
export const PAXALABS_DEFAULT_MODEL = 'paxa-tts-flash-v1';
export const PAXALABS_API_URL = 'https://api.paxalabs.com/v1/tts';

/**
 * Clean markdown, code blocks, and emojis/kaomojis for natural speech synthesis
 * @param {string} rawText 
 * @returns {string}
 */
export function sanitizeTextForTTS(rawText) {
  if (typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Remove markdown code blocks (```code```)
  text = text.replace(/```[\s\S]*?```/g, ' ');

  // 2. Remove inline code (`code`)
  text = text.replace(/`[^`]+`/g, ' ');

  // 3. Remove URLs
  text = text.replace(/https?:\/\/\S+/g, ' ');

  // 4. Remove image/link markdown syntax [label](url)
  text = text.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');

  // 5. Remove kaomojis and common symbol patterns
  const kaomojiPatterns = [
    /\(>[_<]<\)/g,
    /\(\*[\s\S]*?\*\)/g,
    /\(T_T\)/g,
    /\(｡•́︿•̀｡\)/g,
    /\(¬_¬\)/g,
    /\(o\^\^o\)/g,
    /\(o\^\^\)o/g,
    /\(\*ﾉωﾉ\)/g,
    /\(\*\/ω＼\*\)/g,
    /\(╬ಠ益ಠ\)/g,
    /¯\\_\(ツ\)_?\/¯/g,
    /O-O/g,
    />0</g,
    /><\b/g,
    /♡/g,
    /☆/g,
    /\[เค้ก\]/g,
    /\(เกจ\s*Tsun[^\)]*\)/gi,
    /เกจ\s*Tsun\s*[+-]?\d+%/gi
  ];
  for (const pat of kaomojiPatterns) {
    text = text.replace(pat, ' ');
  }

  // 6. Remove remaining unicode emojis
  text = text.replace(/\p{Extended_Pictographic}/gu, ' ');

  // 7. Strip markdown header/bold/italic markers
  text = text.replace(/[#*_~`]/g, '');

  // 8. Collapse whitespace and trim
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Format dialogue with PaxaLabs emotion tags for Tsundere voice:
 * - Haughty/arrogant/tsun tone: [annoyed] or [angry]
 * - Embarrassed/flustered/dere tone: [nervous]
 * 
 * @param {string} text 
 * @param {Object} options { mood: string, gauge: number }
 * @returns {string}
 */
export function injectTsundereEmotionTags(text, options = {}) {
  const clean = sanitizeTextForTTS(text);
  if (!clean) return '';

  const { gauge = 80, mood = 'high-tsun' } = options;

  // Split into sentences or thought clauses
  const rawSentences = clean.split(/(?<=[.!?\n\r])|\s*(?:,\s*|\s*---\s*|\.\.\.\s*)/).filter(s => s && s.trim());
  if (rawSentences.length === 0) {
    return clean;
  }

  // Clues for blushing / embarrassment / flustered tsundere
  const shyRegex = /(?:[ก-ฮ]-[ก-ฮ\u0E00-\u0E7F]+|เขิน|หน้าแดง|ชอบ|ห่วง|คิดถึง|ใจเต้น|ยอมช่วย|ทำเพื่อเธอ|น่ารัก|ขอบคุณ|ทำไมต้อง|บ้าจริง|อ-อะไร|ต-แต่|ย-อย่า|ก-ก็|ฮ-ฮะ|ว-ว้าย|ช-ช่วย)/i;
  
  // Clues for haughty / angry / scoffing tsundere
  const haughtyRegex = /(?:หา\?!|เชอะ|ฮึ่ม|ย่ะ|ยะ|อย่าคิด|อย่ามา|ไร้สาระ|ไม่สน|น่ารำคาญ|ช่างเถอะ|ยืนบื้อ|สั่งงาน|ไม่อยากช่วย)/i;

  let taggedParts = [];
  let lastTag = '';

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    let desiredTag = '';

    if (shyRegex.test(trimmed)) {
      desiredTag = 'nervous';
    } else if (haughtyRegex.test(trimmed)) {
      desiredTag = 'annoyed';
    } else {
      // Default based on gauge/mood
      if (gauge <= 40 || mood === 'dere' || mood === 'soft-tsun') {
        desiredTag = 'nervous';
      } else {
        desiredTag = 'annoyed';
      }
    }

    if (desiredTag && desiredTag !== lastTag) {
      taggedParts.push(`[${desiredTag}] ${trimmed}`);
      lastTag = desiredTag;
    } else {
      taggedParts.push(trimmed);
    }
  }

  return taggedParts.join(' ').trim();
}

/**
 * Generate Text-to-Speech audio buffer via PaxaLabs API
 * @param {string} text 
 * @param {Object} options
 * @returns {Promise<{ success: boolean, audioBase64?: string, error?: string }>}
 */
export async function generatePaxaTTS(text, options = {}) {
  try {
    const apiKey = options.apiKey || PAXALABS_DEFAULT_KEY;
    const voice = options.voice || PAXALABS_DEFAULT_VOICE;
    const model = options.model || PAXALABS_DEFAULT_MODEL;

    // Apply Tsundere emotion tags if voice is khanomchan
    let finalText = text;
    if (voice === 'khanomchan') {
      finalText = injectTsundereEmotionTags(text, options);
    } else {
      finalText = sanitizeTextForTTS(text);
    }

    if (!finalText || finalText.trim().length === 0) {
      return { success: false, error: 'Empty text for TTS' };
    }

    // Limit text length to PaxaLabs safety threshold (5000 chars)
    if (finalText.length > 2500) {
      finalText = finalText.slice(0, 2500) + '...';
    }

    const response = await fetch(PAXALABS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: finalText,
        voice,
        model
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `PaxaLabs API HTTP ${response.status}: ${errText}` };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      success: true,
      audioBase64: base64Audio,
      spokenText: finalText
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}
