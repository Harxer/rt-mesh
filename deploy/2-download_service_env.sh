#!/bin/bash

curl https://raw.githubusercontent.com/Harxer/environments/master/environments/$ENV.js \
  -o ./service/config.js \
  -H "Authorization: token $SVN_SECRET"
