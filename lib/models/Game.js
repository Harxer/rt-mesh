import User from './User.js'

export default function GameState() {
  this._userMap = {/** id: User */}
  this._users = [/** User */]

  this.newUser = socket => {
    socket.id = this.generateId()
    let user = new User(socket)

    this._users.push(user)
    this._userMap[user.id] = user

    return user
  }
  this.dropUser = user => {
    delete this._users[user.id]
    this._users.splice(this._users.indexOf(user), 1)
  }

  this.generateId = () => {
    return hashString(`${new Date()}${Object.keys(this._users.length)}`)
  }

  this.broadcastState = (timestamp) => this._users.map(u => ({
    id: u.id,
    state: u.state.state,
    predictState: u.predictState(timestamp)
  }))

  this.syncInput = (timestamp, id, data) => {
    this._userMap[id].syncInput(timestamp, data)
  }
}

/**
 * Helper for hashing a given string.
 * @param {String} str
 * @returns Hash of given string.
 */
 function hashString(str) {
  let res = 0,
      len = str.length;
  for (let i = 0; i < len; i++) {
    res = res * 31 + str.charCodeAt(i);
    res |= 0;
  }
  return (res >>> 0); // force number above zero
 }
