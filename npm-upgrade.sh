#!/usr/bin/env sh

# you need to install: npm i -g npm-check-updates

rm package-lock.json

npm cache verify

npm outdated --depth=0

ncu -u

npm install

npm run build

npm test
