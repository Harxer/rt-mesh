#!/bin/bash

curl https://raw.githubusercontent.com/Harxer/environments/master/environments/$ENV.js \
  -o ./client/src/config.js \
  -H "Authorization: token $SVN_SECRET"
