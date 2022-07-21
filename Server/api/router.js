// import jwt from 'jsonwebtoken'
import { fail, MSG_TYPE as MsgType } from './controller.js'
import ws from 'ws';
import { domain } from '../config.js'
import * as HXAuthServiceClient from './HXAuthServiceClient.js'
const WebSocketServer = ws.Server

// const jwt = require('jsonwebtoken'),
//       Controller = require('./controller'),
//       MsgType = Controller.MSG_TYPE,
//       // fs = require('fs'),
//       // secret = JSON.parse(fs.readFileSync("key.json")).secret,
//       WebSocketServer = require('ws').Server,
//       domain = require("../config.js").domain;
//       HXAuthServiceClient = require('./HXAuthServiceClient');

import GameStateModel from 'hx-rtmesh-lib/models/Game.js'
// const UserModel = require('hx-rtmesh-lib/User')
// import * as Engine from 'hx-engine/engine.js'

const verifyClient = (info, verified) => {
  if (domain == "localhost") return verified(true)

  if (info.req.headers.cookie === undefined) {
    console.log("No JWT.")
    return verified(false, 403, 'No token provided')
  }
  let token = info.req.headers.cookie.replace("jwt=","");
  if (!token) {
    console.log("Denied access to WebSocket. No token provided.");
    verified(false, 403, 'No token provided.');
  } else {
    HXAuthServiceClient.validate(token).then(_ => {
      verified(true);
    }).catch(e => {
      console.log(`${new Date()} - Failed to authenticate: ${e}`)
      verified(false, 403, 'Failed to authenticate.')
    }); // TODO
    // jwt.verify(token, secret, function (err, decoded) {
    //   if (err) {
    //     console.log("Denied access to WebSocket. Invalid token.");
    //     verified(false, 403, 'Failed to authenticate.')
    //   } else {
    //     info.req.decoded = decoded;
    //     if (decoded.privilege < 0) {
    //       verified(false, 401, 'You do not have permission to use this module.')
    //     }
    //     verified(true);
    //   }
    // })
  }
}

let broadcastTimer = undefined
const BROADCAST_TIME = 50

const gameState = new GameStateModel()
// exports.lobbies = []; // {gameModel.users: []}

export const listen = port => {
  let socketServer = new WebSocketServer({port, verifyClient})
  socketServer.on('connection', (socket, req) => {
    let user = gameState.newUser(socket)

    console.log(`${new Date()} - Connected client ${gameState._users.length} with ID(${user.id}) from IP(${req.headers['x-real-ip']}).`)

    // Inform other gameModel.users of new peer with 'avail' message
    gameState._users.filter(u => u.id != user.id).forEach(u => u.socket.send(JSON.stringify({type: MsgType.Available, source: user.id})))

    // Inform new client of its GUID and peers with 'conn' message
    let peers = gameState._users.map(u => u.id).filter(id => id != user.id)
    socket.send(JSON.stringify({type: MsgType.Connected, guid: user.id, users: peers}));

    socket.on('message', msg => handleOnMessage(msg, user))
    socket.on('close', _ => handleOnClose(user))
  })

  broadcast()
}

/** Socket 'message' event handler. */
function handleOnMessage(msg, user) {
  msg = JSON.parse(msg);
  if (msg.type === MsgType.Pulse) return // Pulse messages can be discarded

  // do something with socket.id
  if (msg.type === MsgType.Sync) {

    // gameState._userMap[user.id].syncState(msg.data)
    let timestamp = Date.now()
    gameState.syncInput(timestamp, user.id, msg.data)

    return
  }

  fail(msg, "Unrecognized message type.")
}

/** Periodic emitter */
function broadcast() {
  gameState._users.forEach(user => {
    // user.socket.send(JSON.stringify({type: MsgType.Broadcast, data: gameState.broadcastState()}))
    user.socket.send(JSON.stringify({type: MsgType.Broadcast, data: gameState.broadcastState()}))
  })

  broadcastTimer = setTimeout(broadcast, BROADCAST_TIME)
}

/** Socket 'close' event handler. */
function handleOnClose(user) {
  // Remove this socket from list
  gameState.dropUser(user)
  // Inform other sockets of the socket closing
  gameState._users.forEach(u => u.socket.send(JSON.stringify({type: MsgType.Exit, user: user.id})))
}
