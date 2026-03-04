/**
 * games/bug-hunter/engine.ts — Game Flow Orchestrator
 *
 * `runBugHunter` drives the full game session: displaying challenges,
 * running a countdown timer, collecting player input, validating answers,
 * computing scores, and printing round-by-round feedback.
 *
 * This file is the only place that does I/O via GameContext and inquirer.
 * challenges.ts, validator.ts, and ui.ts remain pure/display-only.
 */

import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { GameContext } from '../../core/types.js';
import { challenges, BugChallenge, AnswerKey } from './challenges.js';
import { validateAnswer, computeRoundScore } from './validator.js';
import {
  printChallengeHeader,
  renderTimerBar,
  clearTimerLine,
  printRoundFeedback,
  printSessionSummary,
} from './ui.js';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Time limit per challenge in milliseconds. */
const TIME_LIMIT_MS = 30_000;

/** How often the timer bar refreshes (ms). Smaller = smoother. */
const TIMER_TICK_MS = 250;

/** Number of challenges to play per session (sampled from the catalogue). */
const ROUNDS_PER_SESSION = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * shuffledChallenges — returns a copy of the challenges array in random order.
 * Uses the Fisher-Yates algorithm for unbiased shuffling.
 */
function shuffledChallenges(src: BugChallenge[]): BugChallenge[] {
  const arr = [...src];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────────────────
// Timed prompt — wraps an inquirer select with a countdown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * timedSelect — presents a multiple-choice prompt with a live countdown bar.
 *
 * Runs a timer tick loop concurrently with the inquirer prompt. When the
 * time limit is reached the prompt is resolved early with the sentinel value
 * `'X'` to indicate a timeout. The caller never waits more than `timeLimitMs`.
 *
 * @returns  The chosen AnswerKey ('A'–'D'), or 'X' on timeout.
 */
async function timedSelect(
  challenge: BugChallenge,
  timeLimitMs: number,
): Promise<AnswerKey | 'X'> {
  const startTime = Date.now();

  // Choices array for inquirer
  const choices = [
    { name: `A.  ${challenge.options[0]}`, value: 'A' },
    { name: `B.  ${challenge.options[1]}`, value: 'B' },
    { name: `C.  ${challenge.options[2]}`, value: 'C' },
    { name: `D.  ${challenge.options[3]}`, value: 'D' },
  ] as { name: string; value: AnswerKey }[];

  // ── Timer bar loop ───────────────────────────────────────────────────────
  // We animate the timer bar while waiting for input. Because inquirer has
  // already claimed the cursor, we write to stdout using process.stdout.write
  // with a carriage return to overwrite the same line.
  let timerExpired = false;

  const timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, timeLimitMs - elapsed);
    renderTimerBar(remaining, timeLimitMs);

    if (remaining === 0) {
      timerExpired = true;
      clearInterval(timerInterval);
    }
  }, TIMER_TICK_MS);

  // ── Prompt vs timeout race ───────────────────────────────────────────────
  const promptPromise = select<AnswerKey>({
    message: chalk.bold('Your answer:'),
    choices,
  });

  const timeoutPromise = new Promise<'X'>((resolve) => {
    setTimeout(() => resolve('X'), timeLimitMs);
  });

  const result = await Promise.race([promptPromise, timeoutPromise]);

  clearInterval(timerInterval);
  clearTimerLine();

  // If timer expired, the prompt may still be open in the terminal.
  // We can't programmatically close it, so we signal the timeout via 'X'.
  if (timerExpired && result !== 'X') {
    // Player answered just before timeout — treat as valid
    return result as AnswerKey;
  }

  return result as AnswerKey | 'X';
}

// ─────────────────────────────────────────────────────────────────────────────
// Single round runner
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runRound — drives a single challenge from display to feedback.
 *
 * @returns  XP earned this round (0 on wrong/timeout).
 */
async function runRound(
  challenge: BugChallenge,
  roundNumber: number,
  totalRounds: number,
  streak: number,
  sessionXP: number,
  context: GameContext,
): Promise<{ xpEarned: number; correct: boolean; newStreak: number }> {
  context.ui.clearInteractive();
  printChallengeHeader(challenge, roundNumber, totalRounds);

  const startTime = Date.now();
  const chosen = await timedSelect(challenge, TIME_LIMIT_MS);
  const elapsedMs = Date.now() - startTime;

  const correct = chosen !== 'X' && validateAnswer(challenge, chosen);
  const result = computeRoundScore(correct, elapsedMs, TIME_LIMIT_MS, streak);

  const newStreak = correct ? streak + 1 : 0;
  const newSessionXP = sessionXP + result.score;

  printRoundFeedback(result, challenge, chosen, newStreak, newSessionXP);

  return { xpEarned: result.score, correct, newStreak };
}

// ─────────────────────────────────────────────────────────────────────────────
// Game session entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runBugHunter — the top-level function called by the GameModule.
 *
 * Shuffles the challenge catalogue, runs ROUNDS_PER_SESSION rounds,
 * accumulates XP, and prints a session summary before returning to the Router.
 */
export async function runBugHunter(context: GameContext): Promise<void> {
  context.ui.clearInteractive();
  context.ui.printBanner('Bug Hunter 🐛');

  console.log(
    chalk.white('  Spot the bug. Pick the right fix. Race the clock.'),
  );
  console.log();
  console.log(
    chalk.dim(
      `  Scoring:  base ${chalk.white('+50')}  +  speed bonus ${chalk.white('remainingSeconds × 5')}  +  streak bonus ${chalk.white('streak × 10')}`,
    ),
  );
  console.log(
    chalk.dim(`  Time limit: ${TIME_LIMIT_MS / 1000} seconds per challenge`),
  );
  console.log(chalk.dim(`  Challenges:  ${ROUNDS_PER_SESSION} per session`));
  console.log();

  await confirm({ message: 'Press enter to start the hunt' });

  // ── Session setup ────────────────────────────────────────────────────────
  const sessionChallenges = shuffledChallenges(challenges).slice(
    0,
    ROUNDS_PER_SESSION,
  );
  const xpBefore = context.state.getXP();
  let sessionXP = 0;
  let streak = 0;
  let bestStreak = 0;
  let correctCount = 0;

  // ── Round loop ───────────────────────────────────────────────────────────
  for (let i = 0; i < sessionChallenges.length; i++) {
    const challenge = sessionChallenges[i];
    const roundNumber = i + 1;

    const { xpEarned, correct, newStreak } = await runRound(
      challenge,
      roundNumber,
      sessionChallenges.length,
      streak,
      sessionXP,
      context,
    );

    sessionXP += xpEarned;
    streak = newStreak;

    if (correct) {
      correctCount += 1;
      if (streak > bestStreak) bestStreak = streak;
    }

    context.updateXP(xpEarned);

    // Pause between rounds (not after the last one)
    if (roundNumber < sessionChallenges.length) {
      await confirm({ message: 'Press enter for the next challenge' });
    }
  }

  // ── Session summary ────────────────────────────────────────────────────────
  context.ui.clearInteractive();
  context.ui.printBanner('Bug Hunter — Session Complete!');

  printSessionSummary(
    sessionXP,
    xpBefore,
    correctCount,
    sessionChallenges.length,
    bestStreak,
  );

  await context.saveProgress();
  context.ui.printSuccess('Progress saved!');
  console.log();

  await confirm({ message: 'Press enter to return to the main menu' });
}
