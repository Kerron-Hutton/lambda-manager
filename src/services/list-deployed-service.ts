import { error as onError, info } from "../utils/logger";
import { createInterface } from "readline";
import { Lambda } from "aws-sdk";
import {
  ListFunctionsRequest,
  FunctionConfiguration
} from "aws-sdk/clients/lambda";

listLambdas("us-east-2", 50)
  .catch(e => console.error(e));

export function listLambdas(region: string, maxItems: number) {
  return new Promise(async (resolve, reject) => {
    try {
      let marker: string = null;

      do {
        const params: ListFunctionsRequest = {
          MaxItems: maxItems,
          Marker: marker
        };

        if (!marker)
          delete params.Marker;

        const { NextMarker, Functions } = await listFunctions(params, region);
        printTable(Functions);

        marker = NextMarker;
        if (marker) {
          if (!await shouldContinue())
            break;
        }
      } while (marker);
      resolve();
    } catch (error) {
      onError("listLambdas", "An error occrred while listing lambdas.");
      reject(error);
    }
  });
}

function listFunctions(params: ListFunctionsRequest, region: string):
  Promise<Lambda.ListFunctionsResponse> {
  return new Promise((resolve, reject) => {
    const lam = new Lambda({
      apiVersion: "2015-03-31",
      region,
      accessKeyId: "AKIAI73QEERMT5WII6LQ",
      secretAccessKey: "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"
    });

    lam.listFunctions(params, (error, result) => {
      if (error) {
        onError("listFunctions", "An error occrred while receiving lambdas from AWS.");
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

function printTable(functions: FunctionConfiguration[]) {
  const lambdas = {};
  for (const lambda of functions) {
    lambdas[lambda.FunctionName] = {
      "Region": lambda.FunctionArn.split(":")[3],
      "Runtime": lambda.Runtime,
      "Version": lambda.Version,
      "Code Size": lambda.CodeSize,
      "Memory Size": lambda.MemorySize
    }
  }
  console.table(lambdas);
}

function shouldContinue(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const invalidOption = "You have entered an invalid option. Try again.";
      const question = "continue?";
      let shouldExit = true;

      do {
        const answer = await getUserInput(question);

        if (answer) {
          switch (answer.toLowerCase()) {
            case "yes":
              resolve(true);
              break;
            case "no":
              resolve(false);
              break;
            default:
              info(invalidOption);
              shouldExit = false;
              break;
          }
        } else {+
          info(invalidOption);
          shouldExit = false;
        }
      } while (shouldExit !== true);
    } catch (error) {
      onError("shouldContinue", "An error occrred while receiving user input.");
      reject(error);
    }
  });
}

function getUserInput(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(question, answer => {
        resolve(answer);
        rl.close();
      });
    } catch (error) {
      onError("shouldContinue", "An error occrred while receiving user input.");
      reject(error);
    }
  });
}
