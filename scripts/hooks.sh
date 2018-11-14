#!/bin/sh

git pull "origin" $1 #$1 is branch

rm -rf node_modules # remove any unwanted libraries

npm install #install new npm libraries

return