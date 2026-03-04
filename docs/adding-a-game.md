# Adding a New Game

Games in sudo-play are self-contained plugin modules. The engine discovers them automatically — no registration or wiring needed. All you need to do is create a directory under `src/games/` and export a valid `GameModule`.

---

## Quick Start (5 steps)

### 1. Create your game directory

```bash
mkdir src/games/my-game
```

### 2. Create `index.ts`

This is the only file the engine imports. It exports your `GameModule` as the default export.

```typescript
// src/games/my-game/index.ts

import { GameModule, GameContext } from '../../core/types.js';

const myGame: GameModule = {
  id: 'my-game',              // unique, kebab-case identifier
  name: 'My Game',            // shown in the main menu
  description: 'A short description of what this game is.', // shown in menu
  version: '1.0.0',

  start: async (context: GameContext): Promise<void> => {
    context.ui.clearInteractive();
    context.ui.printBanner('My Game');
    context.ui.printMessage('Welcome! Let\'s play.');

    // your game logic here

    context.updateXP(50);
    await context.saveProgress();
    context.ui.printSuccess('You earned 50 XP!');
  },
};

export default myGame;
```

### 3. Add your game logic

For non-trivial games, split logic into separate files within your directory:

```
src/games/my-game/
├── index.ts      ← engine entry point (keep this thin)
├── engine.ts     ← core game loop
├── levels.ts     ← level or challenge data
├── ui.ts         ← game-specific rendering
└── validator.ts  ← answer validation logic
```

Your `index.ts` then delegates to the engine:

```typescript
import { runMyGame } from './engine.js';

const myGame: GameModule = {
  // ...metadata...
  start: (context: GameContext) => runMyGame(context),
};
```

### 4. Run and test

```bash
npm run dev
```

Select your game from the menu. No build step needed in dev mode.

### 5. Build before publishing

```bash
npm run build
npm start
```

---

## Working with GameContext

The `context` argument is your only interface to the engine. Use it for everything.

### UI Helpers

```typescript
context.ui.clearInteractive();         // clear the terminal
context.ui.printBanner('Round 1');     // big bordered title
context.ui.printMessage('Pick one:');  // plain message
context.ui.printSuccess('Correct!');   // green ✔
context.ui.printWarning('Slow down!'); // yellow ⚠
context.ui.printError('Wrong.');       // red ✖
```

### Reading Player State

```typescript
const xp = context.state.getXP();
const unlocked = context.state.getUnlockedGames();
```

### Awarding XP

```typescript
context.updateXP(100);   // add XP
context.updateXP(-20);   // deduct XP (floor is 0)
```

### Unlocking Games

```typescript
context.unlockGame('my-other-game');  // idempotent, safe to call multiple times
```

### Saving Progress

Always call `saveProgress()` before your game resolves so the player's XP is written to disk.

```typescript
await context.saveProgress();
```

---

## Using Inquirer for Prompts

The project already depends on `@inquirer/prompts`. Use it for interactive input:

```typescript
import { select, input, confirm } from '@inquirer/prompts';

// Multiple choice
const answer = await select({
  message: 'Which is the bug?',
  choices: [
    { name: 'Option A', value: 'a' },
    { name: 'Option B', value: 'b' },
  ],
});

// Free text input
const regex = await input({ message: 'Enter your regex:' });

// Yes/No
const again = await confirm({ message: 'Play again?' });
```

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Directory name | `kebab-case` | `src/games/word-bomb` |
| `id` field | Same as directory | `'word-bomb'` |
| `name` field | Title Case | `'Word Bomb'` |
| File names | `kebab-case.ts` | `engine.ts`, `levels.ts` |

---

## Rules

- **Do not import from `../../core/engine`**, `../../core/router`, or `../../core/state` directly. Use `GameContext` exclusively.
- **Always call `saveProgress()`** before your game's `start()` resolves.
- **Handle errors gracefully** — uncaught exceptions will crash the whole app. Wrap risky logic in `try/catch`.
- **Keep `index.ts` thin** — it should only declare the `GameModule` metadata and delegate `start` to your engine file.

---

## Example: Existing Games

Study the existing games as reference implementations:

| Game | Highlights |
|------|-----------|
| [`bug-hunter`](../src/games/bug-hunter/) | Timer-based, multiple choice, difficulty scaling |
| [`regex-arena`](../src/games/regex-arena/) | Free-text input, regex validation, progressive levels |
