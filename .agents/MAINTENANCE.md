# .agents — Maintenance & Self-Learning Loop

This document tells AI agents and contributors **when and how to update the docs in this folder**.
Stale agent context is worse than no context — treat this as a living system.

---

## When to Update These Docs

Trigger an update to `.agents/context.md` or the relevant workflow whenever any of the below happens:

| Event                                                       | What to update                                                   |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| New core file added to `src/core/`                          | Add it to the directory structure table and describe its role    |
| `GameContext` interface gains/loses a member                | Update the `GameContext` API table in `context.md`               |
| `GameModule` interface changes                              | Update the interface block in `context.md`                       |
| A new npm script is added                                   | Add it to the **Available npm Scripts** table                    |
| A new dependency is added (`chalk`, `inquirer`, etc.)       | Note it in the **Project Overview** section                      |
| A new game file convention is introduced (e.g. `config.ts`) | Add the file to the **File Structure Reference** in the workflow |
| A code-style rule is established (Prettier, ESLint, naming) | Add it to the **Code Style & Conventions** table                 |
| A "DO NOT do" pattern is discovered (e.g. a footgun)        | Add it to the **Architecture Principles — DO NOT** list          |
| A workflow step changes (e.g. preflight script renamed)     | Update `.agents/workflows/add-new-game.md`                       |
| The build/publish process changes                           | Update the scripts table and any workflow that runs them         |

---

## How to Update

1. **Minimal, targeted edits** — change only the section that is outdated. Do not rewrite the whole file.
2. **Mirror the real code** — the docs must always reflect the actual source, not aspirational or planned state.
3. **Add "DO NOT" entries proactively** — whenever a bug or bad pattern is found in a game PR, document it as a rule so future agents don't repeat it.
4. **Keep the context.md interface tables in sync with `types.ts`** — they should be identical in meaning. If they drift, `types.ts` is the source of truth.

---

## What NOT to Document Here

- Game-specific implementation details (document those inside the game's own folder)
- Temporary workarounds (remove these once resolved)
- Information already in `docs/` that is not agent-relevant

---

## Self-Check: Is Context Still Accurate?

Before generating code, an agent should ask:

1. Does the `GameContext` table match the current `src/core/types.ts`?
2. Does the directory structure match `src/`?
3. Are all scripts in the table the same as `package.json → scripts`?
4. Are there any new game files in `src/games/` that introduced a new pattern not documented?

If any answer is **no** → update `context.md` before proceeding with code generation.
