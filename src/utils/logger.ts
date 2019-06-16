import * as chalk from 'chalk';

export function info(message: string) {
  console.info(`\n${chalk.default.green(`${message}\n`)}`);
}

export function error(msgOne: string, msgTwo: string) {
  console.error(`\n${chalk.default.red(msgOne)}\n  ${chalk.default.white(msgTwo)}`);
}

export function debug(msgOne: string, msgTwo: string) {
  console.debug(`\n${chalk.default.green(msgOne)}\n  ${chalk.default.white(msgTwo)}\n`);
}
