#!/bin/sh

set -eu

export GIT_AUTHOR_NAME=Pushbot
export GIT_AUTHOR_EMAIL=pushbot@azurefire.net

printf "Installing dependencies\n"
npm ci

printf "Creating production build\n"
npm run build

printf "Writing to gh-pages\n"

git add -f build/
TREE=$(git write-tree --prefix=build/)
git commit-tree "${TREE}" -p gh-pages

printf "Pushing built files\n"
git push origin gh-pages:gh-pages
