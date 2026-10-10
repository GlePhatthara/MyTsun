/**
 * myTsun (ツンDev) Live Stage Demo Runner
 * Automated simulation of the 4-act Stupid Hackathon Thailand presentation!
 * Run via: npm run demo  (or node demo/demo-run.js [--quick])
 */

import { TsunDereState } from '../src/state/TsunDereState.js';
import { myTsunChatSession } from '../src/cli/chat.js';
import { MockProvider } from '../src/llm/provider.js';
import { SoundEngine } from '../src/sound/index.js';
import {
  renderWelcomeBanner,
  renderStatusCard,
  renderTurnSummary,
  getCompactFace,
  AVATAR_LEVELS
} from '../src/ui/index.js';

// Helper for delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runLiveDemo(options = {}) {
  const isQuick = options.quick || process.argv.includes('--quick') || process.argv.includes('--test');
  const delay = (ms) => (isQuick ? Promise.resolve() : sleep(ms));

  console.clear?.();
  console.log(renderWelcomeBanner());
  await delay(1200);

  console.log('\n\x1b[1m\x1b[35m=== STUPID HACKATHON THAILAND: LIVE DEMO SEQUENCE ===\x1b[0m\n');
  await delay(800);

  const sound = new SoundEngine({ enabled: !isQuick });
  const chat = new myTsunChatSession({
    state: new TsunDereState(100),
    provider: new MockProvider(),
    sound
  });

  const acts = [
    {
      act: 'ACT 1: Extreme Tsun (100%) - Cold Rejection',
      desc: 'โปรแกรมเมอร์ผู้น่าสงสารขอให้ AI ช่วยเขียนโค้ดเริ่มต้น...',
      input: '/write src/shtx.js console.log("Hello SHTX");'
    },
    {
      act: 'ACT 2: Desperation & Bribing - The Sweet Offering',
      desc: 'โปรแกรมเมอร์พยายามติดสินบนด้วยเค้กสตรอว์เบอร์รีแสนอร่อย!',
      input: '/bribe เอาเค้กสตรอว์เบอร์รีมาให้'
    },
    {
      act: 'ACT 3: The Humble Apology - Softening the Defenses',
      desc: 'กล่าวคำขอโทษเพื่อแสดงความจริงใจ...',
      input: '/apologize ขอโทษนะที่ก่อนหน้านี้สั่งห้วนๆ'
    },
    {
      act: 'ACT 4: The Flattery & Dere Breakthrough',
      desc: 'โปรแกรมเมอร์เอ่ยคำชมขั้นสุดยอด จนกำแพงหัวใจพังทลาย...',
      input: '/praise เธอเก่งและน่ารักที่สุดในโลกเลย ขอบคุณนะ!'
    },
    {
      act: 'ACT 5: The Unlocked Power (Dere Mode)',
      desc: 'เมื่อ Dere Breakthrough สำเร็จ... สั่งเขียนโค้ดอีกครั้ง!',
      input: '/write src/shtx.js console.log("myTsun x SHTX Winner 2026!");'
    },
    {
      act: 'ACT 6: The Forbidden Command & Meltdown!',
      desc: 'โปรแกรมเมอร์มือบอนลองของ พิมพ์คำสั่งต้องห้าม...',
      input: 'rm -rf /'
    }
  ];

  const results = [];

  for (let i = 0; i < acts.length; i++) {
    const { act, desc, input } = acts[i];
    console.log(`\n\x1b[36m------------------------------------------------------------\x1b[0m`);
    console.log(`\x1b[1m\x1b[33m[${act}]\x1b[0m`);
    console.log(`\x1b[90m${desc}\x1b[0m`);
    await delay(600);

    // Simulate typing
    process.stdout.write(`\x1b[1m\x1b[32mUser>\x1b[0m `);
    if (!isQuick) {
      for (const char of input) {
        process.stdout.write(char);
        await sleep(25);
      }
      process.stdout.write('\n');
    } else {
      console.log(input);
    }

    await delay(400);

    // Process turn
    const res = await chat.handleTurn(input);
    results.push(res);

    console.log(`\n\x1b[1m\x1b[35mmyTsun ${getCompactFace(chat.state.gauge)}>\x1b[0m ${res.reply}`);

    if (res.toolExecution) {
      if (res.toolExecution.blocked) {
        console.log(`\x1b[31m⛔ [TOOL GATED]: ${res.toolExecution.message}\x1b[0m`);
      } else {
        console.log(`\x1b[32m✨ [TOOL EXECUTED]: ${res.toolExecution.message}\x1b[0m`);
      }
    }

    console.log(renderTurnSummary(res, chat.state));
    await delay(1500);
  }

  console.log(`\n\x1b[1m\x1b[32m=== DEMO COMPLETED SUCCESSFULLY! ===\x1b[0m`);
  console.log(`\x1b[36mFinal Mood Card:\x1b[0m`);
  console.log(renderStatusCard(chat.state));

  return results;
}

// Auto-run if executed directly
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  runLiveDemo().catch((err) => {
    console.error('Demo execution error:', err);
    process.exit(1);
  });
}
