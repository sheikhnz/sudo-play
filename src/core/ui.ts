/**
 * ui.ts — Terminal Rendering Helpers
 *
 * A thin abstraction over `chalk` that provides a consistent set of styled
 * output functions. Centralising styling here means:
 *  - Colour/icon conventions are defined in one place and easy to change.
 *  - Game plugins never import `chalk` directly — they use the helpers
 *    exposed on `GameContext.ui`, keeping plugins decoupled from the UI lib.
 *
 * Convention:
 *  - Banners  → magenta border + cyan text  (section headers)
 *  - Messages → plain white                 (general info)
 *  - Warnings → yellow + ⚠ prefix          (non-fatal issues)
 *  - Errors   → red + ✖ prefix             (failures)
 *  - Success  → green + ✔ prefix           (positive outcomes)
 */

import chalk from 'chalk';

/**
 * Renders a prominent banner with a decorative border.
 * Used for section titles like "Starting <game>…" or "sudo-play | XP: …".
 */
export function printBanner(text: string) {
  console.log(chalk.bold.magenta('\n=============================='));
  console.log(chalk.bold.cyan(`        ${text}`));
  console.log(chalk.bold.magenta('==============================\n'));
}

/** Prints a plain white informational message. */
export function printMessage(msg: string) {
  console.log(chalk.white(msg));
}

/** Prints a yellow warning message prefixed with the ⚠ symbol. */
export function printWarning(msg: string) {
  console.log(chalk.yellow(`⚠ ${msg}`));
}

/** Prints a red error message prefixed with the ✖ symbol. */
export function printError(msg: string) {
  console.log(chalk.red(`✖ ${msg}`));
}

/** Prints a green success message prefixed with the ✔ symbol. */
export function printSuccess(msg: string) {
  console.log(chalk.green(`✔ ${msg}`));
}

/**
 * Clears the terminal screen. Used before rendering a new game screen or
 * returning to the main menu to avoid stale output from the previous screen.
 */
export function clearInteractive() {
  console.clear();
}
