#!/usr/bin/env sh

# this sh is to upgrade all package dependencies from NPM
# you need to install before: npm i -g npm-check-updates

rm package-lock.json

npm cache verify

npm outdated --depth=0

ncu -u

npm i

npm i --only=dev

npm install

npm test

npm run build
