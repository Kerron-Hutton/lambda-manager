import { error as onError } from "utils/logger";
import { resolve as resolvePath } from "path";
import { runCmd } from "utils/cmd-handler";
import { displayLogo } from "utils/logo";

/**
 * Deploys lambda and all it's services to aws.
 * @param cmd lambda deploy command that should run on user's computer.
 */
export function deploy(cmd: string) {
  return new Promise(async (resolve, reject) => {
    try {
      displayLogo();
      await runCmd(
        resolvePath(process.cwd()),
        cmd,
        "deploying your lambda to aws... "
      );
      resolve();
    } catch (error) {
      onError(`deploy`, `Error occurred while deploying lambda`);
      reject(error);
    }
  });
}
