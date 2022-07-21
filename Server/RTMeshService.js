// const rand = require('csprng'),
//       fs = require('fs');

// // Config - Generate JWT secret key and Githook key
// // fs.writeFileSync('key.json', JSON.stringify({secret: rand(128,10)}));
// fs.writeFileSync('key.json', JSON.stringify({secret: '194474947823712565876113878932905260727'}));

// Lobby Socket Server
// let rtMeshServer = require("./api/router.js");
import * as rtMeshServer from './api/router.js'

const WEBSOCKET_PORT = 10001;
rtMeshServer.listen(WEBSOCKET_PORT);

console.log(`${new Date()} - RTMesh service started. Port(${WEBSOCKET_PORT})`);
