'use strict';
import ws from 'ws'
const SOCKET_OPEN = ws.OPEN

export const MSG_TYPE = {
  Available: "avail",
  Exit: "exit",
  Connected: "conn",
  Pulse: "pulse",

  Sync: "sync",
  Broadcast: "broadcast",
}

/**
 * Send fail message to msg source socket.
 * @param {*} msg - The failed message data with source/target as socket object.
 * @param {*} error - OPTIONAL Error message sent with message.
 */
export function fail(msg, error = 'No specific error set.') {
  if (msg.source.readyState !== SOCKET_OPEN) return

  let target = msg.source
  // Preserve target field and convert for stringify
  msg.target = msg.target.id
  msg.source = msg.source.id

  target.send(JSON.stringify({type: MSG_TYPE.Fail, msg, error}));
}
