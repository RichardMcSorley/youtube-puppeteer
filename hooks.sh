#!/bin/sh

echo '$1 = ' $1

git fetch --all

git reset --hard

git pull

# Remove NPM packages

npm install #install new npm libraries

return
