import UnreadNotifications from './UnreadNotifications'
import createMetaMaskProvider from 'metamask-extension-provider'
import { getNormalizeAddress } from '../utils'

chrome.runtime.onMessage.addListener((data) => {
   console.log('chrome.runtime.onMessage', data)
   if (data.type === 'notification') {
      notify(data.message)
   }
})

chrome.storage.onChanged.addListener((changes, namespace) => {
   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
         `Storage key "${key}" in namespace "${namespace}" changed.`,
         `Old value was "${oldValue}", new value is "${newValue}".`
      )
   }
})

chrome.runtime.onInstalled.addListener((details) => {
   console.log('[background.ts] onInstalled', details)

   scheduleRequest(5000)

   chrome.contextMenus.create({
      id: 'notify',
      title: 'WalletChat: %s',
      contexts: ['selection'],
   })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
   if ('notify' === info.menuItemId) {
      if (info.selectionText) {
         notify(info.selectionText)
      }
   }
})

const notify = (message: string) => {
   chrome.storage.local.get(['notifyCount'], (data) => {
      let value = data.notifyCount || 0
      chrome.storage.local.set({ notifyCount: Number(value) + 1 })
   })

   return chrome.notifications.create('', {
      type: 'basic',
      title: 'WalletChat',
      message: message || 'Enter your message here',
      iconUrl: './assets/icons/128.png',
   })
}

chrome.runtime.onConnect.addListener((port) => {
   console.log('[background.ts] onConnect', port)
})

chrome.runtime.onSuspend.addListener(() => {
   console.log('[background.ts] onSuspend')
})

async function getUnreadNotificationsCount() {

   console.log('[background.ts][getUnreadNotificationsCount]')
   let provider = window.ethereum ? window.ethereum : createMetaMaskProvider()

   if (provider) {
      const [accounts, chainId] = await Promise.all([
         provider.request({
            method: 'eth_requestAccounts',
         }),
         provider.request({ method: 'eth_chainId' }),
      ])

      const account = getNormalizeAddress(accounts)

      fetch(
         ` ${process.env.REACT_APP_REST_API}/get_unread_cnt/${account}`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
         .then((response) => response.json())
         .then((count) => {
            console.log('✅ [GET][Unread Notifications] UNREAD COUNT:', count)
            setCount(count.toString())
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [GET]:', error)
         })
   }
}

function setCount(count: string) {
   chrome.action.setBadgeText({
      text: count,
   })
   chrome.action.setBadgeBackgroundColor(
      { color: '#F00000' }
   )
}

// let unread = new UnreadNotifications()
let requestTimer

console.log('[background.ts] body')

function scheduleRequest(interval: number) {
   console.log('[background.ts] scheduleRequest')

   if (interval != null) {
      window.setTimeout(getUnreadNotificationsCount, interval)
   } else {
      requestTimer = window.setTimeout(getUnreadNotificationsCount, 10000)
      window.setTimeout(scheduleRequest, 10000)
   }
}

scheduleRequest(5000)

export {}
