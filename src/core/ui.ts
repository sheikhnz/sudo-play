import chalk from 'chalk';

export function printBanner(text: string) {
  console.log(chalk.bold.magenta('\n=============================='));
  console.log(chalk.bold.cyan(`        ${text}`));
  console.log(chalk.bold.magenta('==============================\n'));
}

export function printMessage(msg: string) {
  console.log(chalk.white(msg));
}

export function printWarning(msg: string) {
  console.log(chalk.yellow(`⚠ ${msg}`));
}

export function printError(msg: string) {
  console.log(chalk.red(`✖ ${msg}`));
}

export function printSuccess(msg: string) {
  console.log(chalk.green(`✔ ${msg}`));
}

export function clearInteractive() {
  console.clear();
}
