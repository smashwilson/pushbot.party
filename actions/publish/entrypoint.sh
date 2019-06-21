#!/bin/sh

set -eu

git config user.name "Pushbot"
git config user.email "pushbot@azurefire.net"

printf "Installing dependencies\n"
npm ci

printf "Creating production build\n"
npm run build

printf "Writing to gh-pages\n"

git branch --track gh-pages refs/remotes/origin/gh-pages
git add -f build/
TREE=$(git write-tree --prefix=build/)
COMMIT=$(git commit-tree "${TREE}" -p gh-pages -m "Built from ${GITHUB_SHA:-unknown sha}")
git update-ref refs/heads/gh-pages "${COMMIT}"

printf "Pushing built files\n"
git push origin gh-pages:gh-pages
