/**
 * games/regex-arena/engine.ts — Level Flow Orchestrator
 *
 * `runRegexArena` drives the full game session: iterating through all levels,
 * collecting user input, running the validator, printing score breakdowns, and
 * offering retry / next-level choices after each level.
 *
 * The engine is the only file allowed to do I/O (via GameContext and inquirer).
 * levels.ts and validator.ts remain pure and dependency-free.
 */

import { input, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { GameContext } from '../../core/types.js';
import { levels, RegexLevel, Difficulty } from './levels.js';
import { safeCompileRegex, runTestCases, computeScore, CaseResult } from './validator.js';

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers (local to this file — not exported)
// ─────────────────────────────────────────────────────────────────────────────

/** Maps difficulty to a coloured badge string. */
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

/** Prints the level header with id, badge, title and description. */
function printLevelHeader(level: RegexLevel): void {
  console.log();
  console.log(
    chalk.bold.cyan(`  ─── Level ${level.id} / ${levels.length} ───`) +
      '  ' +
      difficultyBadge(level.difficulty),
  );
  console.log(chalk.bold.white(`  ${level.title}`));
  console.log();
  console.log(chalk.white(`  ${level.description}`));
  console.log();
  console.log(chalk.dim(`  💡 Hint: ${level.hint}`));
  console.log();
}

/** Prints human-readable results for each test case. */
function printCaseResults(results: CaseResult[]): void {
  console.log(chalk.bold('\n  Test Case Results:'));
  console.log(chalk.dim('  ' + '─'.repeat(52)));

  for (const r of results) {
    const icon = r.passed ? chalk.green('  ✔') : chalk.red('  ✖');
    const label = r.shouldMatch
      ? chalk.dim('should match   ')
      : chalk.dim('should NOT match');
    const matchedLabel = r.didMatch ? chalk.green('matched') : chalk.red('no match');
    const inputStr = chalk.cyan(`"${r.input}"`);
    console.log(`${icon}  ${label}  ${inputStr.padEnd(32)}  → ${matchedLabel}`);
  }

  console.log(chalk.dim('  ' + '─'.repeat(52)));
}

/** Prints the full scoring breakdown after a level attempt. */
function printScoreBreakdown(
  correct: number,
  total: number,
  falsePositives: number,
  falseNegatives: number,
  accuracyScore: number,
  timeBonus: number,
  attemptPenalty: number,
  finalScore: number,
): void {
  console.log(chalk.bold('\n  Score Breakdown:'));
  console.log(chalk.dim('  ' + '─'.repeat(36)));
  console.log(
    `  ${chalk.white('Accuracy')}         ${chalk.green(`${correct}/${total}`)} cases passed`,
  );
  console.log(
    `  ${chalk.white('False positives')}  ${chalk.red(String(falsePositives))}`,
  );
  console.log(
    `  ${chalk.white('False negatives')}  ${chalk.red(String(falseNegatives))}`,
  );
  console.log(chalk.dim('  ' + '─'.repeat(36)));
  console.log(
    `  ${chalk.white('Accuracy score')}   ${chalk.yellow(`+${accuracyScore} pts`)}`,
  );
  console.log(
    `  ${chalk.white('Time bonus')}       ${chalk.yellow(`+${timeBonus} pts`)}`,
  );
  if (attemptPenalty > 0) {
    console.log(
      `  ${chalk.white('Attempt penalty')}  ${chalk.red(`-${attemptPenalty} pts`)}`,
    );
  }
  console.log(chalk.dim('  ' + '─'.repeat(36)));

  const scoreColour = finalScore >= 80 ? chalk.green : finalScore >= 40 ? chalk.yellow : chalk.red;
  console.log(
    `  ${chalk.bold('Final score')}      ${scoreColour.bold(`${finalScore} pts`)}`,
  );
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main level runner
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runLevel — drives one level from start to finish.
 *
 * Handles the prompt/validate/score loop for a single level, supporting
 * multiple attempts. Returns the best score achieved across all attempts.
 */
async function runLevel(level: RegexLevel, context: GameContext): Promise<number> {
  let attempts = 0;
  let bestScore = 0;
  const levelStartTime = Date.now();

  while (true) {
    // ── Prompt ──────────────────────────────────────────────────────────────
    const rawPattern = await input({
      message: chalk.cyan('  Enter your regex pattern:'),
    });

    // ── Safe compile ────────────────────────────────────────────────────────
    const regex = safeCompileRegex(rawPattern);

    if (regex === null) {
      context.ui.printError(
        `"${rawPattern}" is not a valid regex pattern. Check for unclosed groups or invalid escapes.`,
      );
      // Re-prompt without incrementing attempts — invalid syntax isn't a real attempt
      continue;
    }

    attempts += 1;
    const elapsedMs = Date.now() - levelStartTime;

    // ── Evaluate ────────────────────────────────────────────────────────────
    const result = runTestCases(regex, level.testCases);
    const breakdown = computeScore(result, elapsedMs, attempts);

    if (breakdown.total > bestScore) {
      bestScore = breakdown.total;
    }

    // ── Print detailed results ───────────────────────────────────────────────
    printCaseResults(result.caseResults);
    printScoreBreakdown(
      result.correct,
      result.total,
      result.falsePositives,
      result.falseNegatives,
      breakdown.accuracyScore,
      breakdown.timeBonus,
      breakdown.attemptPenalty,
      breakdown.total,
    );

    // ── Perfect score — auto-advance ─────────────────────────────────────────
    if (result.correct === result.total) {
      context.ui.printSuccess('Perfect! All test cases passed!');
      break;
    }

    // ── Offer retry or continue ──────────────────────────────────────────────
    const choice = await select({
      message: 'What would you like to do?',
      choices: [
        { name: '🔁  Retry this level (−10 pts per extra attempt)', value: 'retry' },
        { name: '➡️   Move to the next level with this score', value: 'next' },
        { name: '🚪  Exit to main menu', value: 'exit' },
      ],
    });

    if (choice === 'retry') {
      context.ui.clearInteractive();
      printLevelHeader(level);
      continue;
    }

    // 'next' or 'exit' both stop the level loop
    if (choice === 'exit') {
      // Signal to outer loop we should bail completely
      return -1;
    }

    break;
  }

  return bestScore;
}

// ─────────────────────────────────────────────────────────────────────────────
// Game session entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runRegexArena — the top-level function called by the GameModule.
 *
 * Iterates through all levels in order, accumulates XP, and prints a session
 * summary at the end before returning control to the Router.
 */
export async function runRegexArena(context: GameContext): Promise<void> {
  context.ui.clearInteractive();
  context.ui.printBanner('Welcome to Regex Arena!');

  console.log(chalk.white('  Craft regex patterns to match the challenge test cases.'));
  console.log(chalk.white('  Earn XP from accuracy, speed, and efficiency.'));
  console.log();
  console.log(chalk.dim('  Scoring:  accuracy (0–100) + time bonus (0–30) − attempt penalty (10×)'));
  console.log(chalk.dim('  XP awarded = final score per level (minimum 0).'));
  console.log();

  await confirm({ message: 'Press enter to start Level 1' });

  let sessionXP = 0;
  const xpBefore = context.state.getXP();

  for (const level of levels) {
    context.ui.clearInteractive();
    printLevelHeader(level);

    const score = await runLevel(level, context);

    // −1 is the exit sentinel from runLevel
    if (score === -1) {
      context.ui.printWarning('Session ended early. Progress has been saved.');
      break;
    }

    const xpEarned = Math.max(0, score);
    context.updateXP(xpEarned);
    sessionXP += xpEarned;

    console.log(
      chalk.bold.green(`  +${xpEarned} XP earned`) +
        chalk.dim(`  (Total: ${context.state.getXP()} XP)`),
    );
    console.log();

    // If not the last level, pause before moving on
    if (level.id < levels.length) {
      await confirm({ message: `Press enter to continue to Level ${level.id + 1}` });
    }
  }

  // ── Session summary ────────────────────────────────────────────────────────
  context.ui.clearInteractive();
  context.ui.printBanner('Regex Arena — Session Complete!');

  const xpAfter = context.state.getXP();
  console.log(chalk.bold.white('  Session Summary'));
  console.log(chalk.dim('  ' + '─'.repeat(32)));
  console.log(`  XP earned this session:  ${chalk.green.bold(`+${sessionXP}`)}`);
  console.log(`  XP before session:       ${chalk.dim(String(xpBefore))}`);
  console.log(`  Total XP now:            ${chalk.cyan.bold(String(xpAfter))}`);
  console.log();

  await context.saveProgress();
  context.ui.printSuccess('Progress saved!');
  console.log();

  await confirm({ message: 'Press enter to return to the main menu' });
}
