#!/usr/bin/env node
import { buildLambda, deployLambda, removeLambda } from './app';
import { join, resolve } from 'path';
import { readFileSync } from 'fs';
import program from 'commander';

const packageFile = JSON.parse(readFileSync(join(__dirname, '../package.json')).toString());

/**
 * Commander default setup.
 */
program
  .version(packageFile.version, '-v, --version')
  .description('AWS lambda automation cli.');

/**
 * Provides the user with the option to create a project.
 */
program
  .command('create')
  .option('-a, --application <arg>', 'project parent application name, eg lozzby')
  .option('-n, --name <arg>', 'project service name.')
  .option('-p, --path <arg>', 'directory new lambda project will be created in.')
  .description('creates new aws lambda project.')
  .action(cmd => {
    let dir = process.cwd();
    let app = 'lozzby';
    let service = 'lambda-manager-service';

    if (isStringType(cmd.application) && cmd.application !== '')
      app = cmd.application;

    if (isStringType(cmd.path) && cmd.path !== '')
      dir += `/${cmd.path}`;

    if (isStringType(cmd.name) && cmd.name !== '')
      service = cmd.name;

    buildLambda(resolve(dir), service, app);
  });

/**
* Provides the user with the option to remove a project from aws.
*/
program
  .command('deployed-lambdas')
  .command('list')
  .description('removes lambda from aws and all it\'s resources.')
  .action(() => removeLambda('sls remove'));

/**
 * Provides the user with the option to deploy a project to aws.
 */
program
  .command('deploy')
  .option('-s, --stage <arg>', 'stage the lambda should be deployed, eg. prod|dev|test etc.')
  .option('-r, --region <arg>', 'region the lambda should be deployed, eg. eu-west-2.')
  .option('-f, --function <arg>', 'lambda function name. Deploys a single function.')
  .option('--force', 'forces a deployment to take place.')
  .option('-u, --update', 'updates function configuration, e.g. Timeout or Memory Size without deploying code.')
  .description('deploys lambda in current working directory.')
  .action(cmd => {
    let command = 'npm run lint && serverless deploy';

    if (cmd.update !== undefined && cmd.update)
      command += ` function`;

    if (isStringType(cmd.function) && cmd.function !== '')
      command += ` --function ${cmd.function}`;
    else
      if (cmd.update !== undefined && cmd.update)
        command += ' --function main';

    if (isStringType(cmd.stage) && cmd.stage !== '')
      command += ` --stage ${cmd.stage}`;

    if (isStringType(cmd.region) && cmd.region !== '')
      command += ` --region ${cmd.region}`;

    if (cmd.force !== undefined && cmd.force)
      command += ` --force`;

    deployLambda(command);
  });

/**
 * Provides the user with the option to remove a project from aws.
 */
program
  .command('remove')
  .description('removes lambda from aws and all it\'s resources.')
  .action(() => removeLambda('sls remove'));

/**
 * Validates if the given value is a string.
 * @param {any} value value returned from the user command line application.
 */
function isStringType(value) {
  return (typeof value === 'string' || value instanceof String);
}

// allow commander to parse `process.argv`
program.parse(process.argv);
