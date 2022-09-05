 #!/bin/bash

(cd ./service; npm install; pm2 stop HxRtMeshService.js; pm2 del HxRtMeshService.js; pm2 start HxRtMeshService.js)
