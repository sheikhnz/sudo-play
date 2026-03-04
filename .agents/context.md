# sudo-play — Agent Context

> This file is authoritative context for AI code generation in this project.
> Read it fully before making any changes or adding new games.

---

## Project Overview

**sudo-play** is a terminal-native CLI arcade game launcher built with **Node.js + TypeScript (ESM)**. Players run it via `npx sudo-play` and pick from a list of developer-themed mini-games.

- **Runtime**: Node.js with native ESM (`"type": "module"` in `package.json`)
- **Language**: TypeScript 5.x compiled via `tsc`
- **Dev runner**: `tsx` (no build step needed in dev mode)
- **Key deps**: `chalk` v5 (ESM-only), `@inquirer/prompts`
- **Entry point**: `bin/sudo-play.ts` → `dist/bin/sudo-play.js` (post-build)

---

## Directory Structure

```
sudo-play/
├── bin/
│   └── sudo-play.ts         # CLI entry point — calls bootstrap()
├── src/
│   ├── core/                # Engine internals — DO NOT modify unless fixing a bug
│   │   ├── engine.ts        # bootstrap() — auto-loads games, fires up Router
│   │   ├── menu.ts          # showMainMenu() — renders the interactive game list
│   │   ├── router.ts        # Router class — menu loop + GameContext factory
│   │   ├── state.ts         # globalState — in-memory XP/unlock state
│   │   ├── storage.ts       # Disk persistence (~/.sudo-play-state.json)
│   │   ├── types.ts         # GameModule & GameContext interfaces ← READ THIS FIRST
│   │   └── ui.ts            # printBanner/printMessage/printError/… helpers
│   └── games/               # ← Add new games here
│       ├── bug-hunter/      # Game plugin: Bug Hunter
│       └── regex-arena/     # Game plugin: Regex Arena
├── docs/                    # Architecture + contribution guides
├── .agents/                 # AI agent context (you are here)
├── package.json
└── tsconfig.json
```

---

## Core Contracts — Read `src/core/types.ts`

Every game plugin is governed by two interfaces:

### `GameModule`

The plugin manifest. Every game exports a default object of this type:

```ts
export interface GameModule {
  id: string; // kebab-case, unique (e.g. "word-blitz")
  name: string; // Human-readable title for the menu
  description: string; // One-line flavour text
  version: string; // Semver (e.g. "1.0.0")
  start: (context: GameContext) => Promise<void>; // Entry point
}
```

### `GameContext`

The engine API handed to every game on `start()`. Games **must not** import
from core directly — they only use what `context` exposes:

| Member                             | Purpose                                  |
| ---------------------------------- | ---------------------------------------- |
| `context.ui.printBanner(text)`     | Full-width bordered header               |
| `context.ui.printMessage(msg)`     | Plain white text                         |
| `context.ui.printWarning(msg)`     | Yellow ⚠ prefix                          |
| `context.ui.printError(msg)`       | Red ✖ prefix                             |
| `context.ui.printSuccess(msg)`     | Green ✔ prefix                           |
| `context.ui.clearInteractive()`    | Clear terminal (new screen)              |
| `context.state.getXP()`            | Returns current player XP (number)       |
| `context.state.getUnlockedGames()` | Returns string[] of unlocked game IDs    |
| `context.updateXP(points)`         | Add/subtract XP in-memory                |
| `context.unlockGame(gameId)`       | Mark a game as unlocked                  |
| `context.saveProgress()`           | Flush state to `~/.sudo-play-state.json` |

---

## How to Add a New Game

> See `docs/adding-a-game.md` for the full guide. Short version:

1. Create `src/games/<your-game-id>/` (use kebab-case)
2. Create these files inside:

   | File            | Purpose                                                  |
   | --------------- | -------------------------------------------------------- |
   | `index.ts`      | Exports default `GameModule` (the engine discovers this) |
   | `engine.ts`     | Core game loop / session logic                           |
   | `ui.ts`         | All terminal rendering for the game                      |
   | `challenges.ts` | Static challenge/level data                              |
   | `validator.ts`  | Answer validation logic (optional)                       |

3. In `index.ts`, import `GameModule` and `GameContext` from `../../core/types.js` (**note `.js` extension** — required by ESM)
4. The engine auto-discovers your game — no registration step needed.

### Minimal `index.ts` template

```ts
import { GameModule, GameContext } from '../../core/types.js';
import { runMyGame } from './engine.js';

const myGame: GameModule = {
  id: 'my-game', // must be unique
  name: 'My Game',
  description: 'One line about what the player does.',
  version: '1.0.0',
  start: (context: GameContext): Promise<void> => runMyGame(context),
};

export default myGame;
```

---

## Code Style & Conventions

| Rule                             | Detail                                                                    |
| -------------------------------- | ------------------------------------------------------------------------- |
| **ESM imports**                  | Always use `.js` file extensions in imports (even for `.ts` source files) |
| **No default exports from core** | Core files use named exports only                                         |
| **Game isolation**               | Games must never import from core directly except `types.ts`              |
| **Async throughout**             | All game sessions are `async/await`; never block the event loop           |
| **Error resilience**             | Wrap game logic in try/catch; a crash must not kill the main menu         |
| **Chalk**                        | Only use chalk inside `ui.ts` files — never in challenge data             |
| **Prettier**                     | Run `npm run format` before committing                                    |
| **Linting**                      | Run `npm run lint` — fix all warnings before PR                           |
| **JSDoc**                        | Every exported function and interface needs a JSDoc comment               |

---

## Available npm Scripts

| Script                 | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Run with `tsx` (no compile step)        |
| `npm run build`        | Compile TypeScript → `dist/`            |
| `npm start`            | Run compiled output                     |
| `npm run format`       | Prettier format all files               |
| `npm run lint`         | ESLint check                            |
| `npm run lint:fix`     | ESLint auto-fix                         |
| `npm run pr-preflight` | Format + lint fix (run before every PR) |

---

## Architecture Principles (DO follow)

1. **Zero cross-game imports** — games are fully isolated plugins.
2. **Convention over configuration** — the engine discovers games by folder structure, not a registry.
3. **Fail-safe loading** — a broken game plugin must not prevent other games from loading.
4. **Context-only API** — the `GameContext` is the only surface area games touch in core.
5. **Single responsibility per file** — split: index (manifest), engine (logic), ui (rendering), challenges (data), validator (checks).

## Architecture Principles (DO NOT do)

- Do **not** import `globalState` directly inside a game — use `context.state.*` and `context.updateXP`.
- Do **not** use `process.exit()` inside games.
- Do **not** use `console.log()` — use `context.ui.*` helpers instead.
- Do **not** use CommonJS (`require`/`module.exports`) — the project is full ESM.
- Do **not** add game-specific dependencies to `package.json` without discussion.
