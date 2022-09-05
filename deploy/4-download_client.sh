 #!/bin/bash

mkdir -p ./client

svn checkout https://github.com/$1.git/trunk/Client ./client \
  --username harrisonbalogh@gmail.com \
  --password $SVN_SECRET \
  --no-auth-cache \
  --non-interactive
