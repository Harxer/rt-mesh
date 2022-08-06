import UserState from './UserState.js'
import InputPhysicsBody from '@harxer/engine-2d/entities/InputPhysicsBody.js'
import { Vector } from '@harxer/geometry'

export default function User(socket) {

  this.socket = socket
  this.id = socket && socket.id

  this.state = new UserState()
  this.enginePlayer = new InputPhysicsBody(100, 100)

  this.syncState = data => this.state.sync(data)

  this.lastSyncInput = 0
  this.syncInput = (timestamp, input) => {
    let dT = (timestamp - this.lastSyncInput) / 1000
    input = new Vector(input.x, input.y)
    this.enginePlayer.handleInput(dT, input)
    this.enginePlayer.update(dT)
    this.lastSyncInput = timestamp
    this.state.sync({
      x: this.enginePlayer.position.x,
      y: this.enginePlayer.position.y,
      angle: this.enginePlayer.rotation,
      velocity: this.enginePlayer.velocity
    })
  }

}
