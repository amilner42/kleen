#!/usr/bin/env bash

## Builds the project, ts -> es6 -> es5 using tsc and babel. Must be run from
## top level of project. Also copies over `main.d.ts` to lib.

./node_modules/.bin/tsc -d; # '-d' flag for generating .d.ts file.
./node_modules/.bin/babel src --out-dir lib --source-maps --ignore lib,node_modules;
cp src/main.d.ts lib/main.d.ts
