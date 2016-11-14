#!/usr/bin/env bash

## Builds the website, elm -> (app.js, app.css, index.html) using webpack and
## watches for changes. Script must be run from top level of project. Does not
## build the project into `docs`, so you must use the `build` script prior for
## deploying to github pages.


# Delete dist and recreate directory.
rm -rf webstite/dist;
mkdir website/dist;

# Delete and re-copy manual dependencies;
rm -rf website/dist/manual_dependencies;
cp -r website/manual_dependencies website/dist;

cd website;
rm -rf ./elm-stuff/build-artifcats/;
./node_modules/.bin/webpack --watch &
pid[0]=$!;
cd -;


cd website/dist;
../node_modules/.bin/static -H '{"Cache-Control": "no-cache, must-revalidate"}' &
pid[1]=$!;
cd -;


trap "printf '\n\n Cleaning Background Processes \n\n'; kill ${pid[0]} ${pid[1]}; exit 1" INT TERM;
wait;
