/**
 * storage.ts — Persistent State Serialisation / Deserialisation
 *
 * Handles reading and writing the player's save data to a JSON file located
 * in the user's home directory (`~/.sudo-play-state.json`).
 *
 * Storing state in the home directory means it persists across project
 * reinstalls and works regardless of where `sudo-play` is executed from.
 *
 * This module is kept intentionally thin — it knows nothing about game logic.
 * All it does is read/write raw JSON and return typed objects.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Absolute path to the save file. Using `os.homedir()` makes this platform-
// agnostic (works on macOS, Linux, and Windows).
const STATE_FILE_PATH = path.join(os.homedir(), '.sudo-play-state.json');

/**
 * AppStateData — the shape of the JSON stored on disk.
 * Keep this as simple / flat as possible to make manual editing easy.
 */
export interface AppStateData {
  /** Total XP the player has accumulated across all games. */
  xp: number;
  /** List of game IDs the player has unlocked (e.g. `["dummy", "wordle"]`). */
  unlockedGames: string[];
}

/**
 * Default state used for first-time players (no save file yet) or as a
 * fallback if the file is corrupted / unreadable.
 */
const DEFAULT_STATE: AppStateData = {
  xp: 0,
  unlockedGames: [],
};

/**
 * loadState — reads the save file and returns the parsed state.
 *
 * On first launch the file won't exist yet (ENOENT), so we silently return
 * the DEFAULT_STATE instead of throwing. Any other read error also falls
 * back to the default so the app can continue in a degraded state.
 */
export async function loadState(): Promise<AppStateData> {
  try {
    const data = await fs.readFile(STATE_FILE_PATH, 'utf-8');
    // Spread DEFAULT_STATE first so any missing keys in the file are
    // populated with sensible defaults (forward-compatibility).
    return { ...DEFAULT_STATE, ...JSON.parse(data) };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist yet — this is expected on first run.
      return { ...DEFAULT_STATE };
    }
    console.error(`Error loading state from ${STATE_FILE_PATH}:`, error);
    return { ...DEFAULT_STATE };
  }
}

/**
 * saveState — serialises the given state and writes it to disk atomically via
 * `fs.writeFile` (which overwrites the file in one call).
 *
 * The JSON is pretty-printed (indent = 2) so players can inspect or hand-edit
 * their save file if they want to.
 */
export async function saveState(state: AppStateData): Promise<void> {
  try {
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error saving state to ${STATE_FILE_PATH}:`, error);
  }
}
