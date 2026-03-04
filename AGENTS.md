# sudo-play — AI Agent Instructions

> Full context lives in [`.agents/context.md`](.agents/context.md).
> Read that file before making any code changes.

## Quick Reference

- **Stack**: Node.js + TypeScript (ESM), chalk v5, @inquirer/prompts
- **Dev**: `npm run dev` (tsx, no compile needed)
- **Build**: `npm run build` (tsc → dist/)
- **Before every commit**: `npm run pr-preflight`

## Adding a New Game

See the step-by-step workflow at [`.agents/workflows/add-new-game.md`](.agents/workflows/add-new-game.md).

All games live in `src/games/<game-id>/`. They are auto-discovered — no registration needed.
Every game exports a default `GameModule` from `index.ts` and receives a `GameContext` on start.

## Hard Rules

- Use `.js` extensions in all ESM imports (even for `.ts` source files)
- Never `import` from `src/core/*` inside a game, except `types.ts`
- Never use `console.log()` — use `context.ui.*`
- Never call `process.exit()` inside a game
- `chalk` only inside `ui.ts` files
