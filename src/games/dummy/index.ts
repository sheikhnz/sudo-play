/**
 * games/dummy/index.ts — Dummy Game Plugin (Reference Implementation)
 *
 * This is the built-in example game. It serves two purposes:
 *  1. Give brand-new players something to try immediately (it's unlocked by
 *     default in `engine.ts`).
 *  2. Act as a minimal but complete reference for anyone building a new game.
 *
 * How to create your own game:
 *  1. Create a new directory under `src/games/<your-game-id>/`.
 *  2. Add an `index.ts` that exports a default object matching `GameModule`.
 *  3. sudo-play will auto-discover and load it on next launch.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Key patterns demonstrated here:
 *  - Reading player state via `context.state.getXP()`
 *  - Awarding XP via `context.updateXP(n)`
 *  - Using UI helpers (no direct chalk imports needed)
 *  - Waiting for user input with @inquirer/prompts `confirm`
 *  - "Press enter to return" pattern at the end of a session
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { GameModule, GameContext } from '../../core/types.js';
import { confirm } from '@inquirer/prompts';

/**
 * dummyGame — the GameModule object exported as `default`.
 * The engine discovers this file and calls `dummyGame.start(context)` when
 * the player selects "Dummy Game" from the main menu.
 */
const dummyGame: GameModule = {
  id: 'dummy',          // Must be unique across all games; used for unlock tracking
  name: 'Dummy Game',
  description: 'A simple example game to demonstrate the plugin system.',
  version: '1.0.0',

  /**
   * start — the game session entry point.
   *
   * Receives a `GameContext` from the Router. Everything the game needs
   * (UI output, state reads, XP rewards) comes through this object.
   * The function should resolve when the game session is over.
   */
  start: async (context: GameContext) => {
    // Show a banner to signal the game has started.
    context.ui.printBanner('Welcome to the Dummy Game!');
    context.ui.printMessage('This is a test to show how games interact with the core engine.');
    
    // Read current XP from state (read-only — mutations go through updateXP).
    context.ui.printMessage(`Your current XP is: ${context.state.getXP()}`);
    
    // Ask the player whether they want to play a round.
    const play = await confirm({ message: 'Do you want to play a round and earn 25 XP?' });
    
    if (play) {
      context.ui.clearInteractive();
      context.ui.printSuccess('You played the dummy game amazingly well!');

      // Award XP — this is in-memory; the Router auto-saves after start() resolves.
      context.updateXP(25);
      context.ui.printMessage(`You earned 25 XP! New total: ${context.state.getXP()}`);
    } else {
      context.ui.clearInteractive();
      context.ui.printMessage('Maybe next time!');
    }
    
    // Pause before returning to the menu so the player can read the result.
    await confirm({ message: 'Press enter to return to the main menu' });
    // Returning here signals to the Router that the session is over.
  }
};

export default dummyGame;
