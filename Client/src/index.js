import { init as worldInit, getPlayerStateSync, getPlayerInputSync, syncPlayerState, addSyncPlayer, toggleCorrectDesync, removeSyncPlayer } from '@harxer/engine-2d'
import { addSyncEvent } from '@harxer/engine-2d/engine.js'
import HXAuthModal, { logoutButton } from '@harxer/session-manager-lib/helpers/HxAuthModal.js'
import { login, validateSession } from '@harxer/session-manager-lib';
import * as RTMeshServiceClient from '@harxer/rt-mesh-lib'
import Config from './config.js';

validateSession(Config.url.auth).then(_ => {
  init()
}).catch(_ => {
  let loginModal = HXAuthModal((user, pwd) => {
    login(Config.url.auth, user, pwd).then(_ => {
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

      addSyncPlayer(guid, true)
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

import { setLerpTime, SYNC_LERP_TIME, toggleShowPredictState, toggleShowDebug } from '@harxer/engine-2d/entities/SyncGoop.js'
document.getElementById('button-lerp-sync').onclick = e => {
  let enabled = !!setLerpTime(SYNC_LERP_TIME === 0 ? 0.05 : 0)
  e.target.innerHTML = enabled ? "Smooth Sync On" : "Smooth Sync Off"
  e.target.className = enabled ? "enabled" : "disabled"
}
document.getElementById('button-predict-state').onclick = e => {
  let enabled = toggleShowPredictState()
  e.target.innerHTML = enabled ? "Latency Compensation On" : "Latency Compensation Off"
  e.target.className = enabled ? "enabled" : "disabled"
}
document.getElementById('button-correct-desync').onclick = e => {
  let enabled = toggleCorrectDesync()
  e.target.innerHTML = enabled ? "Desync Correction On" : "Desync Correction Off"
  e.target.className = enabled ? "enabled" : "disabled"
}
document.getElementById('button-show-debug').onclick = e => {
  let enabled = toggleShowDebug()
  e.target.innerHTML = enabled ? "Debug On" : "Debug Off"
  e.target.className = enabled ? "enabled" : "disabled"
}
