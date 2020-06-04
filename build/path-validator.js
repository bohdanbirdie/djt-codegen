"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validatePath = void 0;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var validatePath = function validatePath(pathString) {
  var _path$parse = _path["default"].parse(pathString),
      name = _path$parse.name,
      ext = _path$parse.ext;

  return {
    isValid: name && ext,
    name: name,
    ext: ext
  };
};

exports.validatePath = validatePath;