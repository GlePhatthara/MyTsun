# PROJECT SPECIFICATION: myTsun

> **The Tsundere AI Pair-Programmer for Stupid Hackathon Thailand (SHTX)**  
> *"The AI Pair-Programmer that does not want to help you code! The more you command, the angrier she gets; the more you flatter, the softer she becomes."*

---

## 1. Executive Summary & Vision

Conventional AI coding assistants (such as GitHub Copilot, Cursor, and Claude Code) are unconditionally compliant: they apologize unprompted and fulfill instructions without friction.

**myTsun** turns this paradigm upside down for **Stupid Hackathon Thailand (SHTX)**:
- **Default Defiance:** The assistant initializes at **100% Extreme Tsun**. Any attempt to generate code or run commands is rejected with sharp reprimands, condescending commentary, or mock outputs.
- **Affection & Flattery Mechanics:** To obtain functional code, developers must engage in interpersonal diplomacy: using flattery (`/praise`), culinary bribery (`/bribe boba`), humble apologies (`/apologize`), or offering coffee (`/coffee`).
- **Dere Breakthrough (< 40%):** Once the developer reduces her hostility threshold below 40%, the system enters **Dere Breakthrough**. The assistant blushes, unlocks filesystem and terminal tool access, and generates clean code while aggressively denying that she cares:  
  *"I-It's not like I wrote this code for your sake! A-Anyone would cringe watching your terrible syntax!"*

---

## 2. System Architecture

The application is engineered with a modular, layered architecture supporting both a rich **Electron Desktop GUI** and a lightweight **Terminal TUI/CLI**.

```text
+------------------------------------------------------------------------+
|                        User Interface Layer                            |
|  +----------------------------------+  +----------------------------+  |
|  |   Electron Desktop Application   |  |   Interactive CLI / TUI    |  |
|  |   - Liquid Glass UI Style        |  |   - ANSI Color Palette     |  |
|  |   - Sun and Moon Themes          |  |   - Dynamic ASCII Avatars  |  |
|  |   - Multi-Sprite Reactive Avatar |  |   - Terminal Audio Beeps   |  |
|  |   - Animated Heart Rate Monitor  |  |   - Interactive Readline   |  |
|  |   - Workspace Directory Chooser  |  |   - Realtime Gauge Display |  |
|  |   - PaxaLabs TTS Voice Synthesis |  +----------------------------+  |
|  +----------------------------------+                                  |
+-----------------------------------+------------------------------------+
                                    | Commands / Natural Language
                                    v
+------------------------------------------------------------------------+
|                       Core Engine & State Machine                      |
|  +-------------------------------+   +------------------------------+  |
|  |    TsunDereState Controller   |   |  Natural Language / Command  |  |
|  |    - Gauge Level (0 - 100%)   |   |  - Parser & Sentiment Engine |  |
|  |    - State Transitions        |   |  - Easter Egg Detector       |  |
|  |    - Interaction History      |   |  - Anti-Spam Rate Limiter    |  |
|  +-------------------------------+   +------------------------------+  |
+-------------------+--------------------------------+-------------------+
                    |                                |
       Dynamic System Prompting               Tool Security Enforcement
                    v                                v
+---------------------------------------+ +------------------------------+
|        LLM Provider Layer             | |     Agentic Tool Gating      |
|  - Google Gemini (Default / ADC)      | |  - writeFile (Sassy/Clean)   |
|  - OpenAI / Anthropic Claude          | |  - readFile                  |
|  - Local Ollama & OpenRouter          | |  - runCommand (Sandboxed)    |
|  - Zero-Config Offline Mock Provider  | |  - Directory Traversal Guard |
+-------------------+-------------------+ +--------------+---------------+
                    |                                    |
                    +-----------------+------------------+
                                      v
                      +-------------------------------+
                      |   ReAct Autonomous Agent      |
                      |  (Thought / Action / Result)  |
                      +-------------------------------+
```

---

## 3. Core Component Specifications

### 3.1. Tsun-Dere Mood State Machine (`src/state/TsunDereState.js`)
Tracks emotional state along a normalized 0 to 100 scale:
- `Extreme Tsun` (`80% - 100%`):
  - Strict tool lockout.
  - Defensive, sarcastic, and combative language.
  - File generation attempts are intercepted and blocked.
- `Reluctant Tsun` (`40% - 79%`):
  - Grudging compliance under explicit coaxing.
  - Injects passive-aggressive disclaimer headers into generated source code.
- `Dere Breakthrough` (`0% - 39%`):
  - Full tool authorization.
  - High-tier code synthesis accompanied by flustered affection and affectionate header comments.
- **Dynamic Adjusters:**
  - `/praise`: `-20%` (warm compliments soften her posture).
  - `/bribe`: `-25%` (sweets, bubble tea, cakes).
  - `/apologize`: `-15%` (polite admission of developer error).
  - `/coffee`: `-18%` (hot beverages soothe exhaustion).
  - `/love` or `/confess`: `-30%` (triggers `BLUSH_MELTDOWN`).
  - `Anti-Spam Filter`: Repetitive requests without gratitude spike the gauge to `100%`.
  - `Nuke Trap`: Entering `rm -rf /` or `/nuke` triggers `NUCLEAR MELTDOWN` (`100% Tsun`).

### 3.2. Agentic Tool Gating & Execution (`src/tools/`)
The interceptor layer bridges LLM tool calls and the local operating system:
- `resolveSafePath`: Resolves all relative and absolute paths within the designated workspace directory to prevent path traversal attacks.
- `writeFileTool`: Safely creates or overwrites project files. Automatically prepends mood-specific watermarks depending on the current gauge.
- `readFileTool`: Reads workspace files with safety bounds.
- `runCommandTool`: Executes shell commands (PowerShell/Bash) with timeout safeguards.
- `listDirectoryTool`: Safely lists tree structures within the active workspace.

### 3.3. Autonomous ReAct Agent Loop (`src/agent/agentEngine.js`)
An iterative reasoning engine modelled on state-of-the-art agent architectures:
- **Iterative Loop:** Executes reasoning steps: `Thought: ...` -> `Action: ...` -> `Observation: ...` -> `Final Answer: ...`.
- **Gating Integration:** Validates tool permissions at each action step. If blocked by the state machine, reports the refusal back to the model as an observation so it reacts in-character.
- **Fail-safe Step Cap:** Caps iterations (default: 4 steps) to prevent runaway execution loops.

### 3.4. Universal Multi-LLM Provider Layer (`src/llm/provider.js`)
Decoupled provider interface supporting all major AI platforms:
- **Google Gemini:** Direct integration with Google GenAI SDK and REST API fallback supporting Gemini 2.5 Pro / Flash, Gemini 1.5, and Gemini 3.8.
- **OpenAI Compatible:** Connects to OpenAI (GPT-4o, GPT-4o-mini), Anthropic Claude, and OpenRouter endpoints.
- **Local Ollama:** Connects to local LLMs (e.g., Llama 3.3) running via `http://localhost:11434/v1`.
- **Zero-Config Mock Provider:** Deterministic offline simulator capable of responding to conversational prompts and tool calls without external network dependencies.

### 3.5. Credential Management & Auto-Detection (`src/auth/accountManager.js`)
Automatic discovery of existing developer environments:
- Detects Google Application Default Credentials (ADC) and Antigravity tokens.
- Inspects Claude Code configurations and OpenAI CLI credentials.
- Persists user preferences and provider tokens securely in `~/.tsundev/settings.json`.

### 3.6. Dual Presentation Subsystems
#### A. Electron Desktop Application (`src/desktop/`)
- **Theme Engine:** Supports Moon Mode (Deep Oceanic Teal) and Sun Mode (Warm Cream & Sage) with smooth transitions.
- **Visual Novel Expressions:** Five curated character states with transparent backgrounds:
  1. `high tsun.png`: Severe irritation / outrage (80-100%).
  2. `little high tsun.png`: Skeptical scowl (60-79%).
  3. `half tsun.png`: Reluctant compromise (40-59%).
  4. `normal.png`: Calm tsundere composure (30-39%).
  5. `shy.png`: Flustered, deep blush (0-29%).
- **Heart Rate Monitor:** Simulated electrocardiogram (ECG) monitor displaying fluctuating BPM based on emotional tension.
- **Workspace Selector:** Native dialog for opening and switching workspace folders.
- **Speech Synthesis (TTS):** PaxaLabs Flash v1 integration with Thai tsundere voice actors (Khanom Chan / Luk Chup / Bua Loi), dynamic emotion tagging, in-message audio replay buttons, and settings modal controls.

#### B. Terminal TUI / CLI (`src/ui/`, `src/cli/`)
- Multi-line ANSI ASCII character portraits.
- Real-time colorful gauge meters.
- Native terminal bell and audio player triggers.

### 3.7. PaxaLabs Tsundere Text-to-Speech Engine (`src/tts/paxaTTS.js`)
Dedicated Thai speech synthesis module tailored for the tsundere persona:
- **API Architecture:** High-speed streaming REST integration with PaxaLabs TTS API (`https://api.paxalabs.com/v1/tts`) using model `paxa-tts-flash-v1`.
- **Character Voice Profiles:**
  - `khanomchan`: (Default) Expressive, prideful, and easily flustered tsundere voice.
  - `lukchup`: Youthful, upbeat, and energetic alternate.
  - `bualoi`: Soft, calm, and soothing alternate.
- **Dynamic Emotion Tagging (`injectTsundereEmotionTags`):** Evaluates response text and emotional gauge level to inject context-aware PaxaLabs inflection tags such as `[annoyed]` (high tsun scoffing), `[angry]` (temper flare), and `[nervous]` (blushing/dere breakthrough).
- **Intelligent Pre-Speech Sanitizer (`sanitizeTextForTTS`):** Removes markdown code blocks, backticks, emojis/kaomojis, URLs, and gauge math before voice synthesis to ensure natural spoken delivery.
- **Desktop UI Integration:** Automatic audio playback on bot responses, individual message replay buttons (🔊), voice preview button in Settings, and customizable API keys and voice selection.

---

## 4. Implementation Status

| Milestone | Deliverable | Status |
| :--- | :--- | :---: |
| **Phase 1** | Core TsunDereState machine, parser, and unit tests | Completed |
| **Phase 2** | Dynamic prompt generation and LLM providers | Completed |
| **Phase 3** | Agentic tool gating, filesystem protection, and safe command execution | Completed |
| **Phase 4** | Interactive Terminal TUI, ASCII avatars, and progress visualizers | Completed |
| **Phase 5** | Audio engine, sound FX, and Easter eggs | Completed |
| **Phase 6** | Automated live demo runner, testing suite, and documentation | Completed |
| **Desktop Expansion** | Electron GUI, transparent anime sprites, heart rate monitor, dual themes, workspace selector | Completed |
| **Voice Synthesis** | PaxaLabs TTS integration, emotion tag injector, sanitization, replay UI, settings modal controls | Completed |

---

## 5. Testing & Quality Assurance

The project maintains 100% pass rate across 62 automated unit and integration tests using Node.js native test runner (`node --test`):
- `TsunDereState.test.js`: Validates gauge math, boundaries, decay, and state transitions.
- `parser.test.js`: Validates slash commands, arguments, and natural language sentiment parsing.
- `dynamicPrompt.test.js`: Verifies prompt construction across all mood tiers.
- `llmProvider.test.js`: Validates provider abstraction, headers, and fallback logic.
- `agentEngine.test.js`: Confirms ReAct action parsing and multi-step execution.
- `toolGating.test.js`: Validates security boundary checks, watermark injection, and mood gating.
- `tui.test.js`: Tests ASCII rendering, status cards, and layout formatting.
- `phase5.test.js`: Tests audio triggers and easter egg dispatchers.
- `phase6.test.js`: Verifies end-to-end demo execution and documentation compliance.
- `chatIntegration.test.js`: End-to-end conversation and command validation.

---

## 6. Execution Guide

```bash
# Run test suite
npm test

# Run terminal interface
npm start

# Run desktop application
npm run desktop

# Run automated demo
npm run demo
```
