"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClassTemplate = exports.Method = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var dartToTsTypeMapping = {
  'String': 'string',
  'bool': 'boolean',
  'double': 'number',
  'int': 'number',
  'void': 'void'
};

var makePositionalArgs = function makePositionalArgs() {
  var positionalArgs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var withType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return positionalArgs.map(function (arg) {
    var tsType = dartToTsTypeMapping[arg.type] || 'any';
    return "".concat(arg.name).concat(withType ? ": ".concat(tsType) : '');
  });
};

var mapNamedArgsMap = function mapNamedArgsMap() {
  var namedArgs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var withType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var type = !withType ? '' : ': {' + namedArgs.reduce(function (acc, arg) {
    var tsType = dartToTsTypeMapping[arg.type] || 'any';
    return [].concat(_toConsumableArray(acc), ["".concat(arg.name, ": ").concat(tsType)]);
  }, []).join(', ') + '}';
  return "namedArgs".concat(type);
};

var Method = /*#__PURE__*/function () {
  function Method(method, body) {
    _classCallCheck(this, Method);

    if (!method) {
      return;
    }

    this.name = method.name; // string

    this.positionalArgs = method.positionalArgs; // list {name, type}

    this.namedArgs = method.namedArgs; // list {name, type}

    this.returnType = method.returnType; //string

    if (body) {
      this.body = body; // string
    } else {
      var returnType = this.returnType;
      var posArgs = makePositionalArgs(this.positionalArgs, false);
      var namedArgs = this.namedArgs.length ? ', namedArgs' : '';
      this.body = "  ".concat(!returnType || returnType === 'void' ? '' : 'return', " this._methods['").concat(this.name, "'](").concat(posArgs).concat(namedArgs, ")");
    }
  }

  _createClass(Method, [{
    key: "toString",
    value: function toString() {
      var args = makePositionalArgs(this.positionalArgs);
      var body = this.body;
      var returnType = this.returnType ? dartToTsTypeMapping[this.returnType] || this.returnType : '';
      var namedArgs = this.namedArgs.length ? mapNamedArgsMap(this.namedArgs) : '';
      return [this.name, '(', args.join(', '), namedArgs ? ", ".concat(namedArgs) : '', ')', returnType ? ": ".concat(returnType, " ") : ' ', '{\n', body, '\n}\n'].join('');
    }
  }]);

  return Method;
}();

exports.Method = Method;

var ClassTemplate = /*#__PURE__*/function () {
  function ClassTemplate(className, schema, importName) {
    _classCallCheck(this, ClassTemplate);

    this.className = className;
    this.importName = importName;
    this.methods = [];
    this.defaultConstructorMethod = schema.defaultConstructorMethod;
    this.defaultConstructorName = schema.defaultConstructorName;
    this.methodMapperName = schema.methodMapperName;
  }

  _createClass(ClassTemplate, [{
    key: "addMethod",
    value: function addMethod(method) {
      var methodEnsured = new Method(method);

      if (methodEnsured) {
        this.methods.push(methodEnsured);
      }
    }
  }, {
    key: "toString",
    value: function toString() {
      var importName = this.importName;
      var header = "export class ".concat(this.className, " {\n");
      var instanceDefinition = 'private _instance;';
      var methodsWrapperDefinition = 'private _methods: Record<string, Function>;';
      var constructorBody = "\n  this._instance = ".concat(importName, ".").concat(this.defaultConstructorName, "(").concat(makePositionalArgs(this.defaultConstructorMethod.positionalArgs, false).join(', '), ");\n  this._methods = ").concat(importName, ".OtherThingMethodsMapper(this._instance);");
      var constructor = new Method(this.defaultConstructorMethod, constructorBody);
      var footer = "\n}";
      return [header, instanceDefinition, methodsWrapperDefinition, constructor.toString(), this.methods.map(function (method) {
        return method.toString();
      }).join('\n'), footer].join("\n");
    }
  }]);

  return ClassTemplate;
}();

exports.ClassTemplate = ClassTemplate;