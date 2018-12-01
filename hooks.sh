#!/bin/sh

git fetch --all

git reset --hard

git pull origin $1

# Remove NPM packages

npm install # install new npm libraries

touch random.txt # force nodemon to restart if I send webhook myself

return
