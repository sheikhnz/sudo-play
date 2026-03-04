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

  // ── Level 6: HTML Hex Colour ───────────────────────────────────────────────
  {
    id: 6,
    title: 'HTML Hex Colour',
    description:
      'Match an HTML hex colour code. Must start with #, followed by exactly ' +
      '3 or 6 hexadecimal characters (0-9, a-f, A-F). Nothing else allowed.',
    difficulty: 'easy',
    hint: 'Use # then {3} or {6} hex digits. Use alternation | to handle both lengths.',
    testCases: [
      { input: '#fff', shouldMatch: true },
      { input: '#000', shouldMatch: true },
      { input: '#FF0000', shouldMatch: true },
      { input: '#a3c2f0', shouldMatch: true },
      { input: '#1A2B3C', shouldMatch: true },
      { input: '#FFFFFF', shouldMatch: true },
      { input: 'FFF', shouldMatch: false },
      { input: '#gg0000', shouldMatch: false },
      { input: '#1234', shouldMatch: false },
      { input: '#GGGGGG', shouldMatch: false },
      { input: '#12345', shouldMatch: false },
    ],
  },

  // ── Level 7: ISO 8601 Date ─────────────────────────────────────────────────
  {
    id: 7,
    title: 'ISO 8601 Date',
    description:
      'Match a calendar date in ISO 8601 format: YYYY-MM-DD. The year must be ' +
      '4 digits, month 01–12, and day 01–31. Validate ranges with your pattern.',
    difficulty: 'medium',
    hint: 'Month: 0[1-9]|1[0-2]. Day: 0[1-9]|[12]\\d|3[01]. Year: any 4 digits.',
    testCases: [
      { input: '2024-01-01', shouldMatch: true },
      { input: '1999-12-31', shouldMatch: true },
      { input: '2000-06-15', shouldMatch: true },
      { input: '2024-02-29', shouldMatch: true },
      { input: '1900-01-01', shouldMatch: true },
      { input: '2024-13-01', shouldMatch: false },
      { input: '2024-00-01', shouldMatch: false },
      { input: '2024-01-32', shouldMatch: false },
      { input: '24-01-01', shouldMatch: false },
      { input: '2024/01/01', shouldMatch: false },
      { input: '2024-1-1', shouldMatch: false },
    ],
  },

  // ── Level 8: Credit Card Number ────────────────────────────────────────────
  {
    id: 8,
    title: 'Credit Card Number',
    description:
      'Match a Visa or Mastercard number. Visa starts with 4; Mastercard ' +
      'starts with 51–55 or 2221–2720. Both are 16 digits, optionally grouped ' +
      'in fours separated by spaces or hyphens.',
    difficulty: 'medium',
    hint: 'Match the leading digits for Visa (4) and Mastercard (5[1-5]|2[2-7]\\d\\d), then 12–15 more.',
    testCases: [
      { input: '4111111111111111', shouldMatch: true },
      { input: '4111 1111 1111 1111', shouldMatch: true },
      { input: '4111-1111-1111-1111', shouldMatch: true },
      { input: '5500005555555559', shouldMatch: true },
      { input: '5500 0055 5555 5559', shouldMatch: true },
      { input: '2221000000000009', shouldMatch: true },
      { input: '1234567890123456', shouldMatch: false },
      { input: '6011111111111117', shouldMatch: false },
      { input: '411111111111', shouldMatch: false },
      { input: '4111 1111 1111', shouldMatch: false },
    ],
  },

  // ── Level 9: Semantic Version ──────────────────────────────────────────────
  {
    id: 9,
    title: 'Semantic Version (semver)',
    description:
      'Match a semantic version string: MAJOR.MINOR.PATCH, optionally followed ' +
      'by a pre-release tag (-alpha.1, -beta.2, -rc.3) and/or a build metadata ' +
      'suffix (+build.123). No leading zeros in numeric parts.',
    difficulty: 'hard',
    hint: 'Core: \\d+\\.\\d+\\.\\d+. Pre-release: -[a-zA-Z0-9.]+. Build: \\+[a-zA-Z0-9.]+.',
    testCases: [
      { input: '1.0.0', shouldMatch: true },
      { input: '0.1.0', shouldMatch: true },
      { input: '10.20.30', shouldMatch: true },
      { input: '1.0.0-alpha', shouldMatch: true },
      { input: '1.0.0-alpha.1', shouldMatch: true },
      { input: '1.0.0-beta.2+build.123', shouldMatch: true },
      { input: '1.0.0+build.999', shouldMatch: true },
      { input: '1.0', shouldMatch: false },
      { input: '1', shouldMatch: false },
      { input: '01.0.0', shouldMatch: false },
      { input: 'v1.0.0', shouldMatch: false },
      { input: '1.0.0.0', shouldMatch: false },
    ],
  },

  // ── Level 10: JWT Token ────────────────────────────────────────────────────
  {
    id: 10,
    title: 'JWT Token',
    description:
      'Match a JSON Web Token (JWT). A JWT consists of exactly three Base64URL- ' +
      'encoded segments separated by dots: header.payload.signature. Each ' +
      'segment uses A-Z, a-z, 0-9, hyphen, and underscore — no padding (=).',
    difficulty: 'hard',
    hint: 'Base64URL chars are [A-Za-z0-9_-]+. Three segments joined by literal dots.',
    testCases: [
      {
        input:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        shouldMatch: true,
      },
      {
        input: 'aGVhZGVy.cGF5bG9hZA.c2lnbmF0dXJl',
        shouldMatch: true,
      },
      {
        input: 'abc123_-ABC.def456_-DEF.ghi789_-GHI',
        shouldMatch: true,
      },
      {
        input: 'header.payload',
        shouldMatch: false,
      },
      {
        input: 'header.payload.signature.extra',
        shouldMatch: false,
      },
      {
        input: 'he@der.payload.signature',
        shouldMatch: false,
      },
      {
        input: 'header.pay load.signature',
        shouldMatch: false,
      },
      {
        input: '',
        shouldMatch: false,
      },
    ],
  },


];
