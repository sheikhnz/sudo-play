/**
 * games/regex-arena/index.ts — GameModule Entry Point
 *
 * This file is the only one the sudo-play engine directly imports. It exports
 * a default object that satisfies the `GameModule` interface, wiring the
 * game's metadata to the `runRegexArena` session function from engine.ts.
 *
 * Auto-discovered by `src/core/engine.ts` because this file lives at:
 *   src/games/regex-arena/index.ts
 * and exports a default object with a valid `id` field.
 */

import { GameModule, GameContext } from '../../core/types.js';
import { runRegexArena } from './engine.js';

/**
 * regexArena — the GameModule object that the engine will discover and load.
 *
 * Fields:
 *  - id          Unique identifier used for unlock tracking and routing.
 *  - name        Human-readable title shown in the main menu.
 *  - description Short flavour text displayed alongside the menu entry.
 *  - version     Semver string for this game plugin.
 *  - start       Delegates directly to runRegexArena; resolves when the
 *                 session ends (all levels complete or player exits early).
 */
const regexArena: GameModule = {
  id: 'regex-arena',
  name: 'Regex Arena',
  description: 'Write regex patterns to match challenge test cases. 5 levels of increasing difficulty.',
  version: '1.0.0',

  start: (context: GameContext): Promise<void> => runRegexArena(context),
};

export default regexArena;
