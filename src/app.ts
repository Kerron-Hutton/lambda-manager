import { join, resolve as resolvePath } from 'path';
import { spawn } from 'child_process';
import * as logger from './utils/logger';
import * as figlet from 'figlet';
import { Spinner } from 'clui';
import * as chalk from 'chalk';
import * as fs from 'fs';

/**
 * Builds a lambda project in specified directory with giving name.
 * @param dir user directory the project is to be built.
 * @param service name used the represent the lambda service in aws.
 * @param app project application name.
 */
export function buildLambda(dir: string, service: string, app: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const srcPackagePath = join(__dirname, './templates/configs/package.json');
      const srcServerlessPath = join(__dirname, './templates/serverless.yml');
      const destServerlessPath = join(dir, './serverless.yml');
      const destPackagePath = join(dir, './package.json');

      displayLogo();
      fs.mkdirSync(dir);
      fs.mkdirSync(join(dir, './src'));

      await Promise.all([
        copyFile(
          join(__dirname, './templates/src/index.ts'),
          join(dir, './src/index.ts')
        ),
        copyFolder(
          join(__dirname, './templates/resources'),
          join(dir, '/resources')
        ),
        copyFolder(
          join(__dirname, './templates/configs'),
          resolvePath(dir)
        )
      ]);

      await Promise.all([
        writeServiceNameToFile(srcServerlessPath, destServerlessPath, service, app),
        writeServiceNameToFile(srcPackagePath, destPackagePath, service, null)
      ]);

      await runCmdHandler(dir, 'npm --silent install', 'installing node modules... ');
      logger.info('Your lambda was successfully build.');
      resolve();
    } catch (error) {
      logger.error(`buildLambda`, `Error occurred while creating lambda`);
      reject(error);
    }
  });
}

/**
 * Deploys lambda and all it's services to aws.
 * @param cmd lambda deploy command that should run on user's computer.
 */
export function deployLambda(cmd: string) {
  return new Promise(async (resolve, reject) => {
    try {
      displayLogo();
      await runCmdHandler(resolvePath(process.cwd()), cmd, 'deploying your lambda to aws... ');
      resolve();
    } catch (error) {
      logger.error(`deployLambda`, `Error occurred while deploying lambda`);
      reject(error);
    }
  });
}

/**
 * Removes lambda and all it's services from aws.
 * @param cmd lambda remove command that should run on user's computer.
 */
export function removeLambda(cmd: string) {
  return new Promise(async (resolve, reject) => {
    try {
      displayLogo();
      await runCmdHandler(resolvePath(process.cwd()), cmd, 'removing your lambda from aws... ');
      resolve();
    } catch (error) {
      logger.error(`removeLambda`, `Error occurred while removing lambda`);
      reject(error);
    }
  });
}

/**
 * Copies a files in folder from directory to another
 * @param src source folder that is to be copied
 * @param dest destination directory that the files is to be copied to
 */
function copyFolder(src: string, dest: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const jobs: Promise<any>[] = [];
      const files = fs.readdirSync(src);

      if (!fs.existsSync(dest))
        fs.mkdirSync(dest);

      for (const file of files)
        jobs.push(
          copyFile(join(src, file), join(dest, file))
        );
      await Promise.all(jobs);
      resolve();
    } catch (error) {
      logger.error(`copyFolder`, `Error occurred while copying folder contents`);
      reject(error);
    }
  });
}

/**
 * Copies a file from directory to another
 * @param src source file path that is to be copied
 * @param dest destination path that the file is to be copied to
 */
function copyFile(src: string, dest: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, error => {
      if (error) {
        logger.error(`copyFile`, `Error occurred while copying file`);
        reject(error);
        return;
      }
      resolve();
    });
  });
}

/**
 * Reads file into memory then replaces any text that matches the regular expression
 * with the provided service name. 
 * @param srcPath source path that the file will be read from.
 * @param destPath destination path that the file should be written in.
 * @param service name used the represent the lambda service in aws.
 * @param app project application name.
 */
function writeServiceNameToFile(srcPath: string, destPath: string, service: string, app: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = fs.readFileSync(srcPath);
      let result = data.toString().replace(/{service-name}/g, service);

      if (app !== null)
        result = result.replace(/{application-name}/g, app.toLowerCase());

      fs.writeFileSync(destPath, result, 'utf8');
      resolve();
    } catch (error) {
      logger.error(`writeServiceNameToFile`, `Error occurred while while writing service name to file`);
      reject(error);
    }
  });
}

/**
 * Runs the given the command in the specified user directory.
 * @param dir user directory that the command should run in.
 * @param cmd command that should run in the provided directory.
 * @param msg status message that is displayed to the user.
 */
function runCmdHandler(dir: string, cmd: string, msg: string) {
  return new Promise((resolve, reject) => {
    try {
      const loading = new Spinner(msg, ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']);
      const process = spawnProcess(dir, cmd);
      let count = -1;

      process.stdout.setEncoding('utf8');
      loading.start();

      process.stdout.on('data', data => {
        const regex = /^[.]+$/g;
        // skips output result that only contains the character '.'
        if (!regex.test(data.trim()) && data.trim() !== '') {
          count++;
          if (count === 0)
            logger.info('\n');
          logger.debug(`Output`, data.trim());
        }
      });

      process.stderr.on('data', (data) => {
        count++;
        if (count === 0)
          logger.info('\n');
        logger.error(`runCmdHandler`, data);
      });

      process.on('exit', code => {
        count++;
        if (count === 0)
          logger.info('\n');
        logger.debug('finished with exist code', `${code.toString()}`);
        loading.stop();
        resolve();
      });
    } catch (error) {
      reject(error);
      logger.error(`runCmdHandler`, `Error occurred while running ${cmd}`);
    }
  });
}

/**
 * Checks which platform the program is running on then request to 
 * run the given command on that platform.
 * @param dir user directory that the command should run in.
 * @param cmd command that should run in the provided directory.
 */
export function spawnProcess(dir: string, cmd: string) {
  return (process.platform === 'win32')
    ? spawnWindowsProcess(dir, cmd)
    : spawnLinuxProcess(dir, cmd);
}

/**
 * Spawns a windows process to run the given command in the specified directory.
 * @param dir user directory that the command should run in.
 * @param cmd command that should run in the provided directory.
 */
function spawnWindowsProcess(dir: string, cmd: string) {
  return spawn("cmd.exe", ["/c", cmd], { cwd: dir });
}

/**
 * Spawns a linux process to run the given command in the specified directory.
 * @param dir user directory that the command should run in.
 * @param cmd command that should run in the provided directory.
 */
function spawnLinuxProcess(dir: string, cmd: string) {
  const parts = cmd.split(/\s+/);
  return spawn(parts[0], parts.slice(1), { cwd: dir });
}

/**
 * Displays the branding logo on the screen.
 */
function displayLogo() {
  console.clear();
  console.log(
    chalk.default.blueBright(
      figlet.textSync('Lambda Manager', { horizontalLayout: 'default' })
    )
  );
}
