const dartToTsTypeMapping = {
  'String': 'string',
  'bool': 'boolean',
  'double': 'number',
  'int': 'number',
  'void': 'void'
}

const makePositionalArgs = (positionalArgs = [], withType = true) => {

  return positionalArgs.map(arg => {
    const tsType = dartToTsTypeMapping[arg.type] || 'any'
    return `${arg.name}${withType ?  `: ${tsType}` : ''}`;
  }) 
}

const mapNamedArgsMap = (namedArgs = [], withType = true) => {
  const type = !withType ? '' : ': {' + namedArgs.reduce((acc, arg) => {
    const tsType = dartToTsTypeMapping[arg.type] || 'any'
    return [ ...acc, `${arg.name}: ${tsType}`];
  }, []).join(', ') + '}'

  return `namedArgs${type}`
}

export class Method {
  constructor(method, body) {
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
      const returnType = this.returnType;
      const posArgs = makePositionalArgs(this.positionalArgs, false);
      const namedArgs = this.namedArgs.length ? ', namedArgs' : '';
      this.body = `  ${!returnType || returnType === 'void' ? '' : 'return'} this._methods['${this.name}'](${posArgs}${namedArgs})`
    }
  }

  toString() {
    const args = makePositionalArgs(this.positionalArgs)
    const body = this.body;
    const returnType = this.returnType ? dartToTsTypeMapping[this.returnType] || this.returnType : ''
    const namedArgs = this.namedArgs.length ? mapNamedArgsMap(this.namedArgs) : '';
    return [
      this.name,
      '(',
      args.join(', '),
      namedArgs ? `, ${namedArgs}` : '',
      ')',
      returnType ? `: ${returnType} ` : ' ',
      '{\n',
      body,
      '\n}\n'
    ].join('')

  }
}

export class ClassTemplate {
  constructor(className, schema, importName) {
    this.className = className;
    this.importName = importName;
    this.methods = [];
    this.defaultConstructorMethod = schema.defaultConstructorMethod;
    this.defaultConstructorName = schema.defaultConstructorName;
    this.methodMapperName = schema.methodMapperName;
  }

  addMethod(method) {
    const methodEnsured = new Method(method);

    if (methodEnsured) {
      this.methods.push(methodEnsured);
    }
  }

  toString() {
    const importName = this.importName;
    const header = `export class ${this.className} {\n`;
    const instanceDefinition = 'private _instance;';
    const methodsWrapperDefinition = 'private _methods: Record<string, Function>;';
    const constructorBody = `
  this._instance = ${importName}.${this.defaultConstructorName}(${makePositionalArgs(this.defaultConstructorMethod.positionalArgs, false).join(', ')});
  this._methods = ${importName}.OtherThingMethodsMapper(this._instance);`;
    const constructor = new Method(this.defaultConstructorMethod, constructorBody);
    const footer = "\n}";

    return [
      header,
      instanceDefinition,
      methodsWrapperDefinition,
      constructor.toString(),
      this.methods.map((method) => method.toString()).join('\n'),
      footer,
    ].join("\n");
  }
}
