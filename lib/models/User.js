import UserState from './UserState.js'
import InputPhysicsBody from '@harxer/engine-2d/entities/InputPhysicsBody.js'
import { Vector } from '@harxer/geometry'

export default function User(socket) {

  this.socket = socket
  this.id = socket && socket.id

  this.ping = 100 / 1000 // ms - used for state prediction
  this.lastPingCheck = 0

  this.state = new UserState()
  this.lastSync = {
    timestamp: 0,
    input: new Vector(0, 0)
  }
  this.enginePlayer = new InputPhysicsBody(100, 100)

  this.syncState = data => this.state.sync(data)

  this.lastSyncInput = 0
  this.syncInput = (timestamp, input) => {
    let dT = (timestamp - this.lastSync.timestamp) / 1000
    input = new Vector(input.x, input.y)
    this.enginePlayer.handleInput(dT, input)
    this.enginePlayer.update(dT)
    this.lastSync = {timestamp, input}

    this.state.sync({
      x: this.enginePlayer.position.x,
      y: this.enginePlayer.position.y,
      angle: this.enginePlayer.rotation,
      velocity: this.enginePlayer.velocity
    })
  }

  this.predictState = (timestamp) => {
    let inputVector = this.lastSync.input
    let delta = timestamp - this.lastSync.timestamp

    let inputMagnitude = Math.min(inputVector.magnitude(), delta) * this.enginePlayer.INPUT_ACCELERATION_MAX * this.enginePlayer.mass
    let inputRotation = inputVector.angle()
    let inputResult = Vector.fromMagnitudeAngle(inputMagnitude, inputRotation)
    return {
      x: this.enginePlayer.position.x + (this.enginePlayer.velocity.x() + inputResult.x()) * this.ping,
      y: this.enginePlayer.position.y + (this.enginePlayer.velocity.y() + inputResult.y()) * this.ping
    }
  }

  this.handlePong = (timestamp) => {
    // TODO: Over 1 sec ping? Do something
    const SYNC_LERP_TIME = 50 // TODO read from client lib ?
    this.ping = (timestamp - this.lastPingCheck + SYNC_LERP_TIME) / 1000
  }
}
