#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var splitSwagger_1 = require("./splitSwagger");
program.version("0.0.1").description("Description");
program
    .command("start <swaggerFile> <outputPath> [logFile] [consoleOutput]")
    .alias("s")
    .description("Starts process to split swagger file")
    .action(function (swaggerFile, outputPath) {
    splitSwagger_1.default(swaggerFile, outputPath);
});
program.parse(process.argv);
