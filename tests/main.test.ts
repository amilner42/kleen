/// Module for testing 'src/main.ts'

import {
  validModel,
  arraySchema,
  typeSchema,
  objectSchema,
  primitiveSchema,
  unionSchema,
  referenceSchema,
  restriction,
  kindOfPrimitive,
  kindOfSchema,
  schemaTypeError
} from "../src/main";
import { anyPromise } from '../src/util';
import {
  mochaAssertPromiseErrorsWith,
  mochaAssertPromiseResovles,
  mochaAssertPromiseErrors
} from "./util";


describe("src/main.ts", function() {

  describe("#validModel", function() {

    const stringType: primitiveSchema = {
      primitiveType: kindOfPrimitive.string
    };

    const validString = validModel(stringType);

    const booleanType: primitiveSchema = {
      primitiveType: kindOfPrimitive.boolean
    };

    it("should allow valid strings", function(done) {
      mochaAssertPromiseResovles(validString(""), done);
    });

    it("should not allow null by default", function(done) {
      mochaAssertPromiseErrors(validString(null), done);
    });

    it("should not allow undefined by default", function(done) {
      mochaAssertPromiseErrors(validString(undefined), done);
    });

    const numberType: primitiveSchema = {
      primitiveType: kindOfPrimitive.number
    };

    const stringAllowingNullOrUndefined: primitiveSchema = {
      primitiveType: kindOfPrimitive.string,
      nullAllowed: true,
      undefinedAllowed: true
    };

    it('should not allow numbers if expecting a string', function(done) {
      mochaAssertPromiseErrors(validString(24), done);
    });

    const stringAllowingUndefined: primitiveSchema = {
      primitiveType: kindOfPrimitive.string,
      undefinedAllowed: true
    };

    const validStringOrNullOrUndefined =
      validModel(stringAllowingNullOrUndefined);

    it('should allow null if allowNull is set', function(done) {
      mochaAssertPromiseResovles(validStringOrNullOrUndefined(null), done);
    });

    it('should allow undefined if allowUndefined is set', function(done) {
      mochaAssertPromiseResovles(validModel(stringAllowingUndefined)(undefined), done);
    });

    const numberWithCustomError: primitiveSchema = {
      primitiveType: kindOfPrimitive.number,
      typeFailureError: "error"
    };

    const validNumberWithCustomError = validModel(numberWithCustomError);

    it('should throw the custom error on type failure', function(done) {
      mochaAssertPromiseErrorsWith(
        validNumberWithCustomError("sadf"),
        (error) => {
          return error === "error"
        },
        done
      );
    });

    const booleanWithRestriction: primitiveSchema = {
      primitiveType: kindOfPrimitive.boolean,
      restriction: (someBool: boolean) => {
        if(someBool) {
          return Promise.reject("error");
        }
      }
    };

    const validBooleanWithRestriction =
      validModel(booleanWithRestriction);

    it('should fail against the restriction', function(done) {
      mochaAssertPromiseErrorsWith(
        validBooleanWithRestriction(true),
        (error) => {
          return error === "error"
        },
        done
      )
    });

    it('should pass the restriction', function(done) {
      mochaAssertPromiseResovles(validBooleanWithRestriction(false), done);
    });

    const basicUserObjectStructure: objectSchema = {
      objectProperties: {
        "email": stringType,
        "password": stringType
      },
      nullAllowed: true
    };

    const validBasicUserObjectStructure =
      validModel(basicUserObjectStructure);

    it('should not allow an object with extra properties', function(done) {
      mochaAssertPromiseErrors(
        validBasicUserObjectStructure({
          email: "",
          password: "",
          extraField: true}
        ),
        done
      );
    });

    it('should not allow an object missing fields', function(done) {
      mochaAssertPromiseErrors(
        validBasicUserObjectStructure({
          email: ""
        }),
        done
      );
    });

    it('should not allow objects which have a field with incorrect type', function(done) {
      mochaAssertPromiseErrors(
        validBasicUserObjectStructure({
          email: "",
          password: null
        }),
        done
      );
    });

    it('should allow an object if it has all the correct properties', function(done) {
      mochaAssertPromiseResovles(
        validBasicUserObjectStructure({
          email: "",
          password: ""
        }),
        done
      );
    });

    it('should allow null for objects if nullAllowed is set', function(done) {
      mochaAssertPromiseResovles(
        validBasicUserObjectStructure(null),
        done
      );
    });

    const arrayOfNumberWithCustomErrorAndRestriction: arraySchema = {
      arrayElementType: numberWithCustomError,
      restriction: (arrayOfNumber: number[]) => {
        if(arrayOfNumber.length > 3) {
          return Promise.reject("restriction-error");
        }
      }
    };

    const validArrayOfNumberWithCustomErrorAndRestriction =
      validModel(arrayOfNumberWithCustomErrorAndRestriction);

    it('should throw the restriction error', function(done) {
      mochaAssertPromiseErrorsWith(
        validArrayOfNumberWithCustomErrorAndRestriction([1,1,1,1]),
        (error: any) => {
          return error === "restriction-error"
        },
        done
      );
    });

    // Notice BEFORE the restriction is checked the type will be guaranteed,
    // here the restriction would fail but we never run it because the type of
    // one of the elements is incorrect.
    it('should throw the custom error when an array element has the wrong type', function(done) {
      mochaAssertPromiseErrorsWith(
        validArrayOfNumberWithCustomErrorAndRestriction([1,2,3,4,"3"]),
        (error: any) => {
          return error === "error"
        },
        done
      );
    });

    it('should allow a valid array which also passes the restriction', function(done) {
      mochaAssertPromiseResovles(
        validArrayOfNumberWithCustomErrorAndRestriction([1]),
        done
      );
    });

    // Union of 0 types, should always fail.
    const unionOfNoTypes: unionSchema = {
      unionTypes: []
    };

    const validUnionOfNoTypes =
      validModel(unionOfNoTypes);

    it('should fail when the union allows no types', function(done) {
      mochaAssertPromiseErrors(
        validUnionOfNoTypes(5),
        done
      );
    });

    const unionOfPrimitives: unionSchema = {
      unionTypes: [
        stringType,
        booleanType,
        numberType
      ]
    };

    const validUnionOfPrimitives =
      validModel(unionOfPrimitives);

    it('should allow the type when it is in the union', function(done) {
      const validUnionTypes = [
        5,
        "string",
        true
      ];

      mochaAssertPromiseResovles(
        Promise.all(validUnionTypes.map(validUnionOfPrimitives)),
        done
      );
    });

    it('should now allow the type when it is not in the union', function(done) {
      mochaAssertPromiseErrorsWith(
        validUnionOfPrimitives({}),
        (error) => {
          return error === schemaTypeError.unionHasNoMatchingType
        },
        done
      );
    });

    const complexObject: objectSchema = {
      objectProperties: {
        "somePrimitive": unionOfPrimitives,
        "arrayOfNumbers": arrayOfNumberWithCustomErrorAndRestriction
      }
    };

    const validComplexObject = validModel(complexObject);

    it('should allow valid complex objects', function(done) {
      mochaAssertPromiseResovles(
        validComplexObject({
          somePrimitive: 5,
          arrayOfNumbers: [1,2]
        }),
        done
      );
    });

    it('should throw custom error when property type has custom restriction and fails', function(done) {
      mochaAssertPromiseErrorsWith(
        validComplexObject({
          somePrimitive: 5,
          arrayOfNumbers: [1,"23"]
        }),
        (error) => {
          return error === "error"
        },
        done
      );
    });

    it('should throw restriction error when property fails restriction', function(done) {
      mochaAssertPromiseErrorsWith(
        validComplexObject({
          somePrimitive: true,
          arrayOfNumbers: [1,2,3,4,5]
        }),
        (error) => {
          return error === "restriction-error"
        },
        done
      );
    });

    const recursiveObject: objectSchema = {
      objectProperties: {
        "primitiveProperty": {
          primitiveType: kindOfPrimitive.number
        },
        "recursiveProperty": {
          referenceName: "nameTest"
        }
      },
      name: "nameTest",
      undefinedAllowed: true
    };

    const validRecursiveObject = validModel(recursiveObject);

    it('should allow valid models against a basic recursive schema ', function(done) {
      const validObjects = [
        undefined,
        {
          primitiveProperty: 5
        },
        {
          primitiveProperty: 5,
          recursiveProperty: {
            primitiveProperty: 20
          }
        },
        {
          primitiveProperty: 5,
          recursiveProperty: {
            primitiveProperty: 20,
            recursiveProperty: {
              primitiveProperty: 100,
              recursiveProperty: undefined
            }
          }
        },
      ];

      mochaAssertPromiseResovles(
        Promise.all(validObjects.map(validRecursiveObject)),
        done
      );
    });

    it('should not allow invalid models against a basic recursive schema', function(done) {
      const invalidObjects = [
        null,
        {},
        {
          primitiveProperty: "notANumber"
        },
        {
          primitiveProperty: 5,
          recursiveProperty: null
        },
        {
          primitiveProperty: 10,
          recursiveProperty: {
            primitiveProperty: 10,
            recursiveProperty: {
              primitiveProperty: "notANumber"
            }
          }
        }
      ];

      mochaAssertPromiseErrors(
        anyPromise(invalidObjects.map(validRecursiveObject)),
        done
      );
    });

    const nestedRecursiveObject: objectSchema = {
      name: "outer",
      objectProperties: {
        someString: stringType,
        someObject: {
          name: "inner",
          objectProperties: {
            someNumber: numberType,
            referenceOuter: {
              referenceName: "outer",
              nullAllowed: true,
              typeFailureError: "Didn't allow reference outer"
            },
            referenceInner: {
              referenceName: "inner",
              undefinedAllowed: true,
              typeFailureError: "Didn't allow reference inner"
            }
          },
          typeFailureError: "Didn't allow someObject"
        }
      }
    };

    const validNestedRecursiveObject = validModel(nestedRecursiveObject);

    it('should allow valid models against a nested recursive schema', function(done) {
      const validObjects = [
        {
          someString: "bla",
          someObject: {
            someNumber: 5,
            referenceOuter: null
          }
        },
        {
          someString: "",
          someObject: {
            someNumber: 5,
            referenceOuter: {
              someString: "",
              someObject: {
                someNumber: 5,
                referenceOuter: null
              }
            },
            referenceInner: {
              someNumber: 5,
              referenceOuter: null
            }
          }
        },
        {
          someString: "",
          someObject: {
            someNumber: 5,
            referenceOuter: {
              someString: "",
              someObject: {
                someNumber: 5,
                referenceOuter: {
                  someString: "",
                  someObject: {
                    someNumber: 5,
                    referenceOuter: {
                      someString: "",
                      someObject: {
                        someNumber: 5,
                        referenceOuter: null
                      }
                    },
                    referenceInner: {
                      someNumber: 5,
                      referenceOuter: null
                    }
                  }
                }
              }
            },
            referenceInner: {
              someNumber: 5,
              referenceOuter: {
                someString: "",
                someObject: {
                  someNumber: 5,
                  referenceOuter: {
                    someString: "",
                    someObject: {
                      someNumber: 5,
                      referenceOuter: null
                    }
                  },
                  referenceInner: {
                    someNumber: 5,
                    referenceOuter: null
                  }
                }
              }
            }
          }
        }
      ];

      mochaAssertPromiseResovles(
        Promise.all(validObjects.map(validNestedRecursiveObject)),
        done
      );
    });

    it('should now allow invalid models against a nested recursive schema', function(done) {
      const invalidObjects = [
        undefined,
        null,
        {
          someString: "bla",
          someObject: {
            someNumber: 5,
            referenceOuter: undefined
          }
        },
        {
          someString: 5,
          someObject: {
            someNumber: 5,
            referenceOuter: null
          }
        },
        {
          someString: 5,
          someObject: {
            someNumber: 5,
            referenceInner: { }
          }
        },
        {
          someString: "",
          someObject: {
            someNumber: 5,
            referenceOuter: {
              someString: "",
              someObject: {
                someNumber: 5,
                referenceOuter: null
              }
            },
            referenceInner: {
              someNumber: 5,
              referenceOuter: null,
              referenceInner: {
                someString: 'asf'
              }
            }
          }
        }
      ];

      mochaAssertPromiseErrors(
        anyPromise(invalidObjects.map(validNestedRecursiveObject)),
        done
      );
    });

    const nestedRecursiveObjectWithReferenceOverwrite: objectSchema = {
      name: "name",
      objectProperties: {
        propertyName: {
          name: "name",
          objectProperties: {
            referenceProperty: {
              referenceName: "name"
            }
          },
          nullAllowed: true
        }
      },
      undefinedAllowed: true
    };

    const validNestedRecursiveObjectWithReferenceOverwrite =
      validModel(nestedRecursiveObjectWithReferenceOverwrite);

    it('should properly overwrite the reference', function(done) {

      const validObjects = [
        {
          propertyName: {
            referenceProperty: null
          }
        },
        {
          propertyName: {
            referenceProperty: {
              referenceProperty: {
                referenceProperty: null
              }
            }
          }
        }
      ];

      mochaAssertPromiseResovles(
        Promise.all(validObjects.map(validNestedRecursiveObjectWithReferenceOverwrite)),
        done
      );
    });

    it('should properly overwrite the reference', function(done) {

      mochaAssertPromiseErrors(
        validNestedRecursiveObjectWithReferenceOverwrite({
          propertyName: {
            referenceProperty: undefined
          }
        }),
        done
      );
    });

    const recursiveArray: arraySchema = {
      name: "array",
      arrayElementType: {
        referenceName: "array"
      },
      nullAllowed: true
    };

    const validRecursiveArray = validModel(recursiveArray);

    it('should allow valid recursive arrays', function(done) {

      const validArrays = [
        null,
        [[[[]]]],
        [null, null, null],
        [[null], [[[]]], null]
      ];

      mochaAssertPromiseResovles(
        Promise.all(validArrays.map(validRecursiveArray)),
        done
      );
    });

    it('should not allow invalid recursive arrays', function(done) {

      const invalidArrays = [
        undefined,
        [undefined],
        [null, [], undefined]
      ];

      mochaAssertPromiseErrors(
        anyPromise(invalidArrays.map(validRecursiveArray)),
        done
      );
    });

    const namedPropertiesObject: objectSchema = {
      objectProperties: {
        propertyA: {
          name: "a",
          primitiveType: kindOfPrimitive.string
        },
        propertyB: {
          name: "b",
          objectProperties: {
            propertyNested: {
              referenceName: "a"
            }
          }
        }
      }
    };

    const validNamedPropertiesObject = validModel(namedPropertiesObject);

    it('should not allow referencing things outside block scope', function(done) {

      mochaAssertPromiseErrorsWith(
        validNamedPropertiesObject({
          propertyA: "bla",
          propertyB: {
            // propertyB references out of block scope.
          }
        }),
        (error) => error === schemaTypeError.referenceNotFound,
        done
      );
    });

    const objectMultipleReferencesToSameObject: objectSchema = {
      name: "object",
      objectProperties: {
        nestedProperty: {
          objectProperties: {
            referenceProperty: {
              referenceName: "object",
              nullAllowed: true
            }
          }
        },
        referenceProperty: {
          referenceName: "object",
          undefinedAllowed: true
        }
      },
    };

    const validObjectMultipleReferencesToSameObject =
      validModel(objectMultipleReferencesToSameObject);

    it('should never change the original reference', function(done) {

      const validObject = {
        nestedProperty: {
          referenceProperty: null
        },
        referenceProperty: undefined
      };

      mochaAssertPromiseResovles(
        validObjectMultipleReferencesToSameObject(validObject),
        done
      );
    });

    it('should never change the original reference', function(done) {

      const invalidObject = {
        nestedProperty: {
          referenceProperty: undefined
        },
        referenceProperty: undefined
      };

      mochaAssertPromiseErrors(
        validObjectMultipleReferencesToSameObject(invalidObject),
        done
      );
    });

    const basicRecursiveObjectWithRestrictions = {
      name: "object",
      objectProperties: {
        bla: { primitiveType: kindOfPrimitive.string },
        reference: { referenceName: "object" }
      },
      restriction: (theObject) => {
        if(theObject !== undefined) {
          if(theObject.bla === "notThisString") {
            return Promise.reject("Bad string!");
          }
        }
      },
      undefinedAllowed: true
    };

    const validBasicRecursiveObjectWithRestrictions =
      validModel(basicRecursiveObjectWithRestrictions);

    it('should run the original restriction of a reference if not overwritten', function(done) {

      mochaAssertPromiseErrorsWith(
        validBasicRecursiveObjectWithRestrictions({
          bla: "good string",
          reference: {
            bla: "notThisString"
          }
        }),
        (error => error === "Bad string!"),
        done
      );
    });

    const basicRecursiveObjectWithRestrictionNullified = {
      name: "object",
      objectProperties: {
        bla: { primitiveType: kindOfPrimitive.string },
        reference: {
          referenceName: "object",
          restriction: null
        }
      },
      restriction: (theObject) => {
        if(theObject !== undefined) {
          if(theObject.bla === "notThisString") {
            return Promise.reject("Bad string!");
          }
        }
      },
      undefinedAllowed: true
    };

    const validBasicRecursiveObjectWithRestrictionNullified =
      validModel(basicRecursiveObjectWithRestrictionNullified);

    it('should nullify the restriction', function(done) {
      mochaAssertPromiseResovles(
        validBasicRecursiveObjectWithRestrictionNullified({
          bla: "good string",
          reference: {
            bla: "notThisString"
          }
        }),
        done
      );
    });

    const objectWithReferenceOverwriteRestriction: objectSchema = {
      name: "object",
      objectProperties: {
        reference: {
          referenceName: "object",
          restriction: (object) => {
            if(object.someString.length < 5) {
              return Promise.reject("someString string too short!");
            }
          }
        },
        someString: stringType
      },
      restriction: (object) => {
        if(object.someString === "outerRestrictionString") {
          return Promise.reject("Can't be null");
        }
      },
      undefinedAllowed: true
    };

    const validNestedRecursiveObjectWithReferenceOverwriteRestriction =
      validModel(objectWithReferenceOverwriteRestriction);

    it('should allow models that follow inner restriction if refrence' +
       ' overwrites outer restriction', function(done) {

      mochaAssertPromiseResovles(
        validNestedRecursiveObjectWithReferenceOverwriteRestriction({
          reference: {
            someString: "outerRestrictionString"
          },
          someString: "bla"
        }),
        done
      );
    });

    const recursiveObjectOverwriteTypeFailureError: objectSchema = {
      name: "bla",
      objectProperties: {
        reference: {
          referenceName: "bla",
          typeFailureError: "inner error"
        }
      },
      typeFailureError: "outer error"
    };

    const validRecursiveObjectOverwriteTypeFailureError =
      validModel(recursiveObjectOverwriteTypeFailureError);

    it('should allow you to overwrite type failure errors in the reference', function(done) {

      mochaAssertPromiseErrorsWith(
        validRecursiveObjectOverwriteTypeFailureError({
          reference: null
        }),
        (error) => error === "inner error",
        done
      );
    });

    const mutualA: objectSchema = {
      objectProperties: {
        propertyA: stringType,
        mutualReference: { referenceName: "mutualB" }
      },
      withContext: () => {
        return {
          "mutualB": mutualB
        };
      },
      nullAllowed: true
    };

    const referenceSchemaWithContext: referenceSchema = {
      referenceName: "primitive",
      withContext: () => {
        return {
          "primitive": stringType
        }
      }
    };

    const validReferenceSchemaWithContext =
      validModel(referenceSchemaWithContext);

    it('should allow you to reference things in withContext', function(done) {

      mochaAssertPromiseResovles(
        validReferenceSchemaWithContext("some string"),
        done
      );
    });

    const mutualB: objectSchema = {
      objectProperties: {
        propertyB: numberType,
        mutualReference: mutualA,
      },
      nullAllowed: true
    };

    const validMutualA =
      validModel(mutualA);

    const validMutualB =
      validModel(mutualB);

    it('should allow valid mutually recursive objects', function(done) {

      const validMutuallyRecursiveObjects = [
        null,
        {
          propertyA: "bla",
          mutualReference: null
        },
        {
          propertyA: "",
          mutualReference: {
            propertyB: 5,
            mutualReference: null
          }
        },
        {
          propertyA: "",
          mutualReference: {
            propertyB: 5,
            mutualReference: {
              propertyA: "asdf",
              mutualReference: null
            }
          }
        }
      ];

      mochaAssertPromiseResovles(
        Promise.all(validMutuallyRecursiveObjects.map(validMutualA)),
        done
      );
    });

    it('should not allow invalid mutally recursive functions', function(done) {

      const invalidMutuallyRecursiveObjects = [
        undefined,
        {
          propertyA: "asdf",
          mutualReference: undefined
        },
        {
          propertyA: "",
          mutualReference: {
            propertyB: 5,
            mutualReference: undefined
          }
        },
        {
          propertyA: "",
          mutualReference: {
            propertyB: 5,
            mutualReference: {
              propertyA: "",
              mutualReference: undefined
            }
          }
        }
      ];

      mochaAssertPromiseErrors(
        anyPromise(invalidMutuallyRecursiveObjects.map(validMutualA)),
        done
      );
    });

  });
});
