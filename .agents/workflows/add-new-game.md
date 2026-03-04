---
description: how to add a new game plugin to sudo-play
---

# Workflow: Add a New Game Plugin

> Always read `.agents/context.md` and `src/core/types.ts` before starting.

## Steps

1. **Confirm the game ID** with the user — must be kebab-case, unique across `src/games/`.

2. **Create the game directory**:
   ```
   src/games/<game-id>/
   ```

3. **Create `index.ts`** — the GameModule manifest (engine entry point):
   - Import `GameModule` and `GameContext` from `../../core/types.js` (note `.js`)
   - Export a default `GameModule` object with `id`, `name`, `description`, `version`, and `start`
   - `start` must delegate to the main session function in `engine.ts`

4. **Create `engine.ts`** — the game session logic:
   - Export an `async function run<GameName>(context: GameContext): Promise<void>`
   - Wrap the entire function body in a try/catch that calls `context.ui.printError()` on failure
   - Never use `process.exit()` — always resolve the promise to return to the main menu
   - Use `context.ui.*` for all terminal output
   - Call `context.updateXP(n)` to award XP, then `await context.saveProgress()` at game end

5. **Create `ui.ts`** — rendering helpers:
   - Import `chalk` for styling, use `context.ui.*` for structural messages
   - Keep all `chalk` usage inside this file, not in `engine.ts`
   - Export functions like `renderRound()`, `renderScoreboard()`, `renderGameOver()`

6. **Create `challenges.ts`** — static game data:
   - Export typed arrays/objects of challenge content (questions, levels, etc.)
   - No logic here — pure data only
   - Define and export a TypeScript interface for the challenge shape

7. **Create `validator.ts`** (if needed) — answer checking:
   - Export pure functions that take an answer + challenge and return a boolean or score
   - No side effects, no UI calls

8. **Verify auto-discovery works**:
// turbo
   ```bash
   npm run dev
   ```
   The new game should appear in the main menu without any core changes.

9. **Run preflight checks**:
// turbo
   ```bash
   npm run pr-preflight
   ```
   Fix all formatting and linting issues before considering the work done.

## File Structure Reference

```
src/games/<game-id>/
├── index.ts       # GameModule export (engine discovers this)
├── engine.ts      # runGame(context) — game loop
├── ui.ts          # renderX() helpers using chalk
├── challenges.ts  # Static challenge/level data
└── validator.ts   # Pure answer-checking functions (optional)
```

## Checklist

- [ ] `id` is unique and kebab-case
- [ ] All imports use `.js` extension
- [ ] `index.ts` exports default `GameModule`
- [ ] Game never imports from core except `types.ts`
- [ ] No `console.log()` — only `context.ui.*`
- [ ] No `process.exit()` calls
- [ ] `context.saveProgress()` called after game ends
- [ ] JSDoc comments on all exported functions
- [ ] `npm run pr-preflight` passes clean
