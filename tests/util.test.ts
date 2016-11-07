/// Module for testing 'src/util.ts'.

import assert from "assert";

import {
  isNull,
  isUndefined,
  isNullOrUndefined,
  anyPromise
} from "../src/util";
import {
  mochaAssertPromiseErrors,
  mochaAssertPromiseErrorsWith,
  mochaAssertPromiseResovles,
  mochaAssertPromiseResovlesWith,
  rejectAferMilli,
  resolveAfterMilli
} from "./util";


describe('src/util.ts', function() {

  describe('#isNull', function() {

    it('should return true when arg is null', function() {
      assert.equal(isNull(null), true);
    });

    it('should return false when arg is not null', function() {
      assert.equal(isNull(5), false);
    });
  });

  describe('#isUndefined', function() {

    it('should return true when arg is undefined', function() {
      assert.equal(isUndefined(undefined), true);
    });

    it('should return false when arg is not undefined', function() {
      assert.equal(isUndefined("undefined"), false);
    });
  });

  describe('#isNullOrUndefined', function() {

    it('should return true if arg is null', function() {
      assert.equal(isNullOrUndefined(null), true);
    });

    it('should return true if arg is undefined', function() {
      assert.equal(isNullOrUndefined(undefined), true);
    });

    it('should return false if arg is not null/undefined', function() {
      assert.equal(isNullOrUndefined(5), false);
    });
  });

  describe('#anyPromise', function() {



    const resolveFiveDelayed1000 = resolveAfterMilli(5, 1000);

    const resolveTenDelayed5000 = resolveAfterMilli(10, 5000);

    const rejectTenDelay200 = rejectAferMilli(10, 200);

    const reject20Delayed400 = rejectAferMilli(20, 400);

    // No promise succeeded in this case.
    it('should error if the array is empty', function(done) {
      mochaAssertPromiseErrorsWith(
        anyPromise([]),
        (error) => {
          return Array.isArray(error) && error.length === 0;
        },
        done);
    });

    it('should succeed if a single promise suceeds', function(done) {

      const resolveFive = Promise.resolve(5);
      const rejectTen = Promise.reject(10);

      mochaAssertPromiseResovlesWith(
        anyPromise([resolveFive, rejectTen, rejectTen]),
        (result) => {
          return result === 5;
        },
        done
      );
    });

    it('should succeed with the first promise that succeeds, and then short circuit', function(done) {

      mochaAssertPromiseResovlesWith(
        anyPromise([resolveTenDelayed5000, resolveFiveDelayed1000]),
        (result) => {
          return result === 5;
        },
        done
      );
    });

    it('should succeed with the firt promise that succeeds, ignoring failed promises', function(done) {

      mochaAssertPromiseResovlesWith(
        anyPromise([rejectTenDelay200, rejectTenDelay200, resolveFiveDelayed1000]),
        (result) => {
          return result === 5
        },
        done
      );
    });

    it('should fail after all promises fail if none succeed', function(done) {
      mochaAssertPromiseErrorsWith(
        anyPromise([reject20Delayed400, reject20Delayed400, rejectTenDelay200]),
        (result) => {
          return result[0] === 20 && result[1] === 20 && result[2] === 10;
        },
        done
      );
    });
  });
});
