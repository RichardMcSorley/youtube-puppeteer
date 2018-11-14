#!/bin/sh

pm2 stop all

cd /root/puppet

git fetch --all

git reset --hard 'origin/master'

git pull 'origin' 'master'

# Remove NPM packages

npm uninstall `ls -1 node_modules | tr '/\n' ' '`

rm -rf node_modules

npm install #install new npm libraries

pm2 start all

return
