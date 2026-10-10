import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CONFIG_DIR = path.join(os.homedir(), '.tsundev');
const ACCOUNTS_FILE = path.join(CONFIG_DIR, 'accounts.json');

/**
 * Account Manager for AI Providers
 * Manages authentications:
 * - Google (ADC / gcloud auth / OAuth session / API Key)
 * - Anthropic Claude (Claude Code CLI session ~/.claude.json / API Key)
 * - OpenAI (Codex / OpenAI CLI credentials / API Key)
 */
export class AccountManager {
  constructor() {
    this.accounts = this.loadAccounts();
  }

  loadAccounts() {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      if (fs.existsSync(ACCOUNTS_FILE)) {
        return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
      }
    } catch (err) {
      console.warn('Could not read accounts.json:', err.message);
    }
    return {
      google: { type: 'none', email: null, token: null, detected: false },
      claude: { type: 'none', email: null, token: null, detected: false },
      openai: { type: 'none', email: null, token: null, detected: false }
    };
  }

  saveAccounts() {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(this.accounts, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save accounts:', err);
      return false;
    }
  }

  /**
   * Auto-detect existing CLI / system sessions on the machine
   */
  async detectSystemSessions() {
    const results = {
      google: { detected: false, detail: 'Not detected' },
      claude: { detected: false, detail: 'Not detected' },
      openai: { detected: false, detail: 'Not detected' }
    };

    // 1. Detect Google ADC / gcloud credentials
    try {
      const gcloudConfigPath = process.platform === 'win32'
        ? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'gcloud', 'application_default_credentials.json')
        : path.join(os.homedir(), '.config', 'gcloud', 'application_default_credentials.json');

      if (fs.existsSync(gcloudConfigPath)) {
        const raw = JSON.parse(fs.readFileSync(gcloudConfigPath, 'utf-8'));
        results.google = {
          detected: true,
          type: 'gcloud-adc',
          detail: raw.client_id ? `Google ADC Configured (${raw.client_id.slice(0, 12)}...)` : 'Google ADC Found'
        };
      } else {
        // Try gcloud print-access-token with a short timeout
        const { stdout } = await execAsync('gcloud auth application-default print-access-token', { timeout: 2500 });
        if (stdout && stdout.trim().length > 10) {
          results.google = {
            detected: true,
            type: 'gcloud-token',
            detail: 'Google Cloud ADC Active'
          };
        }
      }
    } catch {
      // Ignored if gcloud is not installed
    }

    // 2. Detect Claude Code CLI session (~/.claude.json or ~/.claude/)
    try {
      const claudeJsonPath = path.join(os.homedir(), '.claude.json');
      const claudeDirPath = path.join(os.homedir(), '.claude');

      if (fs.existsSync(claudeJsonPath)) {
        const raw = JSON.parse(fs.readFileSync(claudeJsonPath, 'utf-8'));
        results.claude = {
          detected: true,
          type: 'claude-code-session',
          detail: raw.accountUuid || raw.email ? `Claude Code Session (${raw.email || 'Active'})` : 'Claude Code CLI Authenticated'
        };
      } else if (fs.existsSync(claudeDirPath)) {
        results.claude = {
          detected: true,
          type: 'claude-code-session',
          detail: 'Claude Code Directory Found'
        };
      }
    } catch {
      // Ignored
    }

    // 3. Detect OpenAI / Codex credentials
    try {
      const codexPath = path.join(os.homedir(), '.codex');
      const openaiPath = path.join(os.homedir(), '.openai');
      if (fs.existsSync(codexPath) || fs.existsSync(openaiPath)) {
        results.openai = {
          detected: true,
          type: 'openai-session',
          detail: 'OpenAI / Codex CLI Config Found'
        };
      } else if (process.env.OPENAI_API_KEY) {
        results.openai = {
          detected: true,
          type: 'env-key',
          detail: 'OPENAI_API_KEY detected in Environment'
        };
      }
    } catch {
      // Ignored
    }

    return results;
  }

  /**
   * Set authentication for provider
   */
  setAccount(provider, accountData) {
    this.accounts[provider] = {
      ...this.accounts[provider],
      ...accountData,
      updatedAt: new Date().toISOString()
    };
    this.saveAccounts();
    return this.accounts[provider];
  }

  /**
   * Get authentication for provider
   */
  getAccount(provider) {
    return this.accounts[provider] || null;
  }

  /**
   * Clear authentication for provider
   */
  logout(provider) {
    if (this.accounts[provider]) {
      this.accounts[provider] = { type: 'none', email: null, token: null, detected: false };
      this.saveAccounts();
    }
    return true;
  }
}

export const accountManager = new AccountManager();
