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

  promise
  .then(() => {
    done();
  })
  .catch((error) => {
    done("Promise errored with: " + error);
  });
}
