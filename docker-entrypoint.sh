#!/bin/sh
echo 'entrypoint script'
git config --global user.email ${GIT_EMAIL}
git config --global user.name ${GIT_USERNAME}

node lib/upgradePackage.js
npm start