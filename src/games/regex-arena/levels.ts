/**
 * games/regex-arena/levels.ts — Level Definitions
 *
 * Each level presents a regex challenge with a description and a set of test
 * cases. Test cases are labelled with `shouldMatch` so the validator can
 * determine false positives and false negatives precisely.
 *
 * Adding a new level is a pure data change — no engine code needs to change.
 * Levels are exported as an ordered array; the engine plays them in sequence.
 */

/** A single input string paired with the expected match outcome. */
export interface TestCase {
  input: string;
  shouldMatch: boolean;
}

/** Difficulty label applied to each level for display and XP scaling. */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** The complete data contract for one Regex Arena level. */
export interface RegexLevel {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  hint: string;
  testCases: TestCase[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Level definitions
// ─────────────────────────────────────────────────────────────────────────────

export const levels: RegexLevel[] = [
  // ── Level 1: Email Address ─────────────────────────────────────────────────
  {
    id: 1,
    title: 'Email Address',
    description:
      'Match a valid email address. The local part may contain letters, digits, ' +
      'dots, hyphens, and plus signs. The domain must have at least one dot.',
    difficulty: 'easy',
    hint: 'Think about: local@domain.tld — each part has allowed characters.',
    testCases: [
      { input: 'user@example.com', shouldMatch: true },
      { input: 'first.last@mail.co.uk', shouldMatch: true },
      { input: 'user+tag@company.org', shouldMatch: true },
      { input: 'no-reply@sub.domain.io', shouldMatch: true },
      { input: 'name123@numbers99.net', shouldMatch: true },
      { input: '@nodomain.com', shouldMatch: false },
      { input: 'missingat.com', shouldMatch: false },
      { input: 'double@@at.com', shouldMatch: false },
      { input: 'user@.nodot', shouldMatch: false },
    ],
  },

  // ── Level 2: HTTP/HTTPS URL ────────────────────────────────────────────────
  {
    id: 2,
    title: 'HTTP/HTTPS URL',
    description:
      'Match a URL that starts with http:// or https://, followed by a valid ' +
      'hostname. Optional path, query string, and fragment are allowed.',
    difficulty: 'easy',
    hint: 'Start with https?://, then match the host, then optionally more.',
    testCases: [
      { input: 'https://example.com', shouldMatch: true },
      { input: 'http://example.com/path', shouldMatch: true },
      { input: 'https://sub.domain.co/page?q=1&r=2', shouldMatch: true },
      { input: 'http://localhost:3000/api', shouldMatch: true },
      { input: 'https://example.com/path#section', shouldMatch: true },
      { input: 'ftp://not-http.com', shouldMatch: false },
      { input: 'httsp://typo.com', shouldMatch: false },
      { input: 'example.com', shouldMatch: false },
      { input: '//missing-scheme.io', shouldMatch: false },
    ],
  },

  // ── Level 3: US Phone Number ───────────────────────────────────────────────
  {
    id: 3,
    title: 'US Phone Number',
    description:
      'Match a US phone number in any of these formats: (555) 123-4567, ' +
      '555-123-4567, 5551234567, or +1 555-123-4567. All must be 10 digits.',
    difficulty: 'medium',
    hint: 'Account for optional country code +1, area code in parens, spaces, and hyphens.',
    testCases: [
      { input: '(555) 123-4567', shouldMatch: true },
      { input: '555-123-4567', shouldMatch: true },
      { input: '5551234567', shouldMatch: true },
      { input: '+1 555-123-4567', shouldMatch: true },
      { input: '+1 (555) 123-4567', shouldMatch: true },
      { input: '555 123 4567', shouldMatch: true },
      { input: '12345', shouldMatch: false },
      { input: '(555) 123-456', shouldMatch: false },
      { input: 'abc-def-ghij', shouldMatch: false },
      { input: '+44 555-123-4567', shouldMatch: false },
    ],
  },

  // ── Level 4: Strong Password ───────────────────────────────────────────────
  {
    id: 4,
    title: 'Strong Password',
    description:
      'Match a strong password that is at least 8 characters long and contains ' +
      'at least one uppercase letter, one lowercase letter, one digit, and one ' +
      'special character from: !@#$%^&*',
    difficulty: 'medium',
    hint: 'Use lookaheads (?=...) to assert each requirement without consuming characters.',
    testCases: [
      { input: 'Passw0rd!', shouldMatch: true },
      { input: 'Str0ng@Pass', shouldMatch: true },
      { input: 'C0mplex#99', shouldMatch: true },
      { input: 'aB3!wxyz', shouldMatch: true },
      { input: 'MyP@ssw0rd123', shouldMatch: true },
      { input: 'password', shouldMatch: false },
      { input: 'PASSWORD1!', shouldMatch: false },
      { input: 'Pass1234', shouldMatch: false },
      { input: 'Pa!1', shouldMatch: false },
      { input: 'alllower1!', shouldMatch: false },
    ],
  },

  // ── Level 5: IPv4 Address ──────────────────────────────────────────────────
  {
    id: 5,
    title: 'IPv4 Address',
    description:
      'Match a valid IPv4 address. Each of the four octets must be a number ' +
      'between 0 and 255 inclusive, separated by dots. No leading zeros allowed.',
    difficulty: 'hard',
    hint: 'Each octet: 0-9, 10-99, 100-199, 200-249, or 250-255. Watch for leading zeros!',
    testCases: [
      { input: '192.168.1.1', shouldMatch: true },
      { input: '0.0.0.0', shouldMatch: true },
      { input: '255.255.255.255', shouldMatch: true },
      { input: '10.0.0.1', shouldMatch: true },
      { input: '172.16.254.1', shouldMatch: true },
      { input: '256.0.0.1', shouldMatch: false },
      { input: '192.168.1', shouldMatch: false },
      { input: '192.168.01.1', shouldMatch: false },
      { input: '192.168.1.1.1', shouldMatch: false },
      { input: 'abc.def.ghi.jkl', shouldMatch: false },
    ],
  },
];
