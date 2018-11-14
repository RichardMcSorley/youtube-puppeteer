#!/bin/sh
cd /root/puppet

git fetch --all

git reset --hard origin/master

git pull origin/master

# Remove NPM packages

ren package.json package.json-bak

echo {} > package.json

npm prune

del package.json

ren package.json-bak package.json

npm install #install new npm libraries

return