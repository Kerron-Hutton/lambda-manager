import { error as onError } from "utils/logger";
import { resolve as resolvePath } from "path";
import { runCmd } from "utils/cmd-handler";
import { displayLogo } from "utils/logo";

/**
 * Removes lambda and all it's services from aws.
 * @param cmd lambda remove command that should run on user's computer.
 */
export function remove(cmd: string) {
  return new Promise(async (resolve, reject) => {
    try {
      displayLogo();
      await runCmd(resolvePath(process.cwd()), cmd, 'removing your lambda from aws... ');
      resolve();
    } catch (error) {
      onError(`removeLambda`, `Error occurred while removing lambda`);
      reject(error);
    }
  });
}
