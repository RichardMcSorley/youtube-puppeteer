#!/bin/sh

git fetch --all

git reset --hard

git pull origin $1

npm install

npm test

docker-compose build

docker-compose down

docker-compose up

return
