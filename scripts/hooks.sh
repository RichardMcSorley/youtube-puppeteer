#!/bin/sh
cd /root/puppet

git fetch --all

git reset --hard origin/master

git pull origin/master

# Remove NPM packages

npm uninstall `ls -1 node_modules | tr '/\n' ' '`

npm install #install new npm libraries

return