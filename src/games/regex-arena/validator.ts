/**
 * games/regex-arena/validator.ts — Regex Evaluation & Scoring Logic
 *
 * Contains three pure, stateless functions:
 *  - safeCompileRegex: wraps `new RegExp()` in a try/catch to prevent crashes
 *    on invalid user input.
 *  - runTestCases:     executes a compiled regex against each test case and
 *    categorises the results.
 *  - computeScore:     converts raw results into a score using the formula
 *    score = (accuracy * 100) + timeBonus - attemptPenalty
 *
 * All functions are isolated to this file — the engine imports them; the
 * validator itself knows nothing about the game loop or I/O.
 */

import { TestCase } from './levels.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** The verdict for a single test case. */
export interface CaseResult {
  input: string;
  shouldMatch: boolean;
  /** Whether the regex actually matched the input string. */
  didMatch: boolean;
  /** Was the overall outcome correct (actual === expected)? */
  passed: boolean;
}

/** Aggregated output of running all test cases for one attempt. */
export interface TestResult {
  caseResults: CaseResult[];
  correct: number;
  falsePositives: number; // matched when it should NOT have
  falseNegatives: number; // did not match when it SHOULD have
  total: number;
  /** Fraction of test cases that passed, in [0, 1]. */
  accuracy: number;
}

/** The full score breakdown returned after one completed attempt. */
export interface ScoreBreakdown {
  /** Base score from accuracy (0–100). */
  accuracyScore: number;
  /** Bonus for completing quickly (0–30). Decreases by 1 per second. */
  timeBonus: number;
  /** Penalty for extra attempts beyond the first (-10 per extra attempt). */
  attemptPenalty: number;
  /** Final score (may be negative if many penalties). */
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * safeCompileRegex — attempts to compile a user-supplied pattern string.
 *
 * Returns the compiled RegExp if the pattern is valid, or `null` if it throws
 * a SyntaxError. The `g` flag is intentionally omitted to avoid the stateful
 * `.lastIndex` behaviour that would corrupt multi-call matching.
 *
 * @param pattern  The raw string typed by the player.
 * @returns        A compiled RegExp, or null on parse failure.
 */
export function safeCompileRegex(pattern: string): RegExp | null {
  try {
    // 'u' flag enables full Unicode mode and stricter syntax validation.
    return new RegExp(pattern, 'u');
  } catch {
    // SyntaxError thrown for malformed patterns (e.g. unclosed groups,
    // invalid escape sequences). Return null; the caller handles the UI.
    return null;
  }
}

/**
 * runTestCases — executes `regex` against every case and categorises results.
 *
 * @param regex  A compiled RegExp (from safeCompileRegex).
 * @param cases  The array of TestCase objects from the level definition.
 * @returns      A TestResult with per-case verdicts and aggregate counters.
 */
export function runTestCases(regex: RegExp, cases: TestCase[]): TestResult {
  const caseResults: CaseResult[] = cases.map((tc) => {
    // test() returns true if the regex matches anywhere in the string.
    // Anchors (^ / $) in the player's pattern are needed to match the full string.
    const didMatch = regex.test(tc.input);
    const passed = didMatch === tc.shouldMatch;
    return { input: tc.input, shouldMatch: tc.shouldMatch, didMatch, passed };
  });

  const correct = caseResults.filter((r) => r.passed).length;
  const falsePositives = caseResults.filter(
    (r) => r.didMatch && !r.shouldMatch,
  ).length;
  const falseNegatives = caseResults.filter(
    (r) => !r.didMatch && r.shouldMatch,
  ).length;
  const total = caseResults.length;

  return {
    caseResults,
    correct,
    falsePositives,
    falseNegatives,
    total,
    accuracy: total > 0 ? correct / total : 0,
  };
}

/**
 * computeScore — derives a numeric score from test results, time, and attempts.
 *
 * Formula:
 *   accuracyScore  = round(accuracy × 100)           — up to 100 points
 *   timeBonus      = max(0, 30 − floor(elapsed / 1000)) — up to +30 for speed
 *   attemptPenalty = (attempts − 1) × 10              — −10 per extra attempt
 *   total          = accuracyScore + timeBonus − attemptPenalty
 *
 * @param result    Aggregated test results from runTestCases.
 * @param timeMs    Milliseconds elapsed since the level started.
 * @param attempts  Number of submission attempts made (including this one).
 * @returns         A ScoreBreakdown with each component separated for display.
 */
export function computeScore(
  result: TestResult,
  timeMs: number,
  attempts: number,
): ScoreBreakdown {
  const accuracyScore = Math.round(result.accuracy * 100);
  const timeBonus = Math.max(0, 30 - Math.floor(timeMs / 1000));
  const attemptPenalty = Math.max(0, attempts - 1) * 10;
  const total = accuracyScore + timeBonus - attemptPenalty;

  return { accuracyScore, timeBonus, attemptPenalty, total };
}
