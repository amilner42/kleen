#!/usr/bin/env bash

## Builds the website, elm -> (app.js, app.css, index.html) using webpack. Must
## be run from top level of project. Moves the dist folder in website to top
## level in `docs`, so github pages can host static assets.

cd website;
./node_modules/.bin/webpack;
rm -r ../docs;
mv dist docs;
mv docs ..;
cp src/favicon.ico ../docs/;
cd -;
