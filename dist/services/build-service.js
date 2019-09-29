"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const cmd_handler_1 = require("utils/cmd-handler");
const logo_1 = require("utils/logo");
const logger = __importStar(require("utils/logger"));
const fs = __importStar(require("fs"));
/**
 * Builds a lambda project in specified directory with giving name.
 * @param dir user directory the project is to be built.
 * @param service name used the represent the lambda service in aws.
 * @param app project application name.
 */
function build(dir, service, app) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const srcPackagePath = path_1.join(__dirname, './templates/configs/package.json');
            const srcServerlessPath = path_1.join(__dirname, './templates/serverless.yml');
            const destServerlessPath = path_1.join(dir, './serverless.yml');
            const destPackagePath = path_1.join(dir, './package.json');
            logo_1.displayLogo();
            fs.mkdirSync(dir);
            fs.mkdirSync(path_1.join(dir, './src'));
            yield Promise.all([
                copyFile(path_1.join(__dirname, './templates/src/index.ts'), path_1.join(dir, './src/index.ts')),
                copyFolder(path_1.join(__dirname, './templates/resources'), path_1.join(dir, '/resources')),
                copyFolder(path_1.join(__dirname, './templates/configs'), path_1.resolve(dir))
            ]);
            yield Promise.all([
                writeServiceNameToFile(srcServerlessPath, destServerlessPath, service, app),
                writeServiceNameToFile(srcPackagePath, destPackagePath, service, null)
            ]);
            yield cmd_handler_1.runCmd(dir, 'npm --silent install', 'installing node modules... ');
            logger.info('Your lambda was successfully build.');
            resolve();
        }
        catch (error) {
            logger.error(`buildLambda`, `Error occurred while creating lambda`);
            reject(error);
        }
    }));
}
exports.build = build;
/**
 * Copies a files in folder from directory to another
 * @param src source folder that is to be copied
 * @param dest destination directory that the files is to be copied to
 */
function copyFolder(src, dest) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const jobs = [];
            const files = fs.readdirSync(src);
            if (!fs.existsSync(dest))
                fs.mkdirSync(dest);
            for (const file of files)
                jobs.push(copyFile(path_1.join(src, file), path_1.join(dest, file)));
            yield Promise.all(jobs);
            resolve();
        }
        catch (error) {
            logger.error(`copyFolder`, `Error occurred while copying folder contents`);
            reject(error);
        }
    }));
}
/**
 * Copies a file from directory to another
 * @param src source file path that is to be copied
 * @param dest destination path that the file is to be copied to
 */
function copyFile(src, dest) {
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
function writeServiceNameToFile(srcPath, destPath, service, app) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = fs.readFileSync(srcPath);
            let result = data.toString().replace(/{service-name}/g, service);
            if (app !== null)
                result = result.replace(/{application-name}/g, app.toLowerCase());
            fs.writeFileSync(destPath, result, 'utf8');
            resolve();
        }
        catch (error) {
            logger.error(`writeServiceNameToFile`, `Error occurred while while writing service name to file`);
            reject(error);
        }
    }));
}
