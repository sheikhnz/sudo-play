/**
 * games/bug-hunter/challenges.ts — Bug Challenge Definitions
 *
 * Contains the full catalogue of bug challenges used by the game engine.
 * Each challenge presents a code snippet with a hidden bug and four
 * multiple-choice options. Only the engine imports this file — it exposes
 * no I/O or side effects.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Supported language syntax tags for display colouring. */
export type Language = 'js' | 'ts' | 'python';

/** Difficulty tier for scoring and colour badges. */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Four-option multiple-choice answer key. */
export type AnswerKey = 'A' | 'B' | 'C' | 'D';

/**
 * BugChallenge — the full shape of one Bug Hunter round.
 *
 * The `code` field is a multi-line string that will be rendered as a
 * syntax-highlighted block in the terminal. `options` is always exactly
 * four strings (indexed A–D). `correct` must be one of A, B, C, or D.
 */
export interface BugChallenge {
  id: number;
  language: Language;
  title: string;
  /** Raw source code string displayed verbatim in the terminal block. */
  code: string;
  question: string;
  /** Exactly four answer options, indexed 0–3 ↔ A–D. */
  options: [string, string, string, string];
  correct: AnswerKey;
  explanation: string;
  difficulty: Difficulty;
}

// ─────────────────────────────────────────────────────────────────────────────
// Challenge catalogue
// ─────────────────────────────────────────────────────────────────────────────

export const challenges: BugChallenge[] = [
  // ── 1. async/await — missing await on fetch ──────────────────────────────
  {
    id: 1,
    language: 'js',
    difficulty: 'easy',
    title: 'The Forgotten Await',
    code: `async function getUser() {
  const user = fetch("/api/user");
  return user.name;
}`,
    question: 'What is the bug in this async function?',
    options: [
      'fetch() returns a Promise, not the response object',
      'The return type annotation is missing',
      'The name property does not exist on Response',
      'The function must be an arrow function',
    ],
    correct: 'A',
    explanation:
      '`fetch()` returns a Promise<Response>. Without `await`, `user` is a Promise object, not the resolved response — so `user.name` is `undefined`. Fix: `const user = await (await fetch("/api/user")).json();`',
  },

  // ── 2. Off-by-one — <= vs < in loop ────────────────────────────────────
  {
    id: 2,
    language: 'js',
    difficulty: 'easy',
    title: 'Off by One',
    code: `function sum(arr) {
  let total = 0;
  for (let i = 0; i <= arr.length; i++) {
    total += arr[i];
  }
  return total;
}`,
    question: 'What is wrong with this loop?',
    options: [
      'The initial value of total should be 1',
      'The condition `i <= arr.length` reads one index past the end',
      'The += operator does not work with arrays',
      'total should be declared with const',
    ],
    correct: 'B',
    explanation:
      'Arrays are zero-indexed, so valid indices are `0` to `arr.length - 1`. When `i === arr.length`, `arr[i]` is `undefined`, and `total += undefined` yields `NaN`. The condition should be `i < arr.length`.',
  },

  // ── 3. null/undefined — optional chaining missing ────────────────────
  {
    id: 3,
    language: 'ts',
    difficulty: 'easy',
    title: 'Null Pointer Nightmare',
    code: `interface User {
  profile?: {
    avatar: string;
  };
}

function getAvatar(user: User): string {
  return user.profile.avatar;
}`,
    question: 'What runtime error can this function throw?',
    options: [
      'TypeScript will refuse to compile this code',
      '`user.profile` may be undefined, causing a TypeError',
      'The return type should be `string | undefined`',
      '`avatar` should be accessed with bracket notation',
    ],
    correct: 'B',
    explanation:
      '`profile` is marked optional (`?:`), so it may be `undefined`. Accessing `.avatar` on `undefined` throws `TypeError: Cannot read properties of undefined`. Fix: use optional chaining `user.profile?.avatar ?? ""` or add a null check.',
  },

  // ── 4. Array mutation — sort mutates original ────────────────────────
  {
    id: 4,
    language: 'js',
    difficulty: 'medium',
    title: 'Silent Mutation',
    code: `function getTopScores(scores) {
  const sorted = scores.sort((a, b) => b - a);
  return sorted.slice(0, 3);
}`,
    question: 'What unintended side-effect does this function have?',
    options: [
      'slice() returns a shallow copy, losing nested references',
      'sort() mutates the original `scores` array in place',
      'The comparator (b - a) produces ascending order',
      'sorted is not necessary; slice works directly on scores',
    ],
    correct: 'B',
    explanation:
      "Array `.sort()` sorts **in place** and returns the same array reference. The caller's original `scores` array is permanently reordered. Fix: `const sorted = [...scores].sort((a, b) => b - a);`",
  },

  // ── 5. Promise handling — .catch swallows error ─────────────────────
  {
    id: 5,
    language: 'js',
    difficulty: 'medium',
    title: 'Swallowed Promise',
    code: `async function loadData() {
  const data = await fetch("/api/data")
    .then(res => res.json())
    .catch(err => {
      console.error(err);
    });
  return data.results;
}`,
    question: 'What happens when fetch() rejects?',
    options: [
      'An unhandled rejection crashes the process',
      '`.catch` returns `undefined`, so `data` is undefined and `data.results` throws',
      'console.error re-throws the error automatically',
      'The function returns an empty array by default',
    ],
    correct: 'B',
    explanation:
      'When `.catch` handles an error without returning a value, the resolved value of the chain becomes `undefined`. Then `data.results` throws `TypeError: Cannot read properties of undefined`. Fix: either re-throw inside `.catch` or return a safe fallback like `{ results: [] }`.',
  },

  // ── 6. Regex misuse — RegExp with global flag and test() ─────────────
  {
    id: 6,
    language: 'js',
    difficulty: 'medium',
    title: 'The Stateful RegEx',
    code: `const emailRe = /\\w+@\\w+\\.\\w+/g;

function isEmail(str) {
  return emailRe.test(str);
}

console.log(isEmail("a@b.com")); // true
console.log(isEmail("a@b.com")); // false ?!`,
    question: 'Why does the second call return false?',
    options: [
      'The regex pattern is incorrect for email validation',
      'The global flag causes `lastIndex` to persist between calls, skipping the match',
      'test() can only be called once per RegExp instance',
      'console.log coerces the result to a string incorrectly',
    ],
    correct: 'B',
    explanation:
      'When using the `g` flag, `RegExp.prototype.test()` advances `lastIndex` after a match. On the second call with the same string, `lastIndex` is non-zero and the search starts past the match, returning `false`. Fix: remove the `g` flag, or create a new RegExp inside the function.',
  },

  // ── 7. async/await — Promise.all vs sequential await ─────────────────
  {
    id: 7,
    language: 'ts',
    difficulty: 'medium',
    title: 'Sequential Slowdown',
    code: `async function fetchAll(ids: number[]) {
  const results = [];
  for (const id of ids) {
    const data = await fetch(\`/api/item/\${id}\`).then(r => r.json());
    results.push(data);
  }
  return results;
}`,
    question: 'What is the performance problem with this code?',
    options: [
      'fetch() inside a for-of loop is not allowed',
      'Each request waits for the previous one to finish, making them sequential instead of parallel',
      'The results array should be pre-allocated for performance',
      'Template literals cannot be used with fetch()',
    ],
    correct: 'B',
    explanation:
      'Awaiting inside a `for-of` loop makes each request wait for the previous one to complete, giving O(n) latency. Fix: `const results = await Promise.all(ids.map(id => fetch(\\`/api/item/${id}\\`).then(r => r.json())));` to run all requests concurrently.',
  },

  // ── 8. Closure in loop — var vs let ──────────────────────────────────
  {
    id: 8,
    language: 'js',
    difficulty: 'hard',
    title: 'Closure Trap',
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
// Expected: 0, 1, 2
// Actual:   ?`,
    question: 'What does this code actually log after 1 second?',
    options: [
      '0, 1, 2 — each callback captures its own i',
      '3, 3, 3 — all callbacks share the same var-scoped i',
      '0, 0, 0 — setTimeout freezes the value of i',
      'undefined, undefined, undefined — i is not in scope',
    ],
    correct: 'B',
    explanation:
      '`var` is function-scoped, so all three arrow functions close over the **same** `i`. By the time the callbacks fire (after 1 second), the loop has finished and `i` is `3`. Fix: use `let` (block-scoped) or an IIFE to capture the current value.',
  },

  // ── 9. Array method — forEach returns undefined ───────────────────
  {
    id: 9,
    language: 'js',
    difficulty: 'easy',
    title: 'Map vs forEach',
    code: `function doubleAll(numbers) {
  return numbers.forEach(n => n * 2);
}

const result = doubleAll([1, 2, 3]);
console.log(result); // undefined`,
    question: 'Why does `doubleAll` return `undefined`?',
    options: [
      'Arrow functions inside forEach cannot return values',
      'forEach always returns undefined; it does not produce a new array',
      'The multiplication operator does not work inside forEach',
      'The function body is missing curly braces',
    ],
    correct: 'B',
    explanation:
      '`Array.prototype.forEach` is designed purely for side effects and **always returns `undefined`**, regardless of what the callback returns. To transform elements into a new array, use `.map()`: `return numbers.map(n => n * 2);`',
  },

  // ── 10. Equality — === vs == with null ────────────────────────────────
  {
    id: 10,
    language: 'js',
    difficulty: 'medium',
    title: 'Nullish Confusion',
    code: `function isSet(value) {
  return value !== null;
}

console.log(isSet(undefined)); // true — is this correct?`,
    question: 'What is the logical bug in `isSet`?',
    options: [
      '!== should be != for a proper null check',
      '`undefined` is not equal to `null` with strict equality, so unset values pass',
      'The function name should start with `check` by convention',
      'null and undefined are the same type in JavaScript',
    ],
    correct: 'B',
    explanation:
      'In JavaScript, `null !== undefined` is `true` because strict equality (`===`) does not coerce types. An `undefined` value (which typically means "not set") slips through the check. Fix: `return value != null;` (loose equality) which catches both `null` and `undefined`, or `return value !== null && value !== undefined;`',
  },

  // ── 11. TypeScript — type widening with object literal ───────────────
  {
    id: 11,
    language: 'ts',
    difficulty: 'hard',
    title: 'Widened to String',
    code: `const config = {
  mode: "production",
};

function setMode(mode: "production" | "development") {
  console.log(mode);
}

setMode(config.mode); // TS Error`,
    question: 'Why does TypeScript reject `config.mode` here?',
    options: [
      'String literals cannot be used as function arguments',
      'config.mode is inferred as type `string`, not `"production" | "development"`',
      'The function parameter requires a union type import',
      'Object properties must be marked `readonly` to pass to typed functions',
    ],
    correct: 'B',
    explanation:
      'TypeScript widens the type of `config.mode` to `string` (the general type) rather than the literal type `"production"`. A plain `string` is not assignable to `"production" | "development"`. Fix: use `as const` (`const config = { mode: "production" } as const;`) or add an explicit type annotation.',
  },

  // ── 12. Python — mutable default argument ─────────────────────────────
  {
    id: 12,
    language: 'python',
    difficulty: 'hard',
    title: 'Mutable Default Trap',
    code: `def append_item(item, lst=[]):
    lst.append(item)
    return lst

print(append_item(1))  # [1]
print(append_item(2))  # [1, 2] — not [2] !`,
    question: 'Why does the second call return `[1, 2]` instead of `[2]`?',
    options: [
      'Python passes lists by reference, so append modifies the caller',
      'Default argument `lst=[]` is evaluated once at function definition, not per call',
      'The append method returns None in Python',
      'lst should be annotated as list[int] to reset per call',
    ],
    correct: 'B',
    explanation:
      'In Python, mutable default arguments are evaluated **once** when the `def` statement is executed, not each time the function is called. The same list object is reused across all calls. Fix: use `None` as the default and create the list inside the function: `def append_item(item, lst=None): if lst is None: lst = []`',
  },
];
