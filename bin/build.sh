#!/usr/bin/env bash

## Builds the project, ts -> es6 -> es5 using tsc and babel. Must be run from
## top level of project. Also copies over all `*.d.ts` to lib.

# Build Project
./node_modules/.bin/tsc -d; # '-d' flag for generating .d.ts file.
./node_modules/.bin/babel src/ --out-dir lib --source-maps;

# Copy .d.ts files to lib.
cp src/*.d.ts lib/;

# Clean up un-needed files.
rm src/*.js tests/*.js tests/*.d.ts;
