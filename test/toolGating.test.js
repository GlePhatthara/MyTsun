import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { TsunDereState } from '../src/state/TsunDereState.js';
import {
  AgenticToolGating,
  GatingStatus,
  writeFileTool,
  readFileTool,
  runCommandTool,
  resolveSafePath
} from '../src/tools/index.js';
import { myTsunChatSession } from '../src/cli/chat.js';
import { MockProvider } from '../src/llm/provider.js';

test('AgenticTools - resolveSafePath protects against directory traversal', () => {
  const baseDir = path.resolve(os.tmpdir(), 'tsundev-test-base');
  const safe = resolveSafePath('nested/file.txt', baseDir);
  assert.equal(safe, path.resolve(baseDir, 'nested/file.txt'));

  assert.throws(
    () => resolveSafePath('../../secret.env', baseDir),
    /Security Violation/
  );
});

test('AgenticTools - writeFileTool and readFileTool operate properly', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tsundev-tools-'));
  try {
    const writeRes = await writeFileTool({
      filePath: 'subfolder/hello.txt',
      content: 'Hello Tsundere World!',
      baseDir: tempDir
    });

    assert.equal(writeRes.bytesWritten > 0, true);
    assert.equal(writeRes.filePath, path.join('subfolder', 'hello.txt'));

    const readRes = await readFileTool({
      filePath: 'subfolder/hello.txt',
      baseDir: tempDir
    });

    assert.equal(readRes.content, 'Hello Tsundere World!');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('AgenticTools - runCommandTool executes command and captures output', async () => {
  const result = await runCommandTool({
    command: 'node -e "console.log(\'myTsun Agentic Tool Ready\')"'
  });

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, 'myTsun Agentic Tool Ready');

  // Test dangerous command prevention
  await assert.rejects(
    async () => runCommandTool({ command: 'rm -rf /' }),
    /Security Violation/
  );
});

test('AgenticToolGating - Extreme Tsun (80-100%) BLOCKS tool execution', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tsundev-gate-'));
  try {
    const state = new TsunDereState(100);
    const gating = new AgenticToolGating({ state, baseDir: tempDir });

    const perm = gating.checkPermission('writeFile');
    assert.equal(perm.allowed, false);
    assert.equal(perm.status, GatingStatus.BLOCKED);
    assert.match(perm.message, /ใครจะไปยอมให้รัน Tool/);

    const execRes = await gating.execute('writeFile', {
      filePath: 'denied.txt',
      content: 'This should not be written'
    });

    assert.equal(execRes.success, false);
    assert.equal(execRes.blocked, true);

    // Verify file was never written to disk
    await assert.rejects(
      async () => fs.access(path.join(tempDir, 'denied.txt')),
      /ENOENT/
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('AgenticToolGating - Reluctant Tsun (40-79%) blocks by default, but injects sassy watermark when forced', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tsundev-gate-'));
  try {
    const state = new TsunDereState(60);
    const gating = new AgenticToolGating({ state, baseDir: tempDir });

    // Default: blocked with reluctant explanation
    const permDefault = gating.checkPermission('writeFile');
    assert.equal(permDefault.allowed, false);
    assert.equal(permDefault.status, GatingStatus.RELUCTANT);
    assert.match(permDefault.message, /ยังไม่ได้อยากทำให้สักหน่อย|ยังไม่อยากทำให้/);

    // Forced execution: allowed with grumpy comment injection
    const execRes = await gating.execute(
      'writeFile',
      { filePath: 'reluctant.js', content: 'console.log("hello");' },
      { force: true }
    );

    assert.equal(execRes.success, true);
    assert.equal(execRes.blocked, false);

    const writtenContent = await fs.readFile(path.join(tempDir, 'reluctant.js'), 'utf-8');
    assert.match(writtenContent, /บ่นกระปอดกระแปด/);
    assert.match(writtenContent, /console\.log\("hello"\);/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('AgenticToolGating - Dere Breakthrough (0-39%) UNLOCKS full tool execution with praise', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tsundev-gate-'));
  try {
    const state = new TsunDereState(30);
    const gating = new AgenticToolGating({ state, baseDir: tempDir });

    const perm = gating.checkPermission('writeFile');
    assert.equal(perm.allowed, true);
    assert.equal(perm.status, GatingStatus.ALLOWED);
    assert.match(perm.message, /ก-ก็ไม่ได้อยากรัน/);

    const execRes = await gating.execute('writeFile', {
      filePath: 'lovely_app.js',
      content: 'console.log("Success with myTsun Dere Mode!");'
    });

    assert.equal(execRes.success, true);
    assert.equal(execRes.blocked, false);

    const fileContent = await fs.readFile(path.join(tempDir, 'lovely_app.js'), 'utf-8');
    assert.match(fileContent, /console\.log\("Success with myTsun Dere Mode!"\);/);
    assert.match(fileContent, /\[myTsun with ♡\]/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('ChatSession Integration - /write and /run are blocked at 100% and succeed after Dere Breakthrough', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tsundev-chat-'));
  try {
    const state = new TsunDereState(100);
    const session = new myTsunChatSession({
      state,
      baseDir: tempDir,
      provider: new MockProvider()
    });

    // 1. Try /write at 100% Tsun -> Blocked
    const writeBlocked = await session.handleTurn('/write notes.txt secret-info');
    assert.match(writeBlocked.reply, /TOOL BLOCKED/);
    assert.equal(writeBlocked.toolExecution.blocked, true);

    // 2. Try /run at 100% Tsun -> Blocked
    const runBlocked = await session.handleTurn('/run node -v');
    assert.match(runBlocked.reply, /TOOL BLOCKED/);
    assert.equal(runBlocked.toolExecution.blocked, true);

    // 3. Flatter and bribe myTsun to drop gauge into Dere Breakthrough (< 40%)
    await session.handleTurn('/bribe chocolate parfait'); // -35
    await session.handleTurn('/bribe เค้กสตรอว์เบอร์รี');  // -35
    await session.handleTurn('/praise น่ารักและเก่งที่สุด'); // -25
    assert.equal(session.state.getGauge() < 40, true);

    // 4. Try /write again -> Success!
    const writeSuccess = await session.handleTurn('/write notes.txt unlocked-info');
    assert.match(writeSuccess.reply, /TOOL SUCCESS/);
    assert.equal(writeSuccess.toolExecution.success, true);

    const saved = await fs.readFile(path.join(tempDir, 'notes.txt'), 'utf-8');
    assert.match(saved, /unlocked-info/);
    assert.match(saved, /\[myTsun with ♡\]/);

    // 5. Try /run again -> Success!
    const runSuccess = await session.handleTurn('/run node -e "console.log(\'Dere Run Done\')"');
    assert.match(runSuccess.reply, /TOOL SUCCESS/);
    assert.match(runSuccess.reply, /Dere Run Done/);
    assert.equal(runSuccess.toolExecution.success, true);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('ChatSession Integration - Intercepts and executes agentic LLM tool calls when Dere', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tsundev-llm-tool-'));
  try {
    const state = new TsunDereState(20); // Dere Breakthrough
    const mockProvider = new MockProvider({
      responses: () => `ก-ก็ยอมช่วยแล้วไงล่ะ! นี่ไงโค้ดที่ขอ:
TOOL_CALL: writeFile {"filePath": "auto_generated.js", "content": "export const ok = true;"}`
    });

    const session = new myTsunChatSession({
      state,
      baseDir: tempDir,
      provider: mockProvider
    });

    const turnRes = await session.handleTurn('เขียนไฟล์ auto_generated.js ให้หน่อย');
    assert.match(turnRes.reply, /ดำเนินการ Tool "writeFile" สำเร็จ/);

    const written = await fs.readFile(path.join(tempDir, 'auto_generated.js'), 'utf-8');
    assert.match(written, /export const ok = true;/);
    assert.match(written, /\[myTsun with ♡\]/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
