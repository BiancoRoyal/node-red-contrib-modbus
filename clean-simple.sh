#!/usr/bin/env sh

node -v

rm -rf node_modules/

rm -rf modbus/

rm -rf code/

rm -rf .nyc_output/

rm -rf coverage/

rm -rf docs/gen

rm package-lock.json

rm yarn.lock

npm run clean

npm cache verify

npm install

npm i --only=dev

yarn

npm run build

npm run rewrite-changelog

node -v

npm audit
