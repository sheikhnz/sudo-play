# sudo-play

A modular, plugin-based terminal arcade architecture that supports dynamically adding multiple games.

## Architecture

- `src/core`: Contains the game engine, UI helpers, state management, and routing logic. It handles the main menu and securely boots game modules.
- `src/games`: Contains all individual game plugins. The engine dynamically scans this directory and loads the games.

## How to play

```bash
npm install
npm run build
npm start
```

For development without manually building every time:
```bash
npm run dev
```

## Adding a New Game

1. Create a new directory inside `src/games/` (e.g., `src/games/my-game`).
2. Create an `index.ts` file in that directory.
3. Export a `GameModule` as the **default** export.

Example:
```typescript
import { GameModule, GameContext } from '../../core/types.js';

const myGame: GameModule = {
  id: 'my-game',
  name: 'My Fun Game',
  description: 'A great new game for sudo-play.',
  version: '1.0.0',
  start: async (context: GameContext) => {
    context.ui.printBanner('Welcome to My Fun Game!');
    context.ui.printMessage('You are playing the game...');
    
    // Reward the player
    context.updateXP(50);
    context.ui.printSuccess('You earned 50 XP!');
  }
};

export default myGame;
```

Remember:
- Do not mutate the global state directly. Use the methods provided in `GameContext`.
- Core never imports specific games directly; it discovers them automatically.
