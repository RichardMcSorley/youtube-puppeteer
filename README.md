# Puppeteer Youtube Server

### CI-CD

hooks.js will accept webhooks from github
A new push to repo will run hook.sh script

### hooks.sh:

pulls latest code from github
runs tests
builds a new server image
shutsdown server
runs latest server
