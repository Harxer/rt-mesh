import { init as worldInit, getPlayerStateSync, getPlayerInputSync, syncPlayerState, addSyncPlayer, removeSyncPlayer } from '@harxer/engine-2d'
import { addSyncEvent } from '@harxer/engine-2d/engine'
import HXAuthModal, { logoutButton } from '@harxer/session-manager-lib/service_client/HXAuthModal'
import { login, validateSession } from '@harxer/session-manager-lib';
import * as RTMeshServiceClient from '@harxer/rt-mesh-lib'
import { AUTH_DOMAIN } from '@harxer/rt-mesh-lib/Constants.js'

validateSession(AUTH_DOMAIN).then(_ => {
  init()
}).catch(_ => {
  let loginModal = HXAuthModal((user, pwd) => {
    login(AUTH_DOMAIN, user, pwd).then(_ => {
      loginModal.parentNode.removeChild(loginModal);
      init()
    }).catch(_ => {})
  })
  window.document.body.appendChild(loginModal)
})

/** Returns a promise to escape outer promise block catch statement in validateSession */
function init() {
  return new Promise((resolve, _) => {

    worldInit(window.document.getElementById('bgCanvas'), window.document.getElementById('fgCanvas'))

    let toolbar = window.document.getElementById('toolbar')
    let newLogoutButton = logoutButton()
    toolbar.appendChild(newLogoutButton)

    RTMeshServiceClient.connect((guid, peers) => {
      toolbar.insertBefore(guidLabel(guid), newLogoutButton)

      addSyncPlayer(guid)
      peers.forEach(addSyncPlayer)

      RTMeshServiceClient.setNotifyAvailable((...args) => {
        addSyncPlayer(...args)
        updatePeersHtml()
      })
      RTMeshServiceClient.setNotifyExit((...args) => {
        removeSyncPlayer(...args)
        updatePeersHtml()
      })
      RTMeshServiceClient.setHandleBroadcast(stateBroadcast)

      updatePeersHtml()

      addSyncEvent(stateSync)

      resolve()
    })
  })
}

function stateSync(_, timestamp) {
  // RTMeshServiceClient.sync(getPlayerStateSync()) // State method
  RTMeshServiceClient.sync(getPlayerInputSync(timestamp)) // Input method
}

function stateBroadcast(msg) {
  syncPlayerState(msg.data)
}

function guidLabel(guid) {
  const label = document.createElement('p')
  label.style.color = "white"
  label.style.display = "inline-block"
  label.style.fontSize = "12px"
  label.style.margin = "5px"
  label.innerHTML = guid
  return label
}

function updatePeersHtml() {
  let peers = RTMeshServiceClient.getPeers()
  let peersListElement = window.document.getElementById('peers')
  peersListElement.innerHTML = ""

  if (peers.length === 0) return peersListElement.appendChild(guidLabel("No peers."))

  peers.forEach(peer => peersListElement.appendChild(guidLabel(peer)))
}
