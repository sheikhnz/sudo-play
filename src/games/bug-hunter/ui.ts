/**
 * games/bug-hunter/ui.ts — Terminal Rendering Helpers
 *
 * All visual output for Bug Hunter lives here. The engine calls these helpers
 * to render the challenge, timer bar, option list, and post-round feedback,
 * keeping I/O strictly separated from game logic.
 *
 * Nothing in this file touches I/O directly (console is fine for rendering);
 * it does NOT import inquirer — only the engine does prompting.
 */

import chalk from 'chalk';
import { BugChallenge, AnswerKey, Language, Difficulty } from './challenges.js';
import { RoundResult } from './validator.js';

// ─────────────────────────────────────────────────────────────────────────────
// Colour maps for syntax and badges
// ─────────────────────────────────────────────────────────────────────────────

/** Maps a language tag to its coloured label. */
function langLabel(lang: Language): string {
  switch (lang) {
    case 'js':
      return chalk.bgHex('#f7df1e').black(' JS ');
    case 'ts':
      return chalk.bgHex('#3178c6').white(' TS ');
    case 'python':
      return chalk.bgHex('#3572a5').white(' PY ');
  }
}

/** Maps a difficulty to a styled badge. */
function difficultyBadge(d: Difficulty): string {
  switch (d) {
    case 'easy':
      return chalk.bgGreen.black(' EASY ');
    case 'medium':
      return chalk.bgYellow.black(' MEDIUM ');
    case 'hard':
      return chalk.bgRed.white(' HARD ');
  }
}

/** Answer option labels, colour-coded per letter. */
type ChalkColor = typeof chalk.cyan;
const OPTION_COLORS: Record<AnswerKey, ChalkColor> = {
  A: chalk.cyan,
  B: chalk.magenta,
  C: chalk.yellow,
  D: chalk.green,
};

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D'];

// ─────────────────────────────────────────────────────────────────────────────
// Code block renderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * printCodeBlock — renders `code` inside a bordered terminal block.
 *
 * Lines are dimmed and indented with a left border character to make the
 * snippet visually stand out from the surrounding prompt text.
 */
export function printCodeBlock(code: string, lang: Language): void {
  const lines = code.split('\n');
  const width = Math.max(...lines.map((l) => l.length), 40);

  console.log();
  console.log(
    '  ' +
      chalk.dim('┌─') +
      langLabel(lang) +
      chalk.dim('─'.repeat(width - 2) + '┐'),
  );

  for (const line of lines) {
    const padded = line.padEnd(width);
    console.log('  ' + chalk.dim('│ ') + chalk.white(padded) + chalk.dim(' │'));
  }

  console.log('  ' + chalk.dim('└' + '─'.repeat(width + 2) + '┘'));
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// Challenge header
// ─────────────────────────────────────────────────────────────────────────────

/**
 * printChallengeHeader — renders the round preamble (number, difficulty,
 * language, title, code, question, and answer options).
 */
export function printChallengeHeader(
  challenge: BugChallenge,
  roundNumber: number,
  totalRounds: number,
): void {
  console.log();
  console.log(
    chalk.bold.cyan(`  ─── Challenge ${roundNumber} / ${totalRounds} ───`) +
      '  ' +
      difficultyBadge(challenge.difficulty) +
      '  ' +
      langLabel(challenge.language),
  );
  console.log(chalk.bold.white(`  ${challenge.title}`));
  console.log();

  printCodeBlock(challenge.code, challenge.language);

  console.log('  ' + chalk.bold.white(challenge.question));
  console.log();

  for (let i = 0; i < ANSWER_KEYS.length; i++) {
    const key = ANSWER_KEYS[i];
    const colour = OPTION_COLORS[key];
    const label = colour.bold(`  ${key}.`);
    console.log(`${label}  ${chalk.white(challenge.options[i])}`);
  }
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// Timer bar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * renderTimerBar — prints a single-line progress bar showing remaining time.
 *
 * Intended to be called repeatedly by overwriting the same terminal line via
 * `process.stdout.write` + `\r`. Callers are responsible for the timing loop.
 *
 * @param remainingMs   Milliseconds remaining.
 * @param totalMs       Total time limit in milliseconds.
 * @param barWidth      Width of the bar in characters (default 30).
 */
export function renderTimerBar(
  remainingMs: number,
  totalMs: number,
  barWidth = 30,
): void {
  const fraction = Math.max(0, Math.min(1, remainingMs / totalMs));
  const filled = Math.round(fraction * barWidth);
  const empty = barWidth - filled;

  const bar = chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
  const seconds = Math.ceil(remainingMs / 1000);
  const timeStr = chalk.bold(String(seconds).padStart(2, ' ') + 's');

  // Colour the bar yellow under 10 s, red under 5 s
  const timerColour =
    remainingMs < 5_000
      ? chalk.red
      : remainingMs < 10_000
        ? chalk.yellow
        : chalk.green;

  process.stdout.write(`\r  ⏱  ${timerColour(timeStr)}  [${bar}]   `);
}

/** Clears the timer line after the round ends. */
export function clearTimerLine(): void {
  process.stdout.write('\r' + ' '.repeat(60) + '\r');
}

// ─────────────────────────────────────────────────────────────────────────────
// Post-round feedback
// ─────────────────────────────────────────────────────────────────────────────

/**
 * printRoundFeedback — shows correct/incorrect result, explanation, and score.
 *
 * @param result      The RoundResult from validator.ts.
 * @param challenge   The challenge that was just answered.
 * @param chosen      The answer key the player selected (or 'X' for timeout).
 * @param streak      The updated streak value (after this round).
 * @param totalXP     Running session XP total after this round.
 */
export function printRoundFeedback(
  result: RoundResult,
  challenge: BugChallenge,
  chosen: AnswerKey | 'X',
  streak: number,
  totalXP: number,
): void {
  console.log();

  if (result.correct) {
    console.log(chalk.bold.green('  ✔  Correct!'));
  } else if (chosen === 'X') {
    console.log(chalk.bold.red("  ✖  Time's up!"));
    console.log(
      `  The correct answer was ${chalk.bold.cyan(challenge.correct)}: ${chalk.white(challenge.options[ANSWER_KEYS.indexOf(challenge.correct)])}`,
    );
  } else {
    console.log(chalk.bold.red(`  ✖  Wrong! You chose ${chosen}.`));
    console.log(
      `  The correct answer was ${chalk.bold.cyan(challenge.correct)}: ${chalk.white(challenge.options[ANSWER_KEYS.indexOf(challenge.correct)])}`,
    );
  }

  console.log();
  console.log('  ' + chalk.dim('─'.repeat(54)));
  console.log('  ' + chalk.italic.white(challenge.explanation));
  console.log('  ' + chalk.dim('─'.repeat(54)));
  console.log();

  if (result.correct) {
    const { baseScore, speedBonus, streakBonus } = result.breakdown;
    console.log(chalk.bold('  Score Breakdown:'));
    console.log(`    Base score   ${chalk.yellow(`+${baseScore}`)}`);
    console.log(`    Speed bonus  ${chalk.yellow(`+${speedBonus}`)}`);
    if (streakBonus > 0) {
      console.log(
        `    Streak bonus ${chalk.yellow(`+${streakBonus}`)}  🔥 ${streak} in a row!`,
      );
    }
    console.log(chalk.dim('    ' + '─'.repeat(18)));
    console.log(`    Round total  ${chalk.bold.green(`+${result.score} XP`)}`);
  }

  console.log(`\n  Session XP: ${chalk.cyan.bold(String(totalXP))}`);
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// Session summary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * printSessionSummary — renders the end-of-game recap table.
 *
 * @param sessionXP     Total XP earned this session.
 * @param xpBefore      XP the player had before this session.
 * @param correct       Number of correctly answered challenges.
 * @param total         Total challenges attempted.
 * @param bestStreak    Longest streak achieved during the session.
 */
export function printSessionSummary(
  sessionXP: number,
  xpBefore: number,
  correct: number,
  total: number,
  bestStreak: number,
): void {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const xpAfter = xpBefore + sessionXP;

  console.log(chalk.bold.white('  Session Summary'));
  console.log(chalk.dim('  ' + '─'.repeat(36)));
  console.log(
    `  Challenges:       ${chalk.white(`${correct} / ${total} correct`)}  (${accuracy}%)`,
  );
  console.log(`  Best streak:      ${chalk.white(`${bestStreak}`)}`);
  console.log(chalk.dim('  ' + '─'.repeat(36)));
  console.log(`  XP this session:  ${chalk.green.bold(`+${sessionXP}`)}`);
  console.log(`  XP before:        ${chalk.dim(String(xpBefore))}`);
  console.log(`  Total XP:         ${chalk.cyan.bold(String(xpAfter))}`);
  console.log();
}
