// Lobby Socket Server
import * as rtMeshServer from './api/router.js'

const WEBSOCKET_PORT = 10003;
rtMeshServer.listen(WEBSOCKET_PORT);

console.log(`${new Date()} - RTMesh service started. Port(${WEBSOCKET_PORT})`);
