import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { AgentEngine } from '../src/agent/agentEngine.js';
import { TsunDereState } from '../src/state/TsunDereState.js';

test('AgentEngine performs an explicitly authorized file action even at high Tsun mood', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tsundev-agent-'));
  t.after(() => fs.rm(tempDir, { recursive: true, force: true }));

  let requests = 0;
  const provider = {
    async generate() {
      requests += 1;
      return requests === 1
        ? 'Thought: Create the requested file.\nAction: writeFile\nAction Input: {"filePath":"hello.txt","content":"hello agent"}'
        : 'Final Answer: Created hello.txt successfully.';
    }
  };

  const agent = new AgentEngine({
    provider,
    state: new TsunDereState(100),
    baseDir: tempDir,
    maxSteps: 3,
    authorizedAgent: true
  });
  const result = await agent.run({ prompt: 'create a file' });

  assert.equal(await fs.readFile(path.join(tempDir, 'hello.txt'), 'utf8'), 'hello agent');
  assert.equal(result.toolCallsCount, 1);
  assert.match(result.reply, /Created hello.txt/);
});
