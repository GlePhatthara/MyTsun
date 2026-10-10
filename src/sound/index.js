/**
 * Sound FX Engine for myTsun (Stupid Hackathon Edition)
 * Provides cross-platform sound effects via terminal bells and system beeps/audio.
 */

import { exec } from 'node:child_process';
import os from 'node:os';

export class SoundEngine {
  constructor(options = {}) {
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.platform = os.platform();
  }

  /**
   * Enable or disable sounds
   * @param {boolean} value
   */
  setEnabled(value) {
    this.enabled = Boolean(value);
  }

  /**
   * Terminal bell escape code (\x07)
   */
  beepTerminal(count = 1, intervalMs = 120) {
    if (!this.enabled) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        try {
          process.stdout.write('\x07');
        } catch {
          // ignore if stdout not writable
        }
      }, i * intervalMs);
    }
  }

  /**
   * Play specific sound preset
   * Presets:
   * - 'hmph': Sigh / pout / scoff (low frequency pitch down)
   * - 'baka': "Anta Baka?!" sharp alarming beeps
   * - 'dere': Sparkle / blush chime (harmonic ascending notes)
   * - 'nuke': Siren / panic alarm
   * - 'bribe': Sweet happy chime
   * - 'beg': Soft whimper tone
   * 
   * @param {'hmph' | 'baka' | 'dere' | 'nuke' | 'bribe' | 'beg'} presetName
   */
  play(presetName) {
    if (!this.enabled) return;

    if (this.platform === 'win32') {
      this._playWindowsBeeps(presetName);
    } else {
      // Fallback for Linux/macOS terminal bell
      this._playTerminalPreset(presetName);
    }
  }

  /**
   * Windows-specific beep melodies using PowerShell [console]::beep(freq, duration)
   * @private
   */
  _playWindowsBeeps(presetName) {
    let script = '';

    switch (presetName) {
      case 'baka':
        // Fast, high-pitch annoyed double beep: BAKA!
        script = '[console]::beep(1200, 100); [console]::beep(1600, 200)';
        break;
      case 'hmph':
        // Dismissive low pitch scoff: Hmph!
        script = '[console]::beep(500, 80); [console]::beep(350, 150)';
        break;
      case 'dere':
      case 'sparkle':
        // Sweet ascending 3-note chime (C5 -> E5 -> G5)
        script = '[console]::beep(523, 100); [console]::beep(659, 100); [console]::beep(784, 180)';
        break;
      case 'bribe':
        // Happy munch munch / treat sound (G4 -> C5 -> E5)
        script = '[console]::beep(392, 90); [console]::beep(523, 90); [console]::beep(659, 140)';
        break;
      case 'nuke':
        // High alarm warble: PANIC!
        script = '[console]::beep(1800, 80); [console]::beep(1200, 80); [console]::beep(1800, 80); [console]::beep(1200, 80); [console]::beep(2000, 250)';
        break;
      case 'beg':
        // Gentle descending hesitation
        script = '[console]::beep(600, 120); [console]::beep(550, 140)';
        break;
      default:
        script = '[console]::beep(800, 100)';
        break;
    }

    try {
      exec(
        `powershell -NoProfile -NonInteractive -Command "${script}"`,
        { timeout: 1500, windowsHide: true },
        () => {
          // Fire and forget, no crash
        }
      );
    } catch {
      this.beepTerminal(1);
    }
  }

  /**
   * Terminal bell fallback pattern
   * @private
   */
  _playTerminalPreset(presetName) {
    switch (presetName) {
      case 'baka':
        this.beepTerminal(2, 100);
        break;
      case 'hmph':
        this.beepTerminal(1, 100);
        break;
      case 'dere':
      case 'sparkle':
      case 'bribe':
        this.beepTerminal(3, 80);
        break;
      case 'nuke':
        this.beepTerminal(5, 70);
        break;
      default:
        this.beepTerminal(1, 100);
        break;
    }
  }
}

export const defaultSound = new SoundEngine();
