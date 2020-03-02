#!/usr/bin/env bash

rm -rf node_modules/

rm package-lock.json

npm cache verify

npm i

npm i --only=dev

npm run build
