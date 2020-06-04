#!/usr/bin/env node
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var ts = _interopRequireWildcard(require("typescript"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _commander = require("commander");

var _pathValidator = require("./path-validator");

var _classTemplate = require("./class-template");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

_commander.program.requiredOption("-s, --schema <path>").requiredOption("-o, --output <path> ").option("-dts, --dts-output <path> ").option("-i, --import <name> ").parse(process.argv);

var terminateInvalidPath = function terminateInvalidPath(paramName, pathString) {
  if (!pathString) {
    return;
  }

  var _validatePath = (0, _pathValidator.validatePath)(pathString),
      isValid = _validatePath.isValid,
      name = _validatePath.name,
      ext = _validatePath.ext;

  if (!isValid) {
    console.error("".concat(paramName, " must be a path of file, not a directory."));
    process.exit(1);
  }
};

terminateInvalidPath("--schema", _commander.program.schema);
terminateInvalidPath("--output", _commander.program.output);
terminateInvalidPath("--dts-output", _commander.program.dtsOutput);

var schemaPath = _path["default"].resolve(process.cwd(), _commander.program.schema);

var output = _path["default"].resolve(process.cwd(), _commander.program.output);

var _require = require(schemaPath),
    schema = _require.schema;

var classes = ["import * as node_bind from './node_bind.dart';", "export { node_bind };"].concat(_toConsumableArray(Object.keys(schema).map(function (classItem) {
  var item = new _classTemplate.ClassTemplate(classItem, schema[classItem]);
  schema[classItem].methodsList.forEach(function (element) {
    item.addMethod(element);
  });
  return item.toString();
}))).join("\n\n");

var generateSourceCode = function generateSourceCode(codeString) {
  var result = ts.transpileModule(codeString, {
    compilerOptions: {
      module: ts.ModuleKind.None
    }
  });

  _fs["default"].writeFileSync(output, result.outputText, "utf-8");
};

var generateDTS = function generateDTS(codeString) {
  var dtsOutput = _path["default"].resolve(process.cwd(), _commander.program.dtsOutput);

  var options = {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true
  };
  var compilerHost = ts.createCompilerHost(options);
  var file = {
    fileName: "no_extension",
    content: codeString
  };

  compilerHost.getSourceFile = function (fileName) {
    file.sourceFile = ts.createSourceFile(fileName, file.content, ts.ScriptTarget.ES2015, true);
    return file.sourceFile;
  };

  var prog = ts.createProgram(["test.ts"], options, compilerHost);
  prog.emit(undefined, function (_, data) {
    _fs["default"].writeFileSync(dtsOutput, data, "utf-8");
  });
};

_commander.program.dtsOutput && generateDTS(classes);
generateSourceCode(classes);