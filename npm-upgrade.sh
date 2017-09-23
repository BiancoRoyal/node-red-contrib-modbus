#!/usr/bin/env bash
npm install -g npm-check-updates

npm outdated

ncu -u --upgradeAll --packageFile package.json

npm install
