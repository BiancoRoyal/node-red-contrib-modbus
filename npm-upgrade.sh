#!/usr/bin/env sh

# this sh is to upgrade all package dependencies from NPM
# you need to install before: npm i -g npm-check-updates

rm package-lock.json

npm cache verify

npm outdated --depth=0

ncu -u -m

npm install

npm run build

npm test
