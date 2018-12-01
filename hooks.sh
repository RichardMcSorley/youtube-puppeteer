#!/bin/sh

#pm2 stop 1

git fetch --all

git reset --hard

git pull

# Remove NPM packages

npm install #install new npm libraries

#pm2 start 1 

return
