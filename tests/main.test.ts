/// Module for testing 'src/main.ts'

import {
  validModel,
  arraySchema,
  typeSchema,
  objectSchema,
  primitiveSchema,
  unionSchema,
  restriction,
  kindOfPrimitive,
  kindOfSchema,
  schemaTypeError
} from "../src/main";
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

    const numberType: primitiveSchema = {
      primitiveType: kindOfPrimitive.number
    };

    const stringAllowingNullOrUndefined: primitiveSchema = {
      primitiveType: kindOfPrimitive.string,
      nullAllowed: true,
      undefinedAllowed: true
    };

    const validStringOrNullOrUndefined =
      validModel(stringAllowingNullOrUndefined);

    const numberWithCustomError: primitiveSchema = {
      primitiveType: kindOfPrimitive.number,
      typeFailureError: "error"
    };

    const validNumberWithCustomError = validModel(numberWithCustomError);

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

    const basicUserObjectStructure: objectSchema = {
      objectProperties: {
        "email": stringType,
        "password": stringType
      },
      nullAllowed: true
    };

    const validBasicUserObjectStructure =
      validModel(basicUserObjectStructure);

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


    // Union of 0 types, should always fail.
    const unionOfNoTypes: unionSchema = {
      unionTypes: []
    };

    const validUnionOfNoTypes =
      validModel(unionOfNoTypes);

    const unionOfPrimitives: unionSchema = {
      unionTypes: [
        stringType,
        booleanType,
        numberType
      ]
    };

    const validUnionOfPrimitives =
      validModel(unionOfPrimitives);

    const complexObject: objectSchema = {
      objectProperties: {
        "somePrimitive": unionOfPrimitives,
        "arrayOfNumbers": arrayOfNumberWithCustomErrorAndRestriction
      }
    };

    const validComplexObject = validModel(complexObject);

    it("should allow valid strings", function(done) {
      mochaAssertPromiseResovles(validString(""), done);
    });

    it("should not allow null by default", function(done) {
      mochaAssertPromiseErrors(validString(null), done);
    });

    it("should not allow undefined by default", function(done) {
      mochaAssertPromiseErrors(validString(undefined), done);
    });

    it('should not allow numbers if expecting a string', function(done) {
      mochaAssertPromiseErrors(validString(24), done);
    });

    it('should allow null if allowNull is set', function(done) {
      mochaAssertPromiseResovles(validStringOrNullOrUndefined(null), done);
    });

    it('should allow undefined if allowUndefined is set', function(done) {
      mochaAssertPromiseResovles(validStringOrNullOrUndefined(undefined), done);
    });

    it('should throw the custom error on type failure', function(done) {
      mochaAssertPromiseErrorsWith(
        validNumberWithCustomError("sadf"),
        (error) => {
          return error === "error"
        },
        done
      );
    });

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

    it('should fail when the union allows no types', function(done) {
      mochaAssertPromiseErrors(
        validUnionOfNoTypes(5),
        done
      );
    });

    it('should allow the type when it is in the union', function(done) {
      mochaAssertPromiseResovles(
        validUnionOfPrimitives(5),
        done
      );
    });

    it('should allow the type when it is in the union', function(done) {
      mochaAssertPromiseResovles(
        validUnionOfPrimitives("5"),
        done
      );
    });

    it('should allow the type when it is in the union', function(done) {
      mochaAssertPromiseResovles(
        validUnionOfPrimitives(false),
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
  });
});
