 #!/bin/bash

cd ./Client
path=$HTTP_DIR/projects/$2
mkdir -p $path
# Rebuild client to include release changes
(npm install; npm run build --production; cp -a ./dist/. $path)
