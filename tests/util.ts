/// Module for providing general testing utilities.


/**
 * Identical to the mocha `done` function.
 */
type mochaDone = (error?: any) => any;


/**
 * Mocha helper for testing that functions error with expected error.
 */
export const mochaAssertPromiseErrorsWith = (
    promise: Promise<any>,
    errorResultsBad: (any) => boolean,
    done: mochaDone )
    : void => {

  promise
  .then(() => {
    done("Promise was supposed to error");
  })
  .catch((error) => {
    if(errorResultsBad(error)) {
      done("Promise errored but results were bad: " + error)
    } else {
      done();
    }
  });
}


/**
 * Mocha helper for making sure a promise resolves.
 */
export const mochaAssertPromiseResovles = (promise: Promise<any>, done: mochaDone): void => {
  promise
  .then(() => {
    done();
  })
  .catch((error) => {
    done("Promise errored with: " + error);
  });
}
