/**
 * router.ts — Game Session Manager
 *
 * The Router sits between the main menu and individual game plugins. Its job is:
 *  1. Maintain an indexed map of all loaded games (keyed by `GameModule.id`).
 *  2. Run the main menu loop, re-displaying the menu after each game finishes.
 *  3. Build a `GameContext` object for each game session that provides a safe,
 *     scoped API into the core engine (UI helpers, state reads, XP mutations).
 *
 * Using a `Map` for game storage gives O(1) lookup when the player selects
 * a game by id.
 */

import { GameModule, GameContext } from './types.js';
import { showMainMenu } from './menu.js';
import { globalState } from './state.js';
import {
  clearInteractive,
  printBanner,
  printMessage,
  printError,
  printSuccess,
  printWarning,
} from './ui.js';

/**
 * Router — coordinates the main-menu loop and game lifecycle.
 */
export class Router {
  /** Internal map of game id → GameModule for fast O(1) lookup. */
  private games: Map<string, GameModule> = new Map();

  /**
   * Accepts the list of all auto-loaded games and indexes them by id.
   * @param gamesList  Array of valid GameModule objects from engine.ts.
   */
  constructor(gamesList: GameModule[]) {
    for (const game of gamesList) {
      this.games.set(game.id, game);
    }
  }

  /**
   * start — begins the interactive main-menu loop.
   *
   * Loops indefinitely until the player chooses "Exit" or no games are
   * available. After each game session ends, the loop restarts, showing
   * the menu again with updated XP in the banner.
   */
  async start() {
    // Infinite loop — we break out explicitly when the player exits.
    while (true) {
      clearInteractive();

      // Show the current XP in the header so players can see their progress
      // at a glance before picking a game.
      printBanner(`sudo-play | XP: ${globalState.getXP()}`);

      const unlocked = globalState.getUnlockedGames();
      const availableGames = Array.from(this.games.values());

      // Edge case: the games directory was empty or all loads failed.
      if (availableGames.length === 0) {
        printWarning('No games found in the /games directory.');
        break;
      }

      // Render the menu and wait for player input.
      const selectedId = await showMainMenu(availableGames, unlocked);

      // `null` means the player chose "Exit".
      if (!selectedId) {
        printMessage('Thanks for playing! Goodbye.');
        break;
      }

      const game = this.games.get(selectedId);
      if (game) {
        clearInteractive();
        printBanner(`Starting ${game.name}...`);

        /**
         * Build the GameContext — the only interface a game plugin has to the
         * core engine. We pass references to UI helpers and state accessors, and
         * provide thin wrappers around XP and unlock mutations so games never
         * touch globalState directly.
         */
        const context: GameContext = {
          ui: {
            printBanner,
            printMessage,
            printWarning,
            printError,
            printSuccess,
            clearInteractive,
          },
          state: {
            // Games read state through these getters; they cannot mutate it directly.
            getXP: () => globalState.getXP(),
            getUnlockedGames: () => globalState.getUnlockedGames(),
          },
          updateXP: (points) => {
            // Games call this to earn (or lose) XP. Returns immediately;
            // the change is persisted by saveProgress / the auto-save below.
            globalState.updateXP(points);
          },
          unlockGame: (id) => globalState.unlockGame(id),
          saveProgress: async () => await globalState.save(),
        };

        try {
          // Await the game's own async logic. This blocks until the game
          // resolves (session ends) or rejects (crash).
          await game.start(context);
        } catch (err: any) {
          // Surface game crashes gracefully so one buggy game can't kill
          // the entire app session.
          printError(`Game crashed: ${err.message}`);
        }

        // Auto-save after every game session so progress is never lost even
        // if the player didn't explicitly call saveProgress() inside the game.
        printMessage('Saving progress...');
        await globalState.save();
      }
    }
  }
}
