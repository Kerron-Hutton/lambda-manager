import { join, resolve as resolvePath } from 'path';
import { runCmd } from 'utils/cmd-handler';
import { displayLogo } from 'utils/logo';
import * as logger from 'utils/logger';
import * as fs from 'fs';

/**
 * Builds a lambda project in specified directory with giving name.
 * @param dir user directory the project is to be built.
 * @param service name used the represent the lambda service in aws.
 * @param app project application name.
 */
export function build(dir: string, service: string, app: string) {
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

      await runCmd(dir, 'npm --silent install', 'installing node modules... ');
      logger.info('Your lambda was successfully build.');
      resolve();
    } catch (error) {
      logger.error(`buildLambda`, `Error occurred while creating lambda`);
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
