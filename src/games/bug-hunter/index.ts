/**
 * games/bug-hunter/index.ts — GameModule Entry Point
 *
 * The only file that the sudo-play engine imports directly. It exports a
 * default object satisfying the `GameModule` interface, wiring the game's
 * metadata to the `runBugHunter` session function from engine.ts.
 *
 * Auto-discovered by `src/core/engine.ts` because this file lives at:
 *   src/games/bug-hunter/index.ts
 * and exports a default object with a valid `id` field.
 */

import { GameModule, GameContext } from '../../core/types.js';
import { runBugHunter } from './engine.js';

/**
 * bugHunter — the GameModule object that the engine will discover and load.
 *
 * Fields:
 *  - id          Unique identifier used for unlock tracking and routing.
 *  - name        Human-readable title shown in the main menu.
 *  - description Short flavour text displayed alongside the menu entry.
 *  - version     Semver string for this game plugin.
 *  - start       Delegates directly to runBugHunter; resolves when the
 *                session ends (all rounds complete or player finishes).
 */
const bugHunter: GameModule = {
  id: 'bug-hunter',
  name: 'Bug Hunter',
  description:
    'Spot the bug in a code snippet and pick the right fix. 30s per challenge.',
  version: '1.0.0',

  start: (context: GameContext): Promise<void> => runBugHunter(context),
};

export default bugHunter;
