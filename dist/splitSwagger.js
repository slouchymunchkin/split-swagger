"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var chalk_1 = require("chalk");
var splitSwagger = function (swaggerFile, outputPath) {
    var resolvedSwaggerPath = path.resolve(swaggerFile);
    var resolvedOutputPath = path.resolve(outputPath);
    console.log(chalk_1.default.red("\n"));
    if (!fileExists(resolvedSwaggerPath)) {
        console.log(chalk_1.default.red("Cannot find swagger file " + resolvedSwaggerPath));
        return;
    }
    if (!directoryExists(resolvedOutputPath)) {
        console.log(chalk_1.default.red("Cannot find output directory " + resolvedOutputPath));
        return;
    }
    console.log(chalk_1.default.magentaBright("Swagger file path: " + resolvedSwaggerPath));
    console.log(chalk_1.default.magentaBright("Output path: " + resolvedOutputPath + " \n"));
    var swaggerJson = require(path.resolve(swaggerFile));
    var paths = swaggerJson.paths;
    var swaggerWOPathProp = {};
    Object.keys(swaggerJson).forEach(function (key) {
        if (key !== "paths") {
            swaggerWOPathProp[key] = swaggerJson[key];
        }
    });
    var groupedOperations = {};
    Object.keys(paths).forEach(function (operationKey) {
        var operationValue = paths[operationKey];
        Object.keys(operationValue).forEach(function (httpMethod) {
            var _a;
            var operationParamsValue = operationValue[httpMethod];
            var tag = operationParamsValue.tags[0];
            var operations = groupedOperations[tag];
            if (operations) {
                operations[operationKey] = operationValue;
                groupedOperations[tag] = operations;
            }
            else {
                groupedOperations[tag] = (_a = {}, _a[operationKey] = operationValue, _a);
            }
        });
    });
    var _loop_1 = function (key) {
        var splitSwaggerComplete = swaggerWOPathProp;
        if (groupedOperations.hasOwnProperty(key)) {
            var element = groupedOperations[key];
            splitSwaggerComplete["paths"] = element;
            fs.writeFile(outputPath + "/" + key + ".json", JSON.stringify(splitSwaggerComplete), function (err) {
                if (err) {
                    return console.log(chalk_1.default.red(err.message));
                }
                console.log(chalk_1.default.green("Swagger file " + key + ".json was successfully created at " + outputPath));
            });
        }
    };
    for (var key in groupedOperations) {
        _loop_1(key);
    }
};
var directoryExists = function (filePath) {
    try {
        return fs.statSync(filePath).isDirectory();
    }
    catch (err) {
        return false;
    }
};
var fileExists = function (filePath) {
    try {
        return fs.existsSync(filePath);
    }
    catch (err) {
        return false;
    }
};
exports.default = splitSwagger;
