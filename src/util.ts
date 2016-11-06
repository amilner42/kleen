/// Module for general utilities, used across libraries.


/**
 * Basic helper, Returns true if `thing` is null or undefined.
 */
export const isNullOrUndefined = (thing: any) => {
  return isNull(thing) || isUndefined(thing);
}


/**
 * Returns true if `thing` is null.
 */
export const isNull = (thing: any) => {
  return thing == null;
}


/**
 * Returns true if `thing` is undefined.
 */
export const isUndefined = (thing: any) => {
  return thing == undefined;
}


/**
 * Reverse to `Promise.all`. If any promise succeeds, it short circuits and
 * resolves the value of that promise, otherwise it rejects with an array of
 * failures.
 */
export const anyPromise = (promiseArray: Promise<any>[]): Promise<any> => {

  // A promise wrapper.
  interface wrappedPromise {
    succeeded: boolean,
    content: any
  }

  // Wraps succeeding/failing promises so that they all succeed.
  const wrapPromise = (promise: Promise<any>): Promise<wrappedPromise> => {
    return new Promise<wrappedPromise>((resolve, reject) => {
      return promise
      .then((content: any) => {
        const wrappedPromise: wrappedPromise = {
          succeeded: true,
          content
        };

        return resolve(wrappedPromise);
      })
      .catch((error) => {
        const wrappedPromise: wrappedPromise = {
          succeeded: false,
          content: error
        };

        return resolve(wrappedPromise);
      });
    });
  }

  return new Promise<any>((resolve, reject) => {

    return Promise.all(
      promiseArray
      .map(wrapPromise)
      .map((wrappedPromise: Promise<wrappedPromise>) => {
        return new Promise((resolve, reject) => {
          return wrappedPromise
          .then((wrappedPromise: wrappedPromise) => {
            if(wrappedPromise.succeeded) {
              // Reject so we short-circuit the `Promise.all`, we'll resolve it
              // outside.
              return reject(wrappedPromise.content);
            }

            // If it failed, we resolve it, remember reverse logic because of
            // the `Promise.all`.
            return resolve(wrappedPromise.content);
          })
        });
      })
    )
    .then((arrayOfPromiseFailures) => {
      return reject(arrayOfPromiseFailures);
    })
    .catch((successfulPromiseContent) => {
      return resolve(successfulPromiseContent);
    });
  });
}
