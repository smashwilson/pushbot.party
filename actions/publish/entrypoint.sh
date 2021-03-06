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

printf "Writing to gh-pages\n"

git fetch --depth 1 origin +refs/heads/gh-pages:refs/remotes/origin/gh-pages
git branch --track gh-pages refs/remotes/origin/gh-pages
echo 'pushbot.party' > build/CNAME
git add -f build/
TREE=$(git write-tree --prefix=build/)
COMMIT=$(git commit-tree "${TREE}" -p gh-pages -m "Built from ${GITHUB_SHA:-unknown sha}")
git update-ref refs/heads/gh-pages "${COMMIT}"

printf "Pushing built files\n"
git push --force deploy gh-pages:gh-pages
