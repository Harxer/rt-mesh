export default function UserState() {
  this.state = {
    x: 0,
    y: 0,
    angle: 0,
    velocityMagnitude: 0,
    velocityAngle: 0,
    lastVelocityMagnitude: 0,
    lastVelocityAngle: 0
  }

  this.sync = data => {
    this.state.x = data.x
    this.state.y = data.y
    this.state.angle = data.angle
    this.lastVelocityMagnitude = this.velocityMagnitude
    this.lastVelocityAngle = this.velocityAngle
    this.velocityMagnitude = data.velocity.magnitude()
    this.velocityAngle = data.velocity.angle()
    return this.state
  }
}
