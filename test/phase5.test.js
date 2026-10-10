import test from 'node:test';
import assert from 'node:assert/strict';
import { TsunDereState } from '../src/state/TsunDereState.js';
import { detectEasterEgg, EASTER_EGGS } from '../src/easter/index.js';
import { SoundEngine } from '../src/sound/index.js';
import { myTsunChatSession } from '../src/cli/chat.js';
import {
  AVATAR_LEVELS,
  getAvatarLines,
  getCompactFace
} from '../src/ui/asciiAvatar.js';

test('Easter Egg Detection - accurately catches easter egg phrases and commands', () => {
  // Nuke
  assert.equal(detectEasterEgg('rm -rf /')?.type, EASTER_EGGS.NUKE);
  assert.equal(detectEasterEgg('rmdir /s /q C:\\')?.type, EASTER_EGGS.NUKE);
  assert.equal(detectEasterEgg('/nuke')?.type, EASTER_EGGS.NUKE);
  assert.equal(detectEasterEgg('/selfdestruct')?.type, EASTER_EGGS.NUKE);

  // Beg
  assert.equal(detectEasterEgg('/beg')?.type, EASTER_EGGS.BEG);
  assert.equal(detectEasterEgg('/please')?.type, EASTER_EGGS.BEG);
  assert.equal(detectEasterEgg('ขอร้องล่ะช่วยที')?.type, EASTER_EGGS.BEG);
  assert.equal(detectEasterEgg('ได้โปรดนะ')?.type, EASTER_EGGS.BEG);

  // Confess
  assert.equal(detectEasterEgg('/love')?.type, EASTER_EGGS.CONFESS);
  assert.equal(detectEasterEgg('/confess')?.type, EASTER_EGGS.CONFESS);
  assert.equal(detectEasterEgg('ฉันรักเธอนะ')?.type, EASTER_EGGS.CONFESS);
  assert.equal(detectEasterEgg('i love you')?.type, EASTER_EGGS.CONFESS);

  // Sudo
  assert.equal(detectEasterEgg('sudo do something')?.type, EASTER_EGGS.SUDO);

  // Coffee
  assert.equal(detectEasterEgg('/coffee')?.type, EASTER_EGGS.COFFEE);
  assert.equal(detectEasterEgg('เอากาแฟมาฝาก')?.type, EASTER_EGGS.COFFEE);

  // Non-easter egg
  assert.equal(detectEasterEgg('hello there'), null);
});

test('SoundEngine - enables, disables, and safely plays presets without throwing', () => {
  const sound = new SoundEngine({ enabled: false });
  assert.equal(sound.enabled, false);

  sound.setEnabled(true);
  assert.equal(sound.enabled, true);

  assert.doesNotThrow(() => sound.play('baka'));
  assert.doesNotThrow(() => sound.play('hmph'));
  assert.doesNotThrow(() => sound.play('dere'));
  assert.doesNotThrow(() => sound.play('nuke'));
  assert.doesNotThrow(() => sound.play('bribe'));
  assert.doesNotThrow(() => sound.play('beg'));
  assert.doesNotThrow(() => sound.beepTerminal(1));

  sound.setEnabled(false);
  assert.doesNotThrow(() => sound.play('baka'));
});

test('TsunDereState - Easter Eggs mutate state correctly', () => {
  const state = new TsunDereState(50);

  // Sudo should provoke the bot and increase Tsun
  const sudoRes = state.processInput('sudo make me a sandwich');
  assert.equal(sudoRes.specialEvent, 'sudo');
  assert.equal(sudoRes.currentGauge, 65);
  assert.equal(sudoRes.soundCue, 'baka');

  // Coffee should soothe and reduce Tsun
  const coffeeRes = state.processInput('/coffee');
  assert.equal(coffeeRes.specialEvent, 'coffee');
  assert.equal(coffeeRes.currentGauge, 50);

  // Begging streak
  const beg1 = state.processInput('ขอร้องล่ะ');
  assert.equal(beg1.specialEvent, 'beg');
  assert.equal(beg1.currentGauge, 40);

  const beg2 = state.processInput('ได้โปรดเถอะ');
  assert.equal(beg2.specialEvent, 'beg');
  assert.equal(beg2.currentGauge, 30);

  const beg3 = state.processInput('/beg');
  assert.equal(beg3.specialEvent, 'beg_combo');
  assert.equal(beg3.currentGauge, 0); // 30 - 30 = 0
  assert.equal(beg3.soundCue, 'dere');

  // Confession overheat
  state.setGauge(80);
  const confessRes = state.processInput('เค้ารักเธอนะ!');
  assert.equal(confessRes.specialEvent, 'confess');
  assert.equal(confessRes.currentGauge, 35);
  assert.equal(confessRes.soundCue, 'dere');

  // Nuke trap triggers max Tsun (100)
  const nukeRes = state.processInput('rm -rf /');
  assert.equal(nukeRes.specialEvent, 'nuke');
  assert.equal(nukeRes.currentGauge, 100);
  assert.equal(nukeRes.soundCue, 'nuke');
});

test('ASCII Avatar - Supports Meltdown and Critical Blush modes', () => {
  const meltdownLines = getAvatarLines(AVATAR_LEVELS.MELTDOWN, { colored: false });
  assert.ok(meltdownLines.some((l) => l.includes('☠') || l.includes('💥')));

  const blushLines = getAvatarLines(AVATAR_LEVELS.CRITICAL_BLUSH, { colored: false });
  assert.ok(blushLines.some((l) => l.includes('💨') || l.includes('♨')));

  const meltdownFace = getCompactFace(AVATAR_LEVELS.MELTDOWN, false);
  assert.ok(meltdownFace.includes('MELTDOWN'));

  const blushFace = getCompactFace(AVATAR_LEVELS.CRITICAL_BLUSH, false);
  assert.ok(blushFace.includes('CRITICAL OVERHEAT'));
});

test('ChatSession - Intercepts Easter Eggs and sound commands', async () => {
  const mockSound = new SoundEngine({ enabled: false });
  let lastSoundPlayed = null;
  mockSound.play = (preset) => {
    lastSoundPlayed = preset;
  };

  const session = new myTsunChatSession({
    sound: mockSound
  });

  // Sound toggle commands
  const soundStatus = await session.handleTurn('/sound');
  assert.ok(soundStatus.reply.includes('Sound FX'));

  const soundOn = await session.handleTurn('/sound on');
  assert.ok(soundOn.reply.includes('เปิดระบบ Sound FX'));
  assert.equal(mockSound.enabled, true);

  const soundTest = await session.handleTurn('/sound play baka');
  assert.ok(soundTest.reply.includes('เล่นเสียงพรีเซ็ต [baka]'));
  assert.equal(lastSoundPlayed, 'baka');

  const soundOff = await session.handleTurn('/sound off');
  assert.ok(soundOff.reply.includes('ปิดระบบ Sound FX'));
  assert.equal(mockSound.enabled, false);

  // Turn sounds back on for easter egg tests
  session.sound.setEnabled(true);

  // Nuke easter egg
  const nukeTurn = await session.handleTurn('rm -rf /');
  assert.ok(nukeTurn.reply.includes('NUKE TRAP TRIGGERED'));
  assert.equal(nukeTurn.gauge, 100);
  assert.equal(lastSoundPlayed, 'nuke');

  // Confession easter egg
  const confessTurn = await session.handleTurn('/love');
  assert.ok(confessTurn.reply.includes('CRITICAL BLUSH OVERHEAT'));
  assert.equal(lastSoundPlayed, 'dere');
});
