import { spawn } from 'child_process';
import * as logger from 'utils/logger';
import { Spinner } from 'clui';

/**
* Runs the given the command in the specified user directory.
* @param dir user directory that the command should run in.
* @param cmd command that should run in the provided directory.
* @param msg status message that is displayed to the user.
*/
export function runCmd(dir: string, cmd: string, msg: string) {
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
