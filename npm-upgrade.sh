#!/usr/bin/env bash

npm outdated

ncu -u --upgradeAll --packageFile package.json

npm install
