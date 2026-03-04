/**
 * state.ts — In-Memory Application State
 *
 * Provides a clean, typed API over the raw JSON that `storage.ts` reads/writes.
 * All state mutations go through this class so the rest of the codebase never
 * has to touch raw data directly.
 *
 * A single singleton (`globalState`) is exported so every module shares the
 * same in-memory data without passing state objects around manually.
 */

import { loadState, saveState, AppStateData } from './storage.js';

/**
 * AppState — wraps the persistence layer and exposes typed accessors/mutators.
 */
export class AppState {
  /** The raw in-memory data mirror of what's on disk. */
  private data: AppStateData = { xp: 0, unlockedGames: [] };

  /**
   * init — must be called once at startup before any state is read or mutated.
   * Loads the persisted state from disk into `this.data`.
   */
  async init() {
    this.data = await loadState();
  }

  /** Returns the player's accumulated XP total. */
  getXP(): number {
    return this.data.xp;
  }

  /**
   * Returns a shallow copy of the unlocked-games array.
   * Returning a copy prevents external code from accidentally mutating the
   * internal list (defensive programming).
   */
  getUnlockedGames(): string[] {
    return [...this.data.unlockedGames];
  }

  /**
   * Adds `points` to the running XP total. Negative values are allowed
   * (e.g. a penalty mechanic). The change lives in memory until `save()`.
   */
  updateXP(points: number): void {
    this.data.xp += points;
  }

  /**
   * Marks a game as accessible. Duplicate calls are safe — the id won't be
   * added twice thanks to the includes() guard.
   */
  unlockGame(gameId: string): void {
    if (!this.data.unlockedGames.includes(gameId)) {
      this.data.unlockedGames.push(gameId);
    }
  }

  /** Persists the current in-memory state to disk via `storage.ts`. */
  async save(): Promise<void> {
    await saveState(this.data);
  }
}

// Export a singleton instance so that the entire application shares one
// consistent view of the player's state (XP, unlocks).
export const globalState = new AppState();
