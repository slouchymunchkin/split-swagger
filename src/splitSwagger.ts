// const fs = require("fs");
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

// const pathToFile: string = "../swagger_sample/swagger.json";
// const swaggerJson = require(pathToFile);
// const paths = swaggerJson.paths;
// const jsonString = fs.readFileSync(jsonPath, "utf8");

/**
 * !TODO Console logging with flag to enable/disable
 * !TODO Type interface for swagger file
 * !TODO Log each operation wrt contains tag/doesnt contain tag
 * !TODO Print log file with details, nrOf operations per group
 */

const splitSwagger = (swaggerFile: string, outputPath: string) => {
  const resolvedSwaggerPath = path.resolve(swaggerFile);
  const resolvedOutputPath = path.resolve(outputPath);

  console.log(chalk.red(`\n`));
  if (!fileExists(resolvedSwaggerPath)) {
    console.log(chalk.red(`Cannot find swagger file ${resolvedSwaggerPath}`));
    return;
  }
  if (!directoryExists(resolvedOutputPath)) {
    console.log(chalk.red(`Cannot find output directory ${resolvedOutputPath}`));
    return;
  }
  console.log(chalk.magentaBright(`Swagger file path: ${resolvedSwaggerPath}`));
  console.log(chalk.magentaBright(`Output path: ${resolvedOutputPath} \n`));
  const swaggerJson = require(path.resolve(swaggerFile));

  const paths = swaggerJson.paths;

  /** Creates a copy of the swagger json tree without the path prop */
  let swaggerWOPathProp: any = {};
  Object.keys(swaggerJson).forEach(key => {
    if (key !== "paths") {
      swaggerWOPathProp[key] = swaggerJson[key];
    }
  });

  /**
   * Goes through the Path prop tree containing operations,
   * the operations will be grouped by the Tag prop value.
   * Creates a new object with the structure { tag: { operations } }
   * The structure to the Tag prop is as following
   * {
   *  "uniqueOperationName":    {
   *     "httpMethod": {
   *       "tags": ["value"],
   *       ...
   *     }
   *  }
   * }
   */
  let groupedOperations: any = {};
  Object.keys(paths).forEach(operationKey => {
    const operationValue = paths[operationKey];
    Object.keys(operationValue).forEach(httpMethod => {
      const operationParamsValue = operationValue[httpMethod];
      const tag = operationParamsValue.tags[0];

      let operations: any = groupedOperations[tag];
      if (operations) {
        operations[operationKey] = operationValue;
        groupedOperations[tag] = operations;
      } else {
        /**
         * Using [] here, called ComputedPropertyName syntax because we want the value of operationNameKey to be the property name
         * Otherwise the property name will be the variables name
         */
        groupedOperations[tag] = { [operationKey]: operationValue };
      }
    });
  });

  /** Adds the remaining swagger props and creates a file for each tag operations */
  for (const key in groupedOperations) {
    let splitSwaggerComplete: any = swaggerWOPathProp;
    if (groupedOperations.hasOwnProperty(key)) {
      const element = groupedOperations[key];
      splitSwaggerComplete["paths"] = element;
      fs.writeFile(`${outputPath}/${key}.json`, JSON.stringify(splitSwaggerComplete), function(err: NodeJS.ErrnoException) {
        if (err) {
          return console.log(chalk.red(err.message));
        }
        console.log(chalk.green(`Swagger file ${key}.json was successfully created at ${outputPath}`));
      });
    }
  }
};

const directoryExists = (filePath: string) => {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (err) {
    return false;
  }
};

const fileExists = (filePath: string) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

export default splitSwagger;
