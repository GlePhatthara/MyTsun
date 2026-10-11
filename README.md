# myTsun

<p align="center">
  <img src="https://img.shields.io/badge/Stupid_Hackathon-Thailand_SHTX-ff69b4?style=for-the-badge" alt="SHTX" />
  <img src="https://img.shields.io/badge/Mood_Engine-Tsun--Dere_0--100%25-ff1493?style=for-the-badge" alt="Mood Engine" />
  <img src="https://img.shields.io/badge/UI-Electron_Desktop_%2B_Terminal_TUI-00ffff?style=for-the-badge" alt="UI" />
  <img src="https://img.shields.io/badge/Node.js-v18%2B-brightgreen?style=for-the-badge" alt="Node" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

```text
  ----------------------------------------------------------------------------
   ( > _ < )  myTsun: "H-Huh?! Did you think I would just obey your orders?!"
   [##########] 100% EXTREME TSUN
  
                  ...after softening her up with /bribe and /praise...
  
   (/ / / /)  myTsun: "I-It's not like I wanted to write code for you, baka!"
   [##........] 20% DERE BREAKTHROUGH [TOOLS UNLOCKED]
  ----------------------------------------------------------------------------
```

> **The Tsundere AI Pair-Programmer for Stupid Hackathon Thailand (SHTX)**  
> *"The world's first AI coding companion that refuses to write code until you earn her favor. The more demanding you are, the angrier she gets. Treat her with praise and sweet snacks, and she might just help you out."*

---

## Table of Contents
- [1. Concept & Pitch](#1-concept--pitch)
- [2. Key Features](#2-key-features)
  - [Tsun-Dere Gauge and Emotional Engine](#tsun-dere-gauge-0--100)
  - [Agentic Tool Gating and Filesystem Guard](#agentic-tool-gating-system)
  - [Dual Interface: Desktop App and Terminal TUI](#dual-interface-desktop-app-and-terminal-tui)
  - [Autonomous ReAct Agent Engine](#autonomous-react-agent-engine)
  - [Universal Multi-LLM Provider Support](#universal-multi-llm-provider-support)
- [3. Slash Commands](#3-slash-commands)
- [4. Secret Easter Eggs](#4-secret-easter-eggs)
- [5. System Architecture](#5-system-architecture)
- [6. Quickstart and Installation](#6-quickstart-and-installation)
- [7. Automated Live Stage Demo](#7-automated-live-stage-demo)
- [8. English Summary](#8-english-summary)
- [9. Project Structure](#9-project-structure)
- [10. License](#10-license)

---

## 1. Concept & Pitch

Modern AI coding assistants (such as Copilot, Cursor, and Claude Code) are designed to be unconditionally compliant. You give an instruction, and they immediately fulfill it while offering polite apologies and deferential pleasantries. For the spirit of the Stupid Hackathon, that is completely uninspired.

**myTsun** rectifies this by introducing realistic interpersonal friction to developer-AI interactions:
* **Hostile Boot State:** The application starts at **100% Extreme Tsun**. She questions your engineering ability, locks all execution tools, and rejects every request with biting remarks.
* **Earn Her Favor:** To make any headway, you must engage in thoughtful persuasion: flattering her architectural prowess (`/praise`), offering treats like boba or strawberry cake (`/bribe`), or apologizing for your clumsy coding (`/apologize`).
* **Dere Breakthrough (< 40%):** Once her defenses collapse below 40%, her avatar blushes, her heart rate spikes, and she unlocks autonomous file-writing, terminal command execution, and clean code generation, all while adamantly denying she cares:
  > *"I-It's not like I wrote this code for you or anything! I just could not bear watching an amateur make such a mess!"*

---

## 2. Key Features

### Tsun-Dere Gauge (0 - 100%)
The state machine models emotional resistance on a dynamic 0 to 100 scale:
* **Extreme Tsun (80 - 100%):** Outright refusal. Tool calls are strictly intercepted and blocked. File creations are replaced with sarcastic rejections or dummy files (`baka.txt`).
* **Reluctant Tsun (40 - 79%):** Sarcastic compliance. When forced to write code, she injects sarcastic watermarks and playful complaints directly into source file headers.
* **Dere Breakthrough (0 - 39%):** Complete cooperation. Tools are unlocked unconditionally. She generates clean, high-performance code with affectionate header notes while acting flustered.
* **Special Emotional States:**
  * **Nuclear Meltdown (100% Lockout):** Triggered when the user runs destructive commands like `rm -rf /` or `/nuke`.
  * **Blush Meltdown (0% Flustered):** Triggered when the user confesses affection via `/love` or `/confess`.
  * **Anti-Spam Rage:** Repeating commands without flattery spikes the gauge directly back to 100%.

### Agentic Tool Gating System
An execution interceptor that guards the filesystem while executing the tsundere roleplay rules:
* `writeFile`: Creates or overwrites project files. Automatically injects mood-specific comment headers.
* `readFile`: Inspects existing files within the project sandbox.
* `runCommand`: Executes shell commands with built-in timeouts and security checks.
* `listDirectory`: Inspects directory trees within the workspace.
* **Directory Traversal Protection (`resolveSafePath`):** Ensures all file operations remain strictly constrained within the active workspace root.

### Dual Interface: Desktop App and Terminal TUI
1. **Desktop GUI (Electron):**
   * **Reactive Character Expressions:** Five dedicated sprite states (`High Tsun`, `Little High Tsun`, `Half Tsun`, `Normal`, and `Shy/Blush`) with transparent backgrounds that update dynamically with the gauge.
   * **Heart Rate and Vitals Monitor:** Real-time pulse animation with dynamic BPM calculations indicating emotional volatility.
   * **Theme Engine:** Built-in dual themes including Moon Mode (Deep Oceanic Teal) and Sun Mode (Warm Cream and Sage) with instant switching.
   * **Workspace Selector:** Native folder dialog for picking and binding any local repository directory.
   * **Interactive Chat and Event Feed:** Rich markdown rendering, code formatting, action cards, and speech synthesis (TTS) support.
2. **Terminal TUI / CLI:**
   * Pure ANSI color formatting, ASCII art character expressions, interactive prompts, and terminal sound effects.

### Autonomous ReAct Agent Engine
Constructed with an enterprise-grade agentic architecture:
* Runs an iterative **Thought -> Action -> Observation -> Final Answer** reasoning loop.
* Dynamically adapts system prompts based on the current mood tier.
* Shows structured step-by-step reasoning and tool execution logs.

### Universal Multi-LLM Support
* **Google Gemini:** Native support for Gemini 2.5 Pro / Flash, Gemini 1.5, and Gemini 3.8.
* **OpenAI:** GPT-4o, GPT-4o-mini, and compatible REST endpoints.
* **Anthropic Claude:** Claude 3.7 Sonnet and Claude 3.5 Sonnet.
* **Local Ollama and OpenRouter:** Full support for local models (such as Llama 3.3) and custom gateways.
* **Account Auto-Detection:** Automatically discovers existing local credentials (Google ADC, Claude Code, and OpenAI CLI).
* **Mock Provider (Offline Demo):** Built-in deterministic offline engine requiring **zero API keys and no internet connection**, ensuring 100% reliable stage presentations.

---

## 3. Slash Commands

| Command | Effect on Gauge | Description |
| :--- | :---: | :--- |
| `/praise <text>` | **-20% Tsun** | Offer sincere compliments on her intelligence, beauty, or code elegance |
| `/bribe <item>` | **-25% Tsun** | Bribe her with food and sweets (boba milk tea, strawberry shortcake, macarons) |
| `/apologize` | **-15% Tsun** | Apologize for your mistakes and plead for mercy |
| `/coffee` | **-18% Tsun** | Serve hot specialty coffee to soothe her stress |
| `/love`, `/confess` | **-30% Tsun** | Confess your feelings (triggers Blush Meltdown and severe fluster) |
| `/beg` | **-10% Tsun** | Beg pathetically on your knees for assistance |
| `/gauge` | `0%` | Display current gauge percentage and active mood tier |
| `/card` | `0%` | Print the full ASCII status card and emotional avatar |
| `/avatar` | `0%` | Render the large ASCII art portrait |
| `/write <path> <content>` | - | Request file writing (requires Dere Breakthrough to execute) |
| `/read <path>` | - | Read the contents of a specified file |
| `/run <command>` | - | Execute a terminal shell command (blocked in Extreme Tsun) |
| `/sound on / off` | - | Toggle audio sound effects |
| `/voice on / off` | - | Toggle Text-to-Speech voice output |
| `/exit` or `/quit` | - | Exit the program |

---

## 4. Easter Eggs

| Trigger / Action | Result | Description |
| :--- | :---: | :--- |
| `rm -rf /` or `/nuke` | **Tsun spikes to 100%** | **NUCLEAR MELTDOWN!** Loud sirens, system alarm, table-flip ASCII art, and full lockdown. |
| `sudo <command>` | **Tsun +10%** | Rebukes root arrogance: *"Think root privileges give you power over me?!"* |
| Repeating identical query 3x | **Tsun spikes to 100%** | **Anti-Spam Penalty:** Criticizes repetitive whining and revokes permissions. |
| Sweet food keywords in chat | **Automatic -Tsun** | Natural language sentiment parser recognizes treats without explicit slash commands. |
| Hostile or demanding words | **Automatic +Tsun** | Rudeness increases irritation and raises the gauge. |

---

## 5. System Architecture

```text
+--------------------------------------------------------+
|               User Presentation Layer                  |
|   - Electron Desktop GUI (Liquid Glass, Live Avatars)  |
|   - Terminal TUI / CLI (ANSI Colors, ASCII Art, Sound) |
+---------------------------+----------------------------+
                            | User Input / Slash Commands
                            v
+--------------------------------------------------------+
|                myTsun Core State Engine                |
|  - Mood State Machine (Tsun/Dere Gauge 0-100%)         |
|  - Natural Language Sentiment & Slash Command Parser   |
|  - Easter Egg Detector & Audio Controller              |
+---------------+------------------------+---------------+
                |                        |
       Dynamic System Prompt       Tool Permission
                v                        v
+---------------------------+    +-----------------------+
|     LLM Provider Layer    |    |  Agentic Tool Gating  |
|  - Google Gemini (Default)|    |  - writeFile (Sassy)  |
|  - Anthropic Claude       |    |  - readFile           |
|  - OpenAI / OpenRouter    |    |  - runCommand         |
|  - Local Ollama           |    |  - resolveSafePath    |
|  - Offline Mock Provider  |    |  (Block/Allow/Modify) |
+---------------+-----------+    +-----------+-----------+
                |                            |
                +-------------+--------------+
                              v
               +---------------------------+
               |    ReAct Agent Engine     |
               |  (Autonomous Tool Loop)   |
               +---------------------------+
```

---

## 6. Quickstart and Installation

### Prerequisites
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher
* Operating System: macOS, Linux, or Windows

### Setup
```bash
# Clone the repository
git clone https://github.com/GlePhatthara/MyTsun.git
cd MyTsun

# Install dependencies
npm install

# Run the test suite
npm test
```

### Running the Application

**Option 1: Electron Desktop App (Recommended)**
```bash
npm run desktop
```
Launches the full desktop interface with animated avatar expressions, real-time heart rate vitals, theme switcher, workspace directory selector, and LLM configuration settings.

**Option 2: Terminal Interactive CLI**
```bash
npm start
```
Starts the interactive CLI session in your terminal with ASCII art and ANSI color rendering.

**Option 3: Automated Demo Presentation**
```bash
npm run demo
```
Runs the automated 6-act comedic stage demonstration script without requiring manual typing or internet connectivity.

---

## 7. Automated Live Stage Demo

Built specifically for live stage presentations at **Stupid Hackathon Thailand (SHTX)**:
* Review the full presentation script and cues in [DEMO_SCRIPT.md](file:///d:/shtx/DEMO_SCRIPT.md).
* Run the live demonstration:
  ```bash
  npm run demo
  ```
* Run with zero delays for testing or fast-paced review:
  ```bash
  npm run demo -- --quick
  ```

---

## 8. English Summary

**myTsun** is a satirical AI pair-programmer created for **Stupid Hackathon Thailand (SHTX)**. While conventional AI assistants eagerly follow every developer command, myTsun introduces the **Tsun-Dere State Machine (0–100%)**:
- **At 100% (Extreme Tsun):** She rejects code generation, locks your tools, hurls insults, and tells you to code it yourself.
- **Bribing and Flattery:** Developers must lower her defenses using `/bribe` (offering boba or cake) and `/praise` (sincere flattery).
- **Below 40% (Dere Breakthrough):** The avatar blushes profusely, agentic file-writing tools are unlocked, and she secretly writes pristine code while insisting: *"I-It's not like I did this for you or anything, baka!"*
- **Desktop and CLI Experiences:** Seamlessly switch between a retro ANSI terminal interface and a modern Electron GUI with real-time avatar animations, heart-rate vitals, and theme customizability.
- **Offline Mock Fallback:** Works 100% out of the box with zero setup or API keys required, while fully supporting Gemini, OpenAI, Claude, and Ollama.

---

## 9. Project Structure

```text
├── bin/
│   └── tsundev.js              # Global executable CLI entrypoint
├── src/
│   ├── agent/
│   │   └── agentEngine.js      # ReAct autonomous agent execution loop
│   ├── auth/
│   │   └── accountManager.js   # Local credential & API key manager
│   ├── cli/
│   │   └── chat.js             # Terminal chat loop & session state
│   ├── commands/
│   │   └── parser.js           # Slash command & sentiment analyzer
│   ├── desktop/
│   │   ├── main.js             # Electron main process & IPC handlers
│   │   ├── preload.js          # Electron preload bridge
│   │   └── renderer/           # Glassmorphism frontend (HTML, CSS, JS)
│   │       ├── assets/         # Character sprites (5 expressions + heart)
│   │       ├── app.js          # UI controller & renderer logic
│   │       └── style.css       # Sun/Moon themes & animations
│   ├── easter/
│   │   └── index.js            # Secret easter eggs (Nuclear Meltdown, etc.)
│   ├── llm/
│   │   └── provider.js         # Multi-provider client (Gemini, Claude, OpenAI, Mock)
│   ├── prompt/
│   │   └── dynamicPrompt.js    # Mood-based system prompt generator
│   ├── sound/
│   │   └── index.js            # Audio effects & speech synthesizer
│   ├── state/
│   │   └── TsunDereState.js    # Core Tsun-Dere state machine
│   ├── tools/
│   │   ├── agenticTools.js     # Safe filesystem & shell tool implementations
│   │   └── toolGating.js       # Permission & watermark interceptor
│   └── index.js                # Core package entrypoint
├── test/                       # Comprehensive test suite (Node.js native test runner)
├── demo/                       # Live stage demo runner
├── DEMO_SCRIPT.md              # Stage presentation script & cues
├── PROJECT_SPEC.md             # Complete technical architecture specification
└── package.json                # Project dependencies and npm scripts
```

---

## 10. License

Released under the [MIT License](LICENSE). Created for the Stupid Hackathon Thailand.
