 #!/bin/bash

cd ./Client

# Rebuild client to include release changes
(npm install; npm run build --production; cp -a ./dist/. $HTTP_DIR)
