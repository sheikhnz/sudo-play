# Contributing

Contributions are welcome — whether that's a new game, a bug fix, a new challenge set, or improved docs.

---

## Getting Started

```bash
# Fork and clone the repo
git clone https://github.com/sheikhnz/sudo-play.git
cd sudo-play

# Install dependencies
npm install

# Run in development mode (no build step needed)
npm run dev
```

---

## What You Can Contribute

### 🎮 New Games

The easiest and highest-impact contribution. See the [Adding a Game](./adding-a-game.md) guide for full instructions. Good game ideas:

- **Type Speed** — real code snippets to type as fast as possible
- **Git Blame** — identify who introduced a bug based on context clues
- **SQL Builder** — construct queries to satisfy a given output
- **Binary Decode** — convert binary to ASCII under a time limit
- **Algo Race** — pick the most efficient algorithm for a given input size

### 🐛 Bug Fixes

Check the [issue tracker](https://github.com/sheikhnz/sudo-play/issues) for open bugs. Leave a comment before starting work on an issue so we don't duplicate effort.

### 📝 New Challenges / Levels

Existing games have challenge data files (`challenges.ts`, `levels.ts`). Adding more challenges to existing games is a great first contribution that doesn't require understanding the core engine.

### 📖 Documentation

Unclear docs, missing examples, or outdated content — all welcome as PRs.

---

## Development Workflow

### Branch naming

```
feat/my-new-game
fix/bug-hunter-timer
docs/improve-readme
```

### Before submitting a PR

Run the preflight check:

```bash
npm run pr-preflight
```

This runs Prettier format check and ESLint fix. You can also run them separately:

```bash
npm run format       # auto-format all files
npm run lint:fix     # auto-fix lint issues
```

Individual checks:

```bash
npm run format:check # check without writing
npm run lint         # lint without fixing
```

### Build check

Make sure the TypeScript compiles without errors:

```bash
npm run build
```

---

## Code Style

The project uses **Prettier** and **ESLint** with TypeScript rules. The config is in `.prettierrc` and `eslint.config.js`.

Key conventions:

- **No `any` types** — use proper TypeScript types or generics
- **No unused variables** — remove or prefix with `_` if intentionally unused
- **ESM imports** — always include `.js` extension on relative imports (e.g. `'./engine.js'`)
- **Games never import core internals** — use `GameContext` exclusively; do not import from `../../core/engine`, `../../core/state`, etc.
- **Keep `index.ts` thin** — game entry files should only declare `GameModule` metadata and delegate to a separate `engine.ts`

---

## Adding a Game — Checklist

Before opening a PR for a new game:

- [ ] Directory name is `kebab-case` and matches the `id` field in your `GameModule`
- [ ] `index.ts` only declares the `GameModule` and delegates to `engine.ts`
- [ ] All game logic is in files inside your game directory (no changes to `src/core/`)
- [ ] `saveProgress()` is called before the game resolves
- [ ] `clearInteractive()` is called at the start of each new screen
- [ ] No direct imports from `chalk` — use `context.ui.*` helpers
- [ ] No hardcoded paths or global state mutations
- [ ] Code passes `npm run pr-preflight`
- [ ] Game is playable end-to-end via `npm run dev`

---

## Reporting Bugs

Open an issue at [github.com/sheikhnz/sudo-play/issues](https://github.com/sheikhnz/sudo-play/issues) with:

- What you ran (`npx sudo-play` or a specific npm script)
- Your Node.js version (`node --version`)
- What you expected vs. what happened
- Any error output from the terminal

---

## Questions

Open a [GitHub Discussion](https://github.com/sheikhnz/sudo-play/discussions) or file an issue with the `question` label.
