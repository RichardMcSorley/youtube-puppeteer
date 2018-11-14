#!/bin/sh

#pm2 stop 1

cd /root/puppet

git fetch --all

git reset --hard

git pull

# Remove NPM packages

#npm uninstall `ls -1 node_modules | tr '/\n' ' '`
#
#rm -rf node_modules

#npm install #install new npm libraries

#pm2 start 1 

return
