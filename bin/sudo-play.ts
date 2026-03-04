#!/usr/bin/env node
/**
 * bin/sudo-play.ts — CLI Entry Point
 *
 * This is the first file executed when you run `sudo-play` from the terminal.
 * The shebang line (`#!/usr/bin/env node`) tells the OS to run this with Node.js.
 *
 * Responsibilities:
 *  1. Reconstruct `__dirname` (not available natively in ESM modules).
 *  2. Resolve the path to the `games/` directory that holds all game plugins.
 *  3. Call `bootstrap()` to initialise state and launch the interactive menu.
 */

import path from 'node:path';
import url from 'node:url';
import { bootstrap } from '../src/core/engine.js';

// ESM does not expose __filename / __dirname natively, so we derive them
// from import.meta.url (the file:// URL of the current module).
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect whether we are running from the compiled `dist/` output or directly
// from `src/` (e.g. via ts-node / tsx during development).
const isDist = __dirname.includes('dist');

// Walk up one level from `bin/` to get the project root.
const packageRoot = path.resolve(__dirname, '..');

// Games live under `src/games/` as individual sub-directories.
// Each sub-directory must export a default GameModule from its `index.ts`.
const resolvedGamesDir = path.join(packageRoot, 'src', 'games');

// Kick off the application. Any unhandled error surfaces here so we can exit
// cleanly with a non-zero code instead of printing an ugly stack trace.
bootstrap(resolvedGamesDir).catch((err) => {
  console.error("Fatal error loading sudo-play:", err);
  process.exit(1);
});
