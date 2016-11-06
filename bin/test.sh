#!/usr/bin/env bash

## Builds the tests, ts -> es6 -> es5 using tsc and babel. Must be run from
## top level of project. Also copies over all `*.d.ts` to lib.


# Build projects.
./node_modules/.bin/tsc;
./node_modules/.bin/babel . --out-dir lib_test --ignore lib,node_modules,lib_test;

# Clean up un-needed files.
rm src/*.js tests/*.js tests/*.d.ts;

# Run all tests.
./node_modules/.bin/mocha lib_test/tests/;
