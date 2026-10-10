import test from 'node:test';
import assert from 'node:assert/strict';
import { TsunDereState, MOODS } from '../src/state/TsunDereState.js';

test('TsunDereState - Initial state is 100% Tsun with locked tools', () => {
  const state = new TsunDereState();
  assert.equal(state.getGauge(), 100);
  assert.equal(state.getMood().id, MOODS.EXTREME_TSUN.id);
  assert.equal(state.isToolAllowed(), false);
});

test('TsunDereState - /praise reduces Tsun gauge', () => {
  const state = new TsunDereState(100);
  const result = state.processInput('/praise ขอบคุณนะ');
  assert.equal(result.delta, -25); // contains sweet keyword "ขอบคุณ"
  assert.equal(state.getGauge(), 75);
  assert.equal(state.getMood().id, MOODS.RELUCTANT_TSUN.id);
});

test('TsunDereState - /praise with standard text decreases Tsun by 15', () => {
  const state = new TsunDereState(100);
  const result = state.processInput('/praise โค้ดนี้ดูเป็นระเบียบดีนะ');
  assert.equal(result.delta, -15);
  assert.equal(state.getGauge(), 85);
  assert.equal(state.getMood().id, MOODS.EXTREME_TSUN.id);
});

test('TsunDereState - /bribe with dessert gives sweet snack bonus (-35)', () => {
  const state = new TsunDereState(100);
  const result = state.processInput('/bribe เอาเค้กช็อกโกแลตมาฝาก');
  assert.equal(result.delta, -35);
  assert.equal(state.getGauge(), 65);
  assert.equal(state.getMood().id, MOODS.RELUCTANT_TSUN.id);
});

test('TsunDereState - /bribe with regular item decreases Tsun by 25', () => {
  const state = new TsunDereState(100);
  const result = state.processInput('/bribe ปากกาหมึกซึมอันใหม่');
  assert.equal(result.delta, -25);
  assert.equal(state.getGauge(), 75);
});

test('TsunDereState - /apologize decreases Tsun by 10', () => {
  const state = new TsunDereState(80);
  const result = state.processInput('/apologize');
  assert.equal(result.delta, -10);
  assert.equal(state.getGauge(), 70);
});

test('TsunDereState - Demanding regular command increases Tsun by 5', () => {
  const state = new TsunDereState(50);
  const result = state.processInput('เขียนโปรแกรมบวกเลขเดี๋ยวนี้');
  assert.equal(result.delta, 5);
  assert.equal(state.getGauge(), 55);
});

test('TsunDereState - Polite natural-language request lowers Tsun slightly', () => {
  const state = new TsunDereState(50);
  const result = state.processInput('ช่วยเขียนโปรแกรมบวกเลขให้หน่อยนะ');
  assert.equal(result.delta, -3);
  assert.equal(state.getGauge(), 47);
});

test('TsunDereState - Natural-language praise lowers Tsun without a slash command', () => {
  const state = new TsunDereState(50);
  const result = state.processInput('วันนี้เธอเก่งมาก ขอบคุณนะ');
  assert.equal(result.delta, -10);
  assert.equal(state.getGauge(), 40);
});

test('TsunDereState - Neutral chat leaves the gauge unchanged', () => {
  const state = new TsunDereState(50);
  const result = state.processInput('วันนี้อากาศเป็นยังไงบ้าง');
  assert.equal(result.delta, 0);
  assert.equal(state.getGauge(), 50);
});

test('TsunDereState - Transitions to Dere Breakthrough and unlocks tools when gauge < 40', () => {
  const state = new TsunDereState(100);
  // Bribe with cake (-35) -> 65
  state.processInput('/bribe เค้ก');
  assert.equal(state.isToolAllowed(), false);

  // Sweet praise (-25) -> 40 (still reluctant)
  state.processInput('/praise เก่งที่สุดในโลกเลย');
  assert.equal(state.getGauge(), 40);
  assert.equal(state.isToolAllowed(), false);

  // Another praise (-15) -> 25 (dere breakthrough!)
  const result = state.processInput('/praise ขอรบกวนด้วยนะ');
  assert.equal(state.getGauge(), 25);
  assert.equal(state.getMood().id, MOODS.DERE_BREAKTHROUGH.id);
  assert.equal(state.isToolAllowed(), true);
  assert.equal(result.toolsAllowed, true);
});

test('TsunDereState - Gauge clamps between 0 and 100', () => {
  const state = new TsunDereState(10);
  state.processInput('/bribe ช็อกโกแลต');
  assert.equal(state.getGauge(), 0); // Not negative

  state.setGauge(98);
  state.processInput('สั่งงานด่วน');
  assert.equal(state.getGauge(), 100); // Not above 100
});

test('TsunDereState - Anti-Spam penalty triggers when user repeats 3 times', () => {
  const state = new TsunDereState(20); // starts in dere mode
  state.processInput('ทำไมยังไม่เสร็จ');
  state.processInput('ทำไมยังไม่เสร็จ');
  const spammed = state.processInput('ทำไมยังไม่เสร็จ');

  assert.equal(spammed.penaltyTriggered, true);
  assert.equal(state.getGauge(), 100);
  assert.equal(state.getMood().id, MOODS.EXTREME_TSUN.id);
  assert.equal(state.isToolAllowed(), false);
});

test('TsunDereState - Reset restores original state', () => {
  const state = new TsunDereState(20);
  state.reset();
  assert.equal(state.getGauge(), 100);
  assert.equal(state.history.length, 0);
});
