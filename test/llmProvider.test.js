import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MockProvider,
  GeminiProvider,
  OpenAICompatibleProvider,
  createProvider
} from '../src/llm/provider.js';

test('MockProvider - Generates angry reaction for Extreme Tsun prompt', async () => {
  const provider = new MockProvider();
  const reply = await provider.generate({
    prompt: 'ช่วยเขียนโค้ดต่อหน่อย',
    systemInstruction: 'You are in Extreme Tsun mode. 80-100%'
  });

  assert.ok(reply.includes('หา?!'), 'Should include shocked outburst');
  assert.ok(reply.includes('💢'), 'Should include angry emoji');
});

test('MockProvider - Generates reluctant reaction for Reluctant Tsun prompt', async () => {
  const provider = new MockProvider();
  const reply = await provider.generate({
    prompt: 'แก้บั๊กให้หน่อย',
    systemInstruction: 'You are in Reluctant Tsun mode. 40-79%'
  });

  assert.ok(reply.includes('ก-ก็ไม่ได้อยากจะช่วย'), 'Should include reluctant excuse');
  assert.ok(reply.includes('อย่าเข้าใจผิด'), 'Should include warning not to misunderstand');
});

test('MockProvider - Generates flustered sweet reaction for Dere Breakthrough prompt', async () => {
  const provider = new MockProvider();
  const reply = await provider.generate({
    prompt: 'ทำปุ่มกดสวยๆ ให้หน่อย',
    systemInstruction: 'You are in Dere Breakthrough mode. 0-39%'
  });

  assert.ok(reply.includes('ถ้าเป็นเธอขอร้องล่ะก็'), 'Should include dere agreement');
  assert.ok(reply.includes('🥰😳'), 'Should include blush emoji');
});

test('GeminiProvider - Throws clear error when apiKey is missing', async () => {
  const provider = new GeminiProvider({ apiKey: '' });
  await assert.rejects(
    async () => {
      await provider.generate({ prompt: 'test' });
    },
    {
      message: /GEMINI_API_KEY is not set/
    }
  );
});

test('GeminiProvider normalizes model IDs and sends API key in a header', async (t) => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'first' }, { text: ' second' }] } }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const provider = new GeminiProvider({ apiKey: 'test-key', model: 'models/gemini-custom' });
  assert.equal(await provider.generate({ prompt: 'ping' }), 'first second');
  assert.match(request.url, /\/models\/gemini-custom:generateContent$/);
  assert.equal(request.options.headers['x-goog-api-key'], 'test-key');
  assert.doesNotMatch(request.url, /test-key/);
});

test('createProvider - Defaults to MockProvider when no API key is configured', () => {
  const provider = createProvider({ apiKey: '', provider: 'mock' });
  assert.equal(provider.name, 'MockProvider');
});

test('createProvider - Creates GeminiProvider when apiKey is supplied', () => {
  const provider = createProvider({ apiKey: 'fake-test-key-123' });
  assert.equal(provider.name, 'GeminiProvider');
});

test('createProvider - Creates OpenAICompatibleProvider when provider is openai', () => {
  const provider = createProvider({ provider: 'openai', apiKey: 'fake-openai-key' });
  assert.equal(provider.name, 'OpenAICompatibleProvider');
});
