 #!/bin/bash

mkdir -p ./Server

svn checkout https://github.com/$1.git/trunk/Server ./Server \
  --username harrisonbalogh@gmail.com \
  --password $SVN_SECRET \
  --no-auth-cache \
  --non-interactive
