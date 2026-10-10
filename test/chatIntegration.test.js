import test from 'node:test';
import assert from 'node:assert/strict';
import { TsunDereState } from '../src/state/TsunDereState.js';
import { TsunDevChatSession } from '../src/cli/chat.js';
import { MockProvider } from '../src/llm/provider.js';

test('TsunDevChatSession - Full interaction lifecycle from Extreme Tsun to Dere Breakthrough', async () => {
  const state = new TsunDereState(100);
  const provider = new MockProvider();
  const session = new TsunDevChatSession({ state, provider });

  // 1. Initial extreme tsun turn
  const turn1 = await session.handleTurn('ช่วยเขียนโค้ดหน่อย');
  assert.equal(turn1.gauge, 100);
  assert.ok(turn1.reply.includes('หา?!'), 'Should insult user at 100% Tsun');

  // 2. Query /gauge command
  const turnGauge = await session.handleTurn('/gauge');
  assert.ok(turnGauge.reply.includes('สถานะปัจจุบัน: Tsun 100%'));

  // 3. Bribe with cake (-35) -> Gauge becomes 65% (Reluctant Tsun)
  const turn2 = await session.handleTurn('/bribe เอาเค้กสตรอว์เบอร์รีมาให้');
  assert.equal(turn2.gauge, 65);
  assert.ok(turn2.reply.includes('ก-ก็ไม่ได้อยากจะช่วย'), 'Should act reluctant tsun at 65%');

  // 4. Sweet praise (-25) -> Gauge becomes 40% (Boundary of Reluctant Tsun)
  const turn3 = await session.handleTurn('/praise เก่งที่สุดเลย น่ารักมาก');
  assert.equal(turn3.gauge, 40);

  // 5. Apologize sincerely (-10) -> Gauge drops to 30% (< 40% -> Dere Breakthrough!)
  const turn4 = await session.handleTurn('/apologize ขอโทษนะที่ก่อนหน้านี้สั่งห้วนๆ');
  assert.equal(turn4.gauge, 30);
  assert.ok(turn4.reply.includes('ถ้าเป็นเธอขอร้องล่ะก็'), 'Should be flustered and sweet in Dere Breakthrough');
  assert.equal(turn4.mood.toolsAllowed, true, 'Tools should be unlocked at Dere Breakthrough');

  // 6. Check history recording
  assert.ok(session.history.length >= 8, 'Should keep track of conversation history');
});

test('TsunDevChatSession - Handles empty input gracefully', async () => {
  const session = new TsunDevChatSession({ provider: new MockProvider() });
  const turn = await session.handleTurn('   ');
  assert.ok(turn.reply.includes('ฮึ่ม! เงียบทำไมยะ'));
});
