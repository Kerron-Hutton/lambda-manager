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
const logger_1 = require("utils/logger");
const path_1 = require("path");
const cmd_handler_1 = require("utils/cmd-handler");
const logo_1 = require("utils/logo");
/**
 * Deploys lambda and all it's services to aws.
 * @param cmd lambda deploy command that should run on user's computer.
 */
function deploy(cmd) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            logo_1.displayLogo();
            yield cmd_handler_1.runCmd(path_1.resolve(process.cwd()), cmd, "deploying your lambda to aws... ");
            resolve();
        }
        catch (error) {
            logger_1.error(`deploy`, `Error occurred while deploying lambda`);
            reject(error);
        }
    }));
}
exports.deploy = deploy;
