#!/usr/bin/env node

import * as ts from "typescript";
import fs from "fs";
import path from "path";
import { program } from "commander";
import camelcase from './camelcase';

import { validatePath } from "./path-validator";
import { ClassTemplate } from "./class-template";

program
  .requiredOption("-s, --schema <path>")
  .requiredOption("-o, --output <path> ")
  .requiredOption("-i, --import <name> ")
  .option("-dts, --dts-output <path> ")
  .parse(process.argv);

const terminateInvalidPath = (paramName, pathString) => {
  if (!pathString) {
    return;
  }

  const { isValid, name, ext } = validatePath(pathString);
  if (!isValid) {
    console.error(`${paramName} must be a path of file, not a directory.`);
    process.exit(1);
  }
};

terminateInvalidPath("--schema", program.schema);
terminateInvalidPath("--output", program.output);
terminateInvalidPath("--dts-output", program.dtsOutput);

const schemaPath = path.resolve(process.cwd(), program.schema);
const output = path.resolve(process.cwd(), program.output);
const { schema } = require(schemaPath);
const importName = camelcase(program.import);

const classes = [
  `import * as ${importName} from './${program.import}.dart';`,
  `export { ${importName} };`,
  ...Object.keys(schema).map((classItem) => {
    const item = new ClassTemplate(classItem, schema[classItem], importName);
    schema[classItem].methodsList.forEach((element) => {
      item.addMethod(element);
    });
    return item.toString();
  }),
].join("\n\n");

const generateSourceCode = (codeString) => {
  const result = ts.transpileModule(codeString, {
    compilerOptions: { module: ts.ModuleKind.None },
  });
  fs.writeFileSync(output, result.outputText, "utf-8");
};

const generateDTS = (codeString) => {
  const dtsOutput = path.resolve(process.cwd(), program.dtsOutput);
  const options = {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
  };

  const compilerHost = ts.createCompilerHost(options);
  const file = { fileName: "no_extension", content: codeString };

  compilerHost.getSourceFile = (fileName) => {
    file.sourceFile = ts.createSourceFile(
      fileName,
      file.content,
      ts.ScriptTarget.ES2015,
      true
    );
    return file.sourceFile;
  };
  const prog = ts.createProgram(["test.ts"], options, compilerHost);
  prog.emit(undefined, (_, data) => {
    fs.writeFileSync(dtsOutput, data, "utf-8");
  });
};

program.dtsOutput && generateDTS(classes);
generateSourceCode(classes);
