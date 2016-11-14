#!/usr/bin/env bash

## Builds the website, elm -> (app.js, app.css, index.html) using webpack. Must
## be run from top level of project. Moves the dist folder in website to top
## level in `docs`, so github pages can host static assets.

# Remove previous build.
rm -rf docs;

cd website;
# Build new build.
./node_modules/.bin/webpack;
# Move it to top level docs directory.
mv dist docs;
mv docs ..;
# Copy favicon.
cp src/favicon.ico ../docs/;
# Copy manual_dependencies to lib.
cp -R manual_dependencies ../docs/;
cd -;
