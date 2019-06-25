#!/bin/sh

set -eu

printf "Configuring authentication and deploy key"
mkdir -p /root/.ssh
ssh-keyscan -t rsa github.com > /root/.ssh/known_hosts
echo "${DEPLOY_KEY}" > /root/.ssh/id_rsa
chmod 400 /root/.ssh/id_rsa
git remote add deploy "git@github.com:${GITHUB_REPOSITORY}.git"

git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"

printf "Installing dependencies\n"
npm ci

printf "Running Relay compiler\n"
npm run relay-compiler

printf "Creating production build\n"
npm run build

printf "Writing to gh-pages\n"

git branch --track gh-pages refs/remotes/origin/gh-pages
echo 'pushbot.party' > build/CNAME
git add -f build/
TREE=$(git write-tree --prefix=build/)
COMMIT=$(git commit-tree "${TREE}" -p gh-pages -m "Built from ${GITHUB_SHA:-unknown sha}")
git update-ref refs/heads/gh-pages "${COMMIT}"

printf "Pushing built files\n"
git push deploy gh-pages:gh-pages
