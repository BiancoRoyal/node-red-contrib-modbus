#!/usr/bin/env bash

npm cache verify

# npm install -g npm-check-updates

npm outdated --depth=0

ncu -u --upgradeAll --packageFile package.json

npm install
