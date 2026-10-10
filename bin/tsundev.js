#!/usr/bin/env node
/**
 * myTsun (ツンDev) CLI Binary Launcher
 * The Tsundere AI Pair-Programmer for Stupid Hackathon Thailand (SHTX)
 */

import { startCliChat } from '../src/cli/chat.js';

startCliChat().catch((err) => {
  console.error('Fatal myTsun Error:', err);
  process.exit(1);
});
