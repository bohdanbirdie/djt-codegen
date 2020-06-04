"use strict";

// GENERATED CODE - DO NOT MODIFY BY HAND
// **************************************************************************
// SchemaGenerator
// **************************************************************************
var schema = {
  OtherThing: {
    defaultConstructorName: "OtherThingDefaultConstructor",
    defaultConstructorMethod: {
      name: "constructor",
      returnType: "",
      positionalArgs: [],
      namedArgs: []
    },
    methodsMapperName: "OtherThingMethodsMapper",
    methodsList: [{
      name: "otherMethod",
      returnType: "void",
      positionalArgs: [],
      namedArgs: []
    }, {
      name: "otherMethod2",
      returnType: "DifferentThing",
      positionalArgs: [{
        name: "args",
        type: "String"
      }],
      namedArgs: []
    }]
  },
  DifferentThing: {
    defaultConstructorName: "DifferentThingDefaultConstructor",
    defaultConstructorMethod: {
      name: "constructor",
      returnType: "",
      positionalArgs: [{
        name: "someProp",
        type: "String"
      }],
      namedArgs: [{
        name: "privateProp",
        type: "{String privateProp}"
      }]
    },
    methodsMapperName: "DifferentThingMethodsMapper",
    methodsList: [{
      name: "otherMethod",
      returnType: "String",
      positionalArgs: [{
        name: "optionalPositional",
        type: "String"
      }],
      namedArgs: []
    }, {
      name: "otherMethod2",
      returnType: "String",
      positionalArgs: [{
        name: "kek",
        type: "String"
      }],
      namedArgs: [{
        name: "named",
        type: "{String named}"
      }]
    }]
  }
};
module.exports = {
  schema: schema
};