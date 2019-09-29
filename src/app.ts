import { listLambdas } from "services/list-deployed-service";
import { deploy } from "services/deploy-service";
import { remove } from "services/remove-service";
import { build } from "services/build-service";

export function buildLambda(dir: string, service: string, app: string) {
  build(dir, service, app)
    .catch(error => console.error(error));
}

export function deployedLambdas(region: string, maxItems: number) {
  listLambdas(region, maxItems)
    .catch(error => console.error(error));
}

export function deployLambda(cmd: string) {
  deploy(cmd)
    .catch(error => console.error(error));
}

export function removeLambda(cmd: string) {
  remove(cmd)
    .catch(error => console.error(error));
}
