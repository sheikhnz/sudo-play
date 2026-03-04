# sudo-play 🕹️

> Terminal-powered mini games for developers. Zero graphics. Maximum pain.

`sudo-play` is a plugin-based terminal arcade that runs entirely in your CLI. Each game is a self-contained module — challenging your developer instincts across regex, debugging, logic, and more. It's built to be fun, extensible, and dead simple to run.

---

## Play Now

No installation required:

```bash
npx sudo-play
```

Or install globally to play any time:

```bash
npm install -g sudo-play
sudo-play
```

For local development:

```bash
npm install
npm run dev
```

---

## The Idea

`sudo-play` was built for developers who live in the terminal. The concept is simple: a plugin-based arcade where each "game" is a TypeScript module that the engine discovers and loads automatically. You pick a game from the menu, play it, earn XP, and unlock more.

The architecture is intentionally minimal. The core engine knows nothing about individual games — it just defines a clean `GameModule` interface and a sandboxed `GameContext` that each game receives at runtime. This means anyone can add a new game by dropping a single directory into `src/games/`.

---

## Games

| Game               | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| 🐛 **Bug Hunter**  | Spot the bug in a code snippet and pick the right fix. 30s per challenge. |
| 🔍 **Regex Arena** | Write regular expressions to match patterns across 5 progressive levels.  |

More games coming — [contributions welcome](./docs/contributing.md).

---

## How to Play

1. Run `npx sudo-play` (or `npm start` if developing locally)
2. Select a game from the interactive menu
3. Read the challenge, answer with your keyboard
4. Earn XP for correct answers — lose points for mistakes
5. Your progress is saved automatically between sessions

---

## Documentation

| Doc                                      | Description                                             |
| ---------------------------------------- | ------------------------------------------------------- |
| [Architecture](./docs/architecture.md)   | How the engine, router, state, and plugin system work   |
| [Adding a Game](./docs/adding-a-game.md) | Step-by-step guide to building your own game plugin     |
| [Contributing](./docs/contributing.md)   | How to contribute code, games, or bug reports           |
| [API Reference](./docs/api-reference.md) | Full `GameModule` and `GameContext` interface reference |

---

## Tech Stack

- **Node.js** + **TypeScript** (ESM)
- **@inquirer/prompts** — interactive terminal prompts
- **chalk** — terminal colours
- **tsx** — dev-time TypeScript execution

---

## License

ISC © [sheikhnz](https://github.com/sheikhnz)
