/**
 * types.ts — Shared TypeScript contracts for the plugin system.
 *
 * Defines the two core interfaces that tie the game engine to individual
 * game plugins without either side depending on the other's implementation.
 */

/**
 * GameContext is the "sandbox" object the engine hands to every game when it
 * starts. Games should only interact with the engine through this object —
 * they never import the engine directly.
 *
 * Splitting it into `ui`, `state`, and action methods keeps concerns clear:
 *  - `ui`    → rendering helpers (they all delegate to ui.ts)
 *  - `state` → read-only view of the player's current progress
 *  - actions → mutations (XP updates, unlocks, persistence)
 */
export interface GameContext {
  /** Namespaced UI helpers so games can print messages without importing chalk. */
  ui: {
    /** Prints a stylised banner with a decorative border. */
    printBanner: (text: string) => void;
    /** Prints a plain white message. */
    printMessage: (msg: string) => void;
    /** Prints a yellow warning prefixed with ⚠. */
    printWarning: (msg: string) => void;
    /** Prints a red error prefixed with ✖. */
    printError: (msg: string) => void;
    /** Prints a green success message prefixed with ✔. */
    printSuccess: (msg: string) => void;
    /** Clears the terminal — useful before rendering a new game screen. */
    clearInteractive: () => void;
  };
  /** Read-only snapshot of persisted player state. */
  state: {
    /** Returns the player's current total XP. */
    getXP: () => number;
    /** Returns a copy of the list of game IDs the player has unlocked. */
    getUnlockedGames: () => string[];
  };
  /**
   * Awards (or deducts) XP points. The change is in-memory until
   * `saveProgress()` is called.
   */
  updateXP: (points: number) => void;
  /**
   * Marks a game as unlocked by its `id`. Idempotent — safe to call multiple
   * times with the same id.
   */
  unlockGame: (gameId: string) => void;
  /** Flushes the current in-memory state to disk (the JSON save file). */
  saveProgress: () => Promise<void>;
}

/**
 * GameModule is the contract every game plugin must fulfil.
 * A game is discovered automatically if it lives in `src/games/<id>/index.ts`
 * and exports a default object that satisfies this interface.
 */
export interface GameModule {
  /** Unique machine-readable identifier (e.g. `"regex-arena"`, `"wordle"`). */
  id: string;
  /** Human-readable display name shown in the main menu. */
  name: string;
  /** Short description of the game shown to players. */
  description: string;
  /** Semver string (e.g. `"1.0.0"`) for the game plugin. */
  version: string;
  /**
   * Entry point called by the Router when the player selects this game.
   * Receives a `GameContext` from the engine and should resolve when the
   * game session ends (player quits, win/lose screen, etc.).
   */
  start: (context: GameContext) => Promise<void>;
}
