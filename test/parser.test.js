import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommand, CommandType } from '../src/commands/parser.js';

test('Command Parser - parses /praise with arguments', () => {
  const parsed = parseCommand('/praise วันนี้เก่งมากเลยนะ');
  assert.equal(parsed.type, CommandType.PRAISE);
  assert.equal(parsed.arg, 'วันนี้เก่งมากเลยนะ');
});

test('Command Parser - parses /bribe with arguments', () => {
  const parsed = parseCommand('/bribe สตรอว์เบอร์รีชอร์ตเค้ก');
  assert.equal(parsed.type, CommandType.BRIBE);
  assert.equal(parsed.arg, 'สตรอว์เบอร์รีชอร์ตเค้ก');
});

test('Command Parser - parses /apologize with no args', () => {
  const parsed = parseCommand('/apologize');
  assert.equal(parsed.type, CommandType.APOLOGIZE);
  assert.equal(parsed.arg, '');
});

test('Command Parser - parses /gauge', () => {
  const parsed = parseCommand('/gauge');
  assert.equal(parsed.type, CommandType.GAUGE);
});

test('Command Parser - handles regular input without slash', () => {
  const parsed = parseCommand('ช่วยเขียนฟังก์ชันบวกเลขให้หน่อย');
  assert.equal(parsed.type, CommandType.REGULAR);
  assert.equal(parsed.raw, 'ช่วยเขียนฟังก์ชันบวกเลขให้หน่อย');
});

test('Command Parser - handles empty or non-string inputs safely', () => {
  const parsedEmpty = parseCommand('');
  assert.equal(parsedEmpty.type, CommandType.REGULAR);
  const parsedNull = parseCommand(null);
  assert.equal(parsedNull.type, CommandType.REGULAR);
});
