#!/bin/sh

systemctl stop puppet-nod@1 # force stop of service

git pull "origin" $1 #$1 is branch

npm install #install new npm libraries

systemctl restart puppet-nod@1 # force restart of service

return