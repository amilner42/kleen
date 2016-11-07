/// Module for providing general testing utilities.


/**
 * Identical to the mocha `done` function.
 */
type mochaDone = (error?: any) => any;


/**
 * Mocha helper, makes sure promise errors, doesn't care with what.
 */
export const mochaAssertPromiseErrors = (
    promise: Promise<any>,
    done: mochaDone)
    : void => {

  mochaAssertPromiseErrorsWith(promise, (error) => true, done);
}


/**
 * Mocha helper for testing that functions error with expected error.
 */
export const mochaAssertPromiseErrorsWith = (
    promise: Promise<any>,
    errorResultsGood: (any) => boolean,
    done: mochaDone )
    : void => {

  promise
  .then(() => {
    done("Promise was supposed to error");
  })
  .catch((error) => {
    if(errorResultsGood(error)) {
      done();
    } else {
      done("Promise errored but results were bad: " + error);
    }
  });
}


/**
 * Mocha helper for making sure a promise resolves.
 */
export const mochaAssertPromiseResovles = (
    promise: Promise<any>,
    done: mochaDone)
    : void => {

  mochaAssertPromiseResovlesWith(
    promise,
    (result) => {
      return true; // we don't care about the result
    },
    done
  );
}


/**
 * Mocha helper for making sure a promise resolves.
 */
export const mochaAssertPromiseResovlesWith = (
    promise: Promise<any>,
    goodResult: (result: any) => boolean,
    done: mochaDone)
    : void => {

  promise
  .then((result) => {
    if(goodResult(result)) {
      done();
    } else {
      done("Promise resolved but with bad results: " + result);
    }
  })
  .catch((error) => {
    done("Promise errored with: " + error);
  });
}


/**
 * Resolves the promise with `value` after `milli` milliseconds.
 */
export const resolveAfterMilli = function<t>(value: t, milli: number): Promise<t> {
  return new Promise<t>((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, milli)
  });
};


/**
 * Rejects the promise with `value` after `milli` milliseconds.
 */
export const rejectAferMilli = function<t>(value: t, milli: number): Promise<t> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(value);
    }, milli);
  });
};
