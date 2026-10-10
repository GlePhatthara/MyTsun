import test from 'node:test';
import assert from 'node:assert/strict';
import { TsunDereState } from '../src/state/TsunDereState.js';
import {
  getAvatarLevel,
  getAvatarLines,
  getCompactFace,
  AVATAR_LEVELS
} from '../src/ui/asciiAvatar.js';
import {
  renderGaugeBar,
  renderToolBadge,
  renderDeltaBadge
} from '../src/ui/gaugeBar.js';
import {
  renderWelcomeBanner,
  renderStatusCard,
  renderTurnSummary
} from '../src/ui/tuiRenderer.js';
import { myTsunChatSession } from '../src/cli/chat.js';
import { MockProvider } from '../src/llm/provider.js';

test('TUI - getAvatarLevel maps gauge accurately', () => {
  assert.equal(getAvatarLevel(100), AVATAR_LEVELS.EXTREME_TSUN);
  assert.equal(getAvatarLevel(85), AVATAR_LEVELS.EXTREME_TSUN);
  assert.equal(getAvatarLevel(80), AVATAR_LEVELS.EXTREME_TSUN);

  assert.equal(getAvatarLevel(79), AVATAR_LEVELS.RELUCTANT_TSUN);
  assert.equal(getAvatarLevel(50), AVATAR_LEVELS.RELUCTANT_TSUN);
  assert.equal(getAvatarLevel(40), AVATAR_LEVELS.RELUCTANT_TSUN);

  assert.equal(getAvatarLevel(39), AVATAR_LEVELS.DERE_BREAKTHROUGH);
  assert.equal(getAvatarLevel(20), AVATAR_LEVELS.DERE_BREAKTHROUGH);
  assert.equal(getAvatarLevel(15), AVATAR_LEVELS.DERE_BREAKTHROUGH);

  assert.equal(getAvatarLevel(14), AVATAR_LEVELS.MAX_DERE);
  assert.equal(getAvatarLevel(0), AVATAR_LEVELS.MAX_DERE);
});

test('TUI - getAvatarLines returns multi-line ASCII art for all states', () => {
  const angryLines = getAvatarLines(100, { colored: false });
  assert.ok(angryLines.length >= 5);
  assert.ok(angryLines.some((l) => l.includes('皿') || l.includes('💢')));

  const poutingLines = getAvatarLines(60, { colored: false });
  assert.ok(poutingLines.length >= 5);
  assert.ok(poutingLines.some((l) => l.includes('￢')));

  const blushLines = getAvatarLines(30, { colored: false });
  assert.ok(blushLines.length >= 5);
  assert.ok(blushLines.some((l) => l.includes('///') || l.includes('♥')));

  const dereLines = getAvatarLines(5, { colored: false });
  assert.ok(dereLines.length >= 5);
  assert.ok(dereLines.some((l) => l.includes('★') || l.includes('♥♥')));
});

test('TUI - getCompactFace returns distinct expressions', () => {
  const faceExtreme = getCompactFace(100, false);
  const faceReluctant = getCompactFace(50, false);
  const faceDere = getCompactFace(25, false);
  const faceMax = getCompactFace(5, false);

  assert.ok(faceExtreme.includes('Extreme Tsun'));
  assert.ok(faceReluctant.includes('Reluctant Tsun'));
  assert.ok(faceDere.includes('Dere Breakthrough'));
  assert.ok(faceMax.includes('Maximum Dere'));
});

test('TUI - renderGaugeBar displays correct percentage and progress bar', () => {
  const bar100 = renderGaugeBar(100, { colored: false, width: 20 });
  assert.ok(bar100.includes('100% Tsun / 0% Dere'));
  assert.ok(bar100.includes('████████████████████'));

  const bar50 = renderGaugeBar(50, { colored: false, width: 20 });
  assert.ok(bar50.includes('50% Tsun / 50% Dere'));
  assert.ok(bar50.includes('██████████░░░░░░░░░░'));

  const bar0 = renderGaugeBar(0, { colored: false, width: 20 });
  assert.ok(bar0.includes('0% Tsun / 100% Dere'));
  assert.ok(bar0.includes('░░░░░░░░░░░░░░░░░░░░'));
});

test('TUI - renderToolBadge and renderDeltaBadge render correctly', () => {
  const lockedBadge = renderToolBadge(false, false);
  const unlockedBadge = renderToolBadge(true, false);
  assert.equal(lockedBadge, '[🔒 LOCKED]');
  assert.equal(unlockedBadge, '[🔓 UNLOCKED]');

  const plusDelta = renderDeltaBadge(10, false);
  const minusDelta = renderDeltaBadge(-25, false);
  const zeroDelta = renderDeltaBadge(0, false);

  assert.ok(plusDelta.includes('+10% Tsun'));
  assert.ok(minusDelta.includes('-25% Tsun'));
  assert.ok(zeroDelta.includes('±0%'));
});

test('TUI - renderWelcomeBanner contains key startup information', () => {
  const banner = renderWelcomeBanner({
    provider: 'TestProvider',
    model: 'test-model',
    colored: false
  });

  assert.ok(banner.includes('myTsun'));
  assert.ok(banner.includes('TestProvider'));
  assert.ok(banner.includes('/praise'));
  assert.ok(banner.includes('/bribe'));
  assert.ok(banner.includes('/avatar'));
});

test('TUI - renderStatusCard renders full card with avatar and gauge', () => {
  const state = new TsunDereState(100);
  const card = renderStatusCard(state, { colored: false, delta: 0, reason: 'Test Reason' });

  assert.ok(card.includes('┌'));
  assert.ok(card.includes('┘'));
  assert.ok(card.includes('เกจ:'));
  assert.ok(card.includes('เครื่องมือ:'));
  assert.ok(card.includes('Test Reason'));
});

test('TUI - renderTurnSummary outputs compact overview', () => {
  const state = new TsunDereState(65);
  const summary = renderTurnSummary(
    { stateDelta: { delta: -15, reason: 'ได้รับคำชม' } },
    state,
    false
  );

  assert.ok(summary.includes('Reluctant Tsun'));
  assert.ok(summary.includes('-15% Tsun'));
  assert.ok(summary.includes('เครื่องมือ: [🔒 LOCKED]'));
  assert.ok(summary.includes('ได้รับคำชม'));
});

test('TUI - ChatSession handles /avatar and /card without affecting gauge', async () => {
  const state = new TsunDereState(90);
  const session = new myTsunChatSession({
    state,
    provider: new MockProvider()
  });

  // /avatar
  const avatarTurn = await session.handleTurn('/avatar');
  assert.equal(avatarTurn.gauge, 90);
  assert.ok(avatarTurn.reply.includes('อวาตาร์สาวซึน'));

  // /card
  const cardTurn = await session.handleTurn('/card');
  assert.equal(cardTurn.gauge, 90);
  assert.ok(cardTurn.reply.includes('เกจ:'));

  // /gauge
  const gaugeTurn = await session.handleTurn('/gauge');
  assert.equal(gaugeTurn.gauge, 90);
  assert.ok(gaugeTurn.reply.includes('เกจ:'));
});
