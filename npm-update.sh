#!/usr/bin/env sh

# this sh is to see possible updates from NPM

npm cache verify

npm outdated --depth=0

npm install
