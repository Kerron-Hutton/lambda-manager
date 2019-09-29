"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const readline_1 = require("readline");
const aws_sdk_1 = require("aws-sdk");
listLambdas("us-east-2", 50)
    .catch(e => console.error(e));
function listLambdas(region, maxItems) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let marker = null;
            do {
                const params = {
                    MaxItems: maxItems,
                    Marker: marker
                };
                if (!marker)
                    delete params.Marker;
                const { NextMarker, Functions } = yield listFunctions(params, region);
                printTable(Functions);
                marker = NextMarker;
                if (marker) {
                    if (!(yield shouldContinue()))
                        break;
                }
            } while (marker);
            resolve();
        }
        catch (error) {
            logger_1.error("listLambdas", "An error occrred while listing lambdas.");
            reject(error);
        }
    }));
}
exports.listLambdas = listLambdas;
function listFunctions(params, region) {
    return new Promise((resolve, reject) => {
        const lam = new aws_sdk_1.Lambda({
            apiVersion: "2015-03-31",
            region,
            accessKeyId: "AKIAI73QEERMT5WII6LQ",
            secretAccessKey: "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"
        });
        lam.listFunctions(params, (error, result) => {
            if (error) {
                logger_1.error("listFunctions", "An error occrred while receiving lambdas from AWS.");
                reject(error);
                return;
            }
            resolve(result);
        });
    });
}
function printTable(functions) {
    const lambdas = {};
    for (const lambda of functions) {
        lambdas[lambda.FunctionName] = {
            "Region": lambda.FunctionArn.split(":")[3],
            "Runtime": lambda.Runtime,
            "Version": lambda.Version,
            "Code Size": lambda.CodeSize,
            "Memory Size": lambda.MemorySize
        };
    }
    console.table(lambdas);
}
function shouldContinue() {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const invalidOption = "You have entered an invalid option. Try again.";
            const question = "continue?";
            let shouldExit = true;
            do {
                const answer = yield getUserInput(question);
                if (answer) {
                    switch (answer.toLowerCase()) {
                        case "yes":
                            resolve(true);
                            break;
                        case "no":
                            resolve(false);
                            break;
                        default:
                            logger_1.info(invalidOption);
                            shouldExit = false;
                            break;
                    }
                }
                else {
                    logger_1.info(invalidOption);
                    shouldExit = false;
                }
            } while (shouldExit !== true);
        }
        catch (error) {
            logger_1.error("shouldContinue", "An error occrred while receiving user input.");
            reject(error);
        }
    }));
}
function getUserInput(question) {
    return new Promise((resolve, reject) => {
        try {
            const rl = readline_1.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(question, answer => {
                resolve(answer);
                rl.close();
            });
        }
        catch (error) {
            logger_1.error("shouldContinue", "An error occrred while receiving user input.");
            reject(error);
        }
    });
}
