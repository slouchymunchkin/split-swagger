#!/usr/bin/env node

const program = require("commander");
import splitSwagger from "./splitSwagger";

program.version("0.0.1").description("Description");

program
  .command("start <swaggerFile> <outputPath> [logFile] [consoleOutput]")
  .alias("s")
  .description("Starts process to split swagger file")
  .action((swaggerFile: string, outputPath: string) => {
    splitSwagger(swaggerFile, outputPath);
  });

program.parse(process.argv);
