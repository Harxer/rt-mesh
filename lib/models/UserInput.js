export default function UserInput() {
  this.broadcastInput = {
    x: 0,
    y: 0
  }

  this.sync = inputVector => {
    this.broadcastInput.x = inputVector.x()
    this.broadcastInput.y = inputVector.y()
    return this.broadcastInput
  }
}
