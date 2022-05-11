chrome.runtime.onMessage.addListener((data) => {
   if (data.type === 'notification') {
      notify(data.message)
   }
})

chrome.runtime.onInstalled.addListener((details) => {
   console.log('[background.ts] onInstalled', details)

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

export {}
