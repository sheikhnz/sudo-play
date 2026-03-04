/**
 * games/bug-hunter/validator.ts — Answer Validation & Scoring Logic
 *
 * Pure, stateless functions that determine if a player's answer is correct
 * and compute the round score. No I/O, no side effects — the engine imports
 * these and handles all user interaction separately.
 *
 * Scoring formula:
 *   baseScore   = 50
 *   speedBonus  = remainingTimeSeconds * 5   (max ~150 for a 30 s round)
 *   streakBonus = streak * 10
 *   total       = baseScore + speedBonus + streakBonus  (0 if incorrect)
 */

import { BugChallenge, AnswerKey } from './challenges.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Result returned after a single round answer is validated. */
export interface RoundResult {
  /** Whether the player chose the correct option. */
  correct: boolean;
  /** Points awarded this round (0 if incorrect). */
  score: number;
  /** Breakdown components for the score display. */
  breakdown: {
    baseScore: number;
    speedBonus: number;
    streakBonus: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * validateAnswer — checks whether `answer` is the correct option for `challenge`.
 *
 * @param challenge  The current BugChallenge being played.
 * @param answer     The player's chosen answer key (A–D).
 * @returns          true if correct, false otherwise.
 */
export function validateAnswer(
  challenge: BugChallenge,
  answer: AnswerKey,
): boolean {
  return answer === challenge.correct;
}

/**
 * computeRoundScore — derives one round's score from correctness, time, and streak.
 *
 * If the answer is incorrect the score is always 0; no penalties are applied
 * to accumulated session XP (only the missed gain matters).
 *
 * @param correct        Whether the answer was correct.
 * @param elapsedMs      Milliseconds elapsed since the round started.
 * @param timeLimitMs    The configured time limit in milliseconds.
 * @param streak         Current correct-answer streak before this round.
 * @returns              A RoundResult with full breakdown.
 */
export function computeRoundScore(
  correct: boolean,
  elapsedMs: number,
  timeLimitMs: number,
  streak: number,
): RoundResult {
  if (!correct) {
    return {
      correct: false,
      score: 0,
      breakdown: { baseScore: 0, speedBonus: 0, streakBonus: 0 },
    };
  }

  const baseScore = 50;

  // remainingTime in whole seconds, clamped to [0, timeLimitSeconds]
  const remainingMs = Math.max(0, timeLimitMs - elapsedMs);
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const speedBonus = remainingSeconds * 5;

  const streakBonus = streak * 10;

  const score = baseScore + speedBonus + streakBonus;

  return {
    correct: true,
    score,
    breakdown: { baseScore, speedBonus, streakBonus },
  };
}
