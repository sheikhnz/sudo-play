/**
 * engine.ts — Application Bootstrap & Game Auto-Loader
 *
 * This module is the top-level orchestrator of sudo-play. It is responsible for:
 *  1. Initialising persistent state (loading the save file).
 *  2. Auto-discovering game plugins from the `games/` directory.
 *  3. Handing the resulting list of loaded games to the Router, which drives
 *     the interactive main-menu loop.
 *
 * Game plugins are discovered by convention: any sub-directory of `games/`
 * that contains an `index.ts` (or compiled `index.js`) file is treated as a
 * candidate. The file must export a default object conforming to `GameModule`.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { globalState } from './state.js';
import { Router } from './router.js';
import { GameModule } from './types.js';

/**
 * bootstrap — initialises the application and starts the main menu loop.
 *
 * @param gamesDir  Absolute path to the directory that contains game plugin
 *                  sub-folders (e.g. `/…/src/games`).
 */
export async function bootstrap(gamesDir: string) {
  // Load persisted XP and unlock data from `~/.sudo-play-state.json`.
  await globalState.init();

  // First-run experience: unlock the built-in "dummy" game so new players
  // always have something to try straight away.
  if (globalState.getUnlockedGames().length === 0) {
    globalState.unlockGame('dummy');
    await globalState.save();
  }

  // Accumulates every successfully loaded GameModule.
  const loadedGames: GameModule[] = [];

  try {
    // Read the top-level entries of the games directory.
    const entries = await fs.readdir(gamesDir, { withFileTypes: true });

    for (const entry of entries) {
      // Only directories are considered — loose files at this level are ignored.
      if (entry.isDirectory()) {
        // Prefer the TypeScript source file (used when running with tsx/ts-node).
        // Fall back to the compiled JavaScript file (production / after `tsc`).
        let gameIndexPath = path.join(gamesDir, entry.name, 'index.ts');
        let exists = false;

        try {
          await fs.access(gameIndexPath); // throws if the file doesn't exist
          exists = true;
        } catch {
          try {
            // .ts not found — try .js (compiled output)
            gameIndexPath = path.join(gamesDir, entry.name, 'index.js');
            await fs.access(gameIndexPath);
            exists = true;
          } catch {
            // Neither .ts nor .js exists; skip this directory silently.
          }
        }

        if (exists) {
          try {
            // Convert the file path to a `file://` URL before passing it to
            // `import()`. This is required on Windows (backslashes in paths
            // are not valid in ESM specifiers) and is good practice everywhere.
            const moduleUrl = pathToFileURL(gameIndexPath).href;
            const gameModule = await import(moduleUrl);

            // A valid game plugin must export a default object with an `id`
            // field. Anything else is likely not a game plugin and is skipped.
            if (gameModule.default && gameModule.default.id) {
              loadedGames.push(gameModule.default as GameModule);
            } else {
              console.warn(
                `Game in ${entry.name} does not export a valid GameModule as default.`,
              );
            }
          } catch (err) {
            // A broken game should not crash the entire app — warn and move on.
            console.warn(`Could not load game ${entry.name}: ${err}`);
          }
        }
      }
    }
  } catch (err) {
    // The games directory itself is missing or unreadable. This is recoverable
    // (the menu will show no games), but worth logging as an error.
    console.error(`Failed to read games directory at ${gamesDir}`, err);
  }

  // Hand all successfully loaded games to the Router and enter the menu loop.
  const router = new Router(loadedGames);
  await router.start();
}
