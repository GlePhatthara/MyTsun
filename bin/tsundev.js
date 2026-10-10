#!/usr/bin/env node
/**
 * TsunDev (ツンDev) CLI Binary Launcher
 * The Tsundere AI Pair-Programmer for Stupid Hackathon Thailand (SHTX)
 */

import { startCliChat } from '../src/cli/chat.js';

startCliChat().catch((err) => {
  console.error('Fatal TsunDev Error:', err);
  process.exit(1);
});
