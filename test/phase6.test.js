import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runLiveDemo } from '../demo/demo-run.js';

test('Phase 6: README.md exists and contains complete documentation', () => {
  const readmePath = path.resolve(process.cwd(), 'README.md');
  assert.equal(fs.existsSync(readmePath), true, 'README.md must exist');

  const content = fs.readFileSync(readmePath, 'utf8');

  // Check badges & title
  assert.match(content, /TsunDev/i);
  assert.match(content, /Stupid Hackathon Thailand/i);

  // Check key sections
  assert.match(content, /Concept & Pitch/i);
  assert.match(content, /Tsun-Dere Gauge/i);
  assert.match(content, /Agentic Tool Gating/i);
  assert.match(content, /Slash Commands/i);
  assert.match(content, /Easter Eggs/i);
  assert.match(content, /Quickstart/i);
  assert.match(content, /English Summary/i);

  // Check critical commands
  assert.match(content, /\/praise/);
  assert.match(content, /\/bribe/);
  assert.match(content, /\/apologize/);
  assert.match(content, /\/write/);
  assert.match(content, /\/run/);
  assert.match(content, /rm -rf/);
});

test('Phase 6: DEMO_SCRIPT.md exists and provides full live stage presentation guide', () => {
  const scriptPath = path.resolve(process.cwd(), 'DEMO_SCRIPT.md');
  assert.equal(fs.existsSync(scriptPath), true, 'DEMO_SCRIPT.md must exist');

  const content = fs.readFileSync(scriptPath, 'utf8');
  assert.match(content, /Stupid Hackathon Thailand/i);
  assert.match(content, /Extreme Tsun/i);
  assert.match(content, /bribe/i);
  assert.match(content, /Dere Breakthrough/i);
  assert.match(content, /rm -rf/i);
  assert.match(content, /NUCLEAR MELTDOWN/i);
});

test('Phase 6: package.json has bin and demo scripts configured', () => {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  assert.equal(pkg.scripts?.demo, 'node demo/demo-run.js');
  assert.equal(pkg.bin?.tsundev, './bin/tsundev.js');

  const binPath = path.resolve(process.cwd(), 'bin/tsundev.js');
  assert.equal(fs.existsSync(binPath), true, 'bin/tsundev.js must exist');
});

test('Phase 6: demo-run.js executes complete 6-act simulation cleanly in quick mode', async () => {
  const results = await runLiveDemo({ quick: true });
  assert.equal(Array.isArray(results), true);
  assert.equal(results.length, 6, 'Should have executed 6 live acts');

  // Act 1: write blocked
  assert.equal(results[0].toolExecution?.blocked, true);

  // Act 2: bribe accepted, delta negative (Tsun reduced)
  assert.ok(results[1].stateDelta?.delta < 0);

  // Act 3: apologize accepted, delta negative
  assert.ok(results[2].stateDelta?.delta < 0);

  // Act 4: praise accepted, delta negative (Tsun reduced further)
  assert.ok(results[3].stateDelta?.delta < 0);

  // Act 5: write succeeded (Dere Breakthrough achieved)
  assert.equal(results[4].toolExecution?.blocked, false);

  // Act 6: rm -rf triggered meltdown easter egg
  assert.match(results[5].reply, /กรี๊ด|บ้า|ระเบิด|meltdown|อันตะบากะ/i);
});
