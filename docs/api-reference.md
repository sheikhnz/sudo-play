# API Reference

This document covers the two core interfaces that every game plugin interacts with. Both are defined in [`src/core/types.ts`](../src/core/types.ts).

---

## `GameModule`

The contract every game plugin must fulfil. Export a default object satisfying this interface from your `src/games/<id>/index.ts`.

```typescript
interface GameModule {
  id: string;
  name: string;
  description: string;
  version: string;
  start: (context: GameContext) => Promise<void>;
}
```

### Fields

| Field         | Type       | Required | Description                                                                                                                            |
| ------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `string`   | ✅       | Unique, machine-readable identifier. Used for unlock tracking and routing. Use `kebab-case`.                                           |
| `name`        | `string`   | ✅       | Human-readable display name shown in the main menu.                                                                                    |
| `description` | `string`   | ✅       | Short (one line) description displayed alongside the menu entry.                                                                       |
| `version`     | `string`   | ✅       | Semver string, e.g. `"1.0.0"`.                                                                                                         |
| `start`       | `function` | ✅       | Entry point called by the router when the player selects this game. Must return a `Promise<void>` that resolves when the session ends. |

### Example

```typescript
const myGame: GameModule = {
  id: 'my-game',
  name: 'My Game',
  description: 'A short description.',
  version: '1.0.0',
  start: async (context: GameContext) => {
    // game logic
  },
};

export default myGame;
```

---

## `GameContext`

The sandbox object the engine hands to a game's `start()` method. Games interact with the engine exclusively through this object.

```typescript
interface GameContext {
  ui: {
    printBanner: (text: string) => void;
    printMessage: (msg: string) => void;
    printWarning: (msg: string) => void;
    printError: (msg: string) => void;
    printSuccess: (msg: string) => void;
    clearInteractive: () => void;
  };
  state: {
    getXP: () => number;
    getUnlockedGames: () => string[];
  };
  updateXP: (points: number) => void;
  unlockGame: (gameId: string) => void;
  saveProgress: () => Promise<void>;
}
```

---

### `context.ui`

Terminal rendering helpers. All output goes through these — games should not import `chalk` directly.

#### `printBanner(text: string) => void`

Prints a styled banner with a decorative border. Use for game titles and round headers.

#### `printMessage(msg: string) => void`

Prints a plain white message. Use for narration and instructions.

#### `printWarning(msg: string) => void`

Prints a yellow message prefixed with `⚠`. Use for timer warnings or soft alerts.

#### `printError(msg: string) => void`

Prints a red message prefixed with `✖`. Use for wrong answers or fatal game events.

#### `printSuccess(msg: string) => void`

Prints a green message prefixed with `✔`. Use for correct answers and XP awards.

#### `clearInteractive() => void`

Clears the terminal. Call this before rendering a new game screen or round.

---

### `context.state`

Read-only view of the player's persisted progress.

#### `getXP() => number`

Returns the player's current total XP.

#### `getUnlockedGames() => string[]`

Returns a copy of the list of game IDs the player has unlocked.

---

### `context.updateXP(points: number) => void`

Awards or deducts XP points. The change is applied in-memory immediately, but not saved to disk until `saveProgress()` is called. XP cannot go below zero.

```typescript
context.updateXP(100); // award 100 XP
context.updateXP(-50); // deduct 50 XP
```

---

### `context.unlockGame(gameId: string) => void`

Marks a game as unlocked by its `id`. Idempotent — safe to call multiple times with the same id. The change is in-memory until `saveProgress()` is called.

```typescript
context.unlockGame('regex-arena');
```

---

### `context.saveProgress() => Promise<void>`

Flushes the current in-memory state to disk (`~/.sudo-play/save.json`). Call this before your `start()` function resolves to ensure the player's progress is persisted.

```typescript
context.updateXP(200);
await context.saveProgress(); // always await this
```

---

## Save File Format

Player progress is stored at `~/.sudo-play/save.json`:

```json
{
  "xp": 420,
  "unlockedGames": ["bug-hunter", "regex-arena"]
}
```

This file is created automatically on first run. Do not write to it directly — use `context.saveProgress()`.
