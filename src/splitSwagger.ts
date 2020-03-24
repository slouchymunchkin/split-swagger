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
  const { paths: _, ...swaggerWOPathProp } = swaggerJson;

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

  /** Create a map to group operations per tag */
  let groupedOperations = new Map<string, unknown>();

  Object.keys(paths).forEach(operationKey => {
    const operationValue = paths[operationKey];
    Object.keys(operationValue).forEach(httpMethod => {
      const operationParamsValue = operationValue[httpMethod];
      const tag = operationParamsValue.tags[0];

      groupedOperations.set(tag, { ...(groupedOperations.get(tag) || {}), [operationKey]: operationValue });
    });
  });

  /** Adds the remaining swagger props and creates a file for each tag operations */
  groupedOperations.forEach((element, key) => {
    // Break the object reference, so that we may mutate with impunity
    const swaggerOutput = JSON.parse(JSON.stringify(swaggerWOPathProp));
    swaggerOutput.tags = swaggerOutput.tags.filter((tag: { name: string }) => tag.name === key);
    swaggerOutput["paths"] = element;
    fs.writeFile(`${outputPath}/${key}.json`, JSON.stringify(swaggerOutput, null, 2), function(err: NodeJS.ErrnoException) {
      if (err) {
        return console.log(chalk.red(err.message));
      }
      console.log(chalk.green(`Swagger file ${key}.json was successfully created at ${outputPath}`));
    });
  });
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
