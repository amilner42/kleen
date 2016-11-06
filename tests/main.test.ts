/// Module for testing 'src/main.ts'

import assert from "assert";

import {
  validModel,
  arrayStructure,
  typeStructure,
  objectStructure,
  primitiveStructure,
  restriction,
  kindOfPrimitive,
  kindOfType
  } from "../src/main";
import { mochaAssertPromiseErrorsWith, mochaAssertPromiseResovles} from "./util";


describe("src/main.ts", function() {

  describe("#validModel", function() {

    const stringType: primitiveStructure = {
      kindOfType: kindOfType.primitive,
      kindOfPrimitive: kindOfPrimitive.string
    }

    it("should allow valid strings", function(done) {
      mochaAssertPromiseResovles(validModel(stringType)(""), done);
    });
  });
});
