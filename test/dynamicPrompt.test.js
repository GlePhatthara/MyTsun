import test from 'node:test';
import assert from 'node:assert/strict';
import { TsunDereState } from '../src/state/TsunDereState.js';
import { buildDynamicPrompt, PERSONA_PROMPTS } from '../src/prompt/dynamicPrompt.js';

test('Dynamic Prompt - Generates Extreme Tsun prompt when gauge is 80-100%', () => {
  const state = new TsunDereState(100);
  const prompt = buildDynamicPrompt(state);

  assert.ok(prompt.includes('Extreme Tsun'), 'Should include Extreme Tsun name');
  assert.ok(prompt.includes('Tsun Gauge: 100%'), 'Should include gauge percentage');
  assert.ok(prompt.includes('Locked'), 'Tools should be marked as locked');
  assert.ok(prompt.includes('อันตะบากะ'), 'Should contain extreme tsun phrase');
});

test('Dynamic Prompt - Generates Reluctant Tsun prompt when gauge is 40-79%', () => {
  const state = new TsunDereState(60);
  const prompt = buildDynamicPrompt(state);

  assert.ok(prompt.includes('Reluctant Tsun'), 'Should include Reluctant Tsun name');
  assert.ok(prompt.includes('Tsun Gauge: 60%'), 'Should include gauge percentage');
  assert.ok(prompt.includes('Locked'), 'Tools should be marked as locked in 60%');
  assert.ok(prompt.includes('ก-ก็ไม่ได้อยากช่วยหรอกนะ'), 'Should contain classic tsundere excuse');
});

test('Dynamic Prompt - Generates Dere Breakthrough prompt when gauge is < 40%', () => {
  const state = new TsunDereState(20);
  const prompt = buildDynamicPrompt(state);

  assert.ok(prompt.includes('Dere Breakthrough'), 'Should include Dere Breakthrough name');
  assert.ok(prompt.includes('Tsun Gauge: 20%'), 'Should include gauge percentage');
  assert.ok(prompt.includes('Unlocked'), 'Tools should be marked as unlocked');
  assert.ok(prompt.includes('หน้าแดง'), 'Should contain blushing cues');
});

test('Dynamic Prompt - Includes contextual notes when bribe or praise occurs', () => {
  const state = new TsunDereState(70);
  const bribePrompt = buildDynamicPrompt(state, {
    lastReason: 'Sweet bribe accepted',
    lastCommand: 'bribe'
  });
  assert.ok(bribePrompt.includes('bribed you with sweets'), 'Should mention bribe sweets');

  const praisePrompt = buildDynamicPrompt(state, {
    lastReason: 'Praise accepted',
    lastCommand: 'praise'
  });
  assert.ok(praisePrompt.includes('complimented you'), 'Should mention compliment fluster');
});

test('Dynamic Prompt - Uses the chosen names for the AI and user', () => {
  const prompt = buildDynamicPrompt(new TsunDereState(50), {
    aiName: 'น้องซึน',
    userName: 'มินท์'
  });

  assert.ok(prompt.includes('IDENTITY: น้องซึน'));
  assert.ok(prompt.includes('user prefers to be called "มินท์"'));
});
