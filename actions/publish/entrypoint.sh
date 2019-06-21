#!/bin/sh

set -eu

printf "Installing dependencies\n"
npm ci

printf "Creating production build\n"
npm run build

printf "Writing to gh-pages\n"

git add build/
TREE=$(git write-tree --prefix=build/)
git commit-tree "${TREE}" -p gh-pages

printf "Pushing built files\n"
git push origin gh-pages:gh-pages
