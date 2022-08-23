 #!/bin/bash

mkdir -p ./Client

svn checkout https://github.com/$1.git/trunk/Client ./Client \
  --username harrisonbalogh@gmail.com \
  --password $SVN_SECRET \
  --no-auth-cache \
  --non-interactive
