#!/bin/sh

echo 'Got command to pull from ' $1

git fetch --all

git reset --hard

git pull $1

# Remove NPM packages

npm install # install new npm libraries

touch random.txt # force nodemon to restart if I send webhook myself

return
