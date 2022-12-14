/// RelayClient is a service client for the Relay service.
/// The Relay service connects and relays messages between users.
/// It will establish handshakes for tethering clients together
/// with a WebRTC.
///
/// Author: Harrison Balogh (2022)

/** Relay server socket connection. */
let serverSocket;
/** Assigned client GUID from Relay server socket. */
let guid;
/** Timer for keeping socket connection alive. */
let pulseTimer;
/** Track peers */
let peers = new Set()
export const getPeers = () => Array.from(peers)

const supportsWebSocket = _ => ("WebSocket" in window)
const socketOpen = _ => (serverSocket && serverSocket.readyState === serverSocket.OPEN)

export const SEND_TYPE = {
    Deny: 'deny',
    Receive: 'recv',
    Cancel: 'cancel',
    Relay: 'relay',
    Ping: 'ping',
    Pong: 'pong',
    Broadcast: 'broadcast',
    Sync: 'sync',
    Pulse: 'pulse'
}

/** Notifier functions. */
const NOTIFY_DEFAULTS = {
    available: () => {},
    exit: () => {},
    close: () => {},
    connect: () => {}
}
let notify = NOTIFY_DEFAULTS
/** Set callback for 'available' message. When client is assigned a GUID. */
export const setNotifyAvailable = callback => notify.available = callback
/** Set callback for 'exit' message. When a peer disconnects. */
export const setNotifyExit = callback => notify.exit = callback
/** Set callback for 'close' event. When socket connection closes. */
export const setNotifyClose = callback => notify.close = callback
/** Set callback for 'broadcast' message. When a peer sends something to this client. */
export const setHandleBroadcast = callback => MESSAGE_HANDLERS[SEND_TYPE.Broadcast] = callback

/** Get client GUID. If not connected, returns undefined. */
export const getGuid = _ => guid

/** Checks if Relay server socket connection is open and a GUID is assigned. */
export const isConnected = _ => (socketOpen() && guid !== undefined)

/**
 * Opens a WebSocket to Signal server.
 * @param {function} onConnect callback for successful connection with GUID assignment
 * @returns boolean indicating onConnect attached to socket open
 */
export function connect(url, onConnect, onError = () => {}) {
    if (!supportsWebSocket()) {
        console.error("WebSocket not supported.")
        throw new Error("WebSocket not supported.")
    }

    if (serverSocket) disconnect()

    serverSocket = new WebSocket(url) // TODO: Can pass in 'json' as 2nd arg for auto parsing?

    notify.connect = onConnect

    serverSocket.onopen = handlerOnOpen
    serverSocket.onmessage = handlerOnMessage
    serverSocket.onclose = handlerOnClose

    serverSocket.onerror = onError
}

/** Closes the socket connection to the relay server. */
export function disconnect() {
    if (serverSocket) serverSocket.close()
    serverSocket = undefined
    guid = undefined
    peers = new Set()
}

/** Relay data to a target peer by GUID through the relay server socket. */
export function sync(data) {
    send(SEND_TYPE.Sync, data)
}

/** Handle socket 'open' event. */
function handlerOnOpen() {
    pulse()
}
/** Handle socket 'close' event. */
function handlerOnClose() {
    clearTimeout(pulseTimer)
    serverSocket = undefined
    notify.close()
    notify = NOTIFY_DEFAULTS
}
/** Handle socket 'message' event. */
function handlerOnMessage(evt) {
    let msg = JSON.parse(evt.data)
    MESSAGE_HANDLERS[msg.type](msg)
}

/**
 * Sends a data package to the Relay server. Requires an open Relay socket connection.
 * @param {SEND_TYPE} type - A string enum denoting type of message.
 * @param {*} target - A peer set to receive the package.
 * @param {*} data - JSON for target to receive.
 */
 function send(type, data) {
    if (type === undefined) throw new Error("RelayClient error. Type is undefined.")
    if (!socketOpen()) return
    serverSocket.send(JSON.stringify({type, data}))
}

/** Sets up timer and sends periodic pulse to keep socket connection open. */
function pulse() {
    if (!serverSocket || !socketOpen()) {
        if (pulseTimer) clearTimeout(pulseTimer)
        pulseTimer = undefined
        return
    }

    send(SEND_TYPE.Pulse)

    const PULSE_TIME = 20000
    clearTimeout(pulseTimer)
    pulseTimer = setTimeout(pulse, PULSE_TIME);
}

/** Map of message types to handler functions. */
const MESSAGE_HANDLERS = {
    "conn": handlerOnConnection,
    "avail": handlerOnAvailable,
    "ping": handlePing,
    "exit": handlerOnExit,
    "broadcast": () => {}
}

/** Handles 'available' message. Notifies 'available' listener. */
function handlerOnAvailable(msg) {
    if (msg.source === guid) return
    peers.add(msg.source)
    notify.available(msg.source)
}
/**
 * Handles 'connection' message. Stores client guid. Notifies 'connection' listener.
 * */
function handlerOnConnection(msg) {
    guid = msg.guid
    msg.users.forEach(client => peers.add(client))
    notify.connect(guid, msg.users)
}

function handlePing() {
  send(SEND_TYPE.Pong)
}

/** Handles 'exit' message. Notifies 'exit' listener. */
function handlerOnExit(msg) {
    peers.delete(msg.user)
    notify.exit(msg.user)
}

/** NYI - May remove? */
function handlerOnCancel() {}
/** NYI - May remove? */
function handlerOnFail() {}
/** NYI - May remove? */
function handlerOnDeny() {}
