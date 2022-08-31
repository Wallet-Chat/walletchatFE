// import createMetaMaskProvider from 'metamask-extension-provider'

let activeTabId: number,
   lastUrl: string | undefined,
   lastTitle: string | undefined

chrome.storage.onChanged.addListener((changes, namespace) => {
   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
         `Storage key "${key}" in namespace "${namespace}" changed.`,
         `Old value was "${oldValue}", new value is "${newValue}".`
      )
   }
})
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
   // console.log('[chrome.tabs.onUpdated', tabId, changeInfo, tab)
   getTabInfo(tabId)
})
chrome.tabs.onActivated.addListener(function (activeInfo) {
   // console.log('[chrome.tabs.onActivated', activeInfo)
   getTabInfo((activeTabId = activeInfo.tabId))
})
chrome.runtime.onInstalled.addListener((details) => {
   console.log('[background.ts] onInstalled', details)

   chrome.contextMenus.create({
      id: 'notify',
      title: 'WalletChat: %s',
      contexts: ['selection'],
   })

   // try {
   //    let provider = createMetaMaskProvider()

   //    provider.on('accountsChanged', handleAccountsChanged)

   //    provider
   //       .request({ method: 'eth_accounts' })
   //       .then(handleAccountsChanged)
   //       .catch((err) => {
   //          // Some unexpected error.
   //          // For backwards compatibility reasons, if no accounts are available,
   //          // eth_accounts will return an empty array.
   //          console.error(err)
   //       })

   //    function handleAccountsChanged(accounts: any) {
   //       console.log('[background.ts] handleAccountsChanged')
   //       if (accounts && accounts[0]) {
   //          chrome.storage.local.set({
   //             account: accounts[0],
   //          })
   //          getInboxCount(accounts[0])
   //       }
   //    }
   // } catch (e) {
   //    console.log(e)
   // }
})
chrome.runtime.onStartup.addListener(() => {
   console.log('[background.ts] onStartup')
   startAlarm()
})
chrome.runtime.onConnect.addListener((port) => {
   console.log('[background.ts] onConnect', port)
})
chrome.runtime.onSuspend.addListener(() => {
   console.log('[background.ts] onSuspend')
})
chrome.runtime.onMessage.addListener((data) => {
   console.log('[background.ts] onMessage', data)
   if (data.type === 'notification') {
      notify(data.message)
   }
})
chrome.alarms.onAlarm.addListener((alarm) => {
   console.log('[background.ts] onAlarm')
   if (alarm.name === 'badgeUpdate') {
      chrome.storage.local.get(['account'], (data) => {
         if (data.account) {
            getInboxCount(data.account)
         }
      })
   }
})
chrome.runtime.onInstalled.addListener((details) => {
   //When extension is installed or updated, set or reset the count variable in storage
   if (details.reason === 'update' || details.reason === 'install') {
      chrome.storage.local.set({
         count: 0,
      })
      // Start alarm when the extension is first installed.
      startAlarm()
   }
})

function startAlarm() {
   console.log('[background.ts] startAlarm')
   // Call fn immediately
   chrome.storage.local.get(['account'], (data) => {
      if (data.account) {
         getInboxCount(data.account)
      }
   })

   // Create intervals to call alarm
   chrome.alarms.create('badgeUpdate', {
      periodInMinutes: 1 / 30,
      delayInMinutes: 0,
   })
}

async function getInboxCount(account: string) {
   console.log('[background.ts] getInboxCount', account)
   if (account) {
      fetch(` ${process.env.REACT_APP_REST_API}/get_unread_cnt/${account}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
         },
      })
         .then((response) => response.json())
         .then((count: number) => {
            console.log('✅[GET][Unread Count]:', count)
            chrome.storage.local.get(['count'], (data) => {
               //Get the count variable from storage, then, in this callback I can call setBadgeText.
               updateUnreadCountBadge(count)
               chrome.storage.local.set({ count: count })
            })
         })
         .catch((error) => {
            console.error('🚨[GET][Unread Count]:', error)
         })
   }
}

function getTabInfo(tabId: number) {
   chrome.tabs.get(tabId, function (tab) {
      if (lastUrl !== tab.url || lastTitle !== tab.title)
         window.dispatchEvent(
            new CustomEvent('urlChangedEvent', { detail: tab.url })
         )
   })
}

function updateUnreadCountBadge(unreadCount: number) {
   switch (unreadCount) {
      case 0:
         chrome.action.setBadgeBackgroundColor({
            color: [110, 140, 180, 255],
         })
         chrome.action.setTitle({ title: 'No unread messages' })
         chrome.action.setBadgeText({ text: '' })
         break
      case 1:
         chrome.action.setBadgeBackgroundColor({
            color: '#1236AA',
         })
         chrome.action.setTitle({
            title: unreadCount + ' unread message',
         })
         chrome.action.setBadgeText({ text: unreadCount.toString() })
         break
      default:
         chrome.action.setBadgeBackgroundColor({
            color: '#1236AA',
         })
         chrome.action.setTitle({
            title: unreadCount + ' unread messages',
         })
         chrome.action.setBadgeText({ text: unreadCount.toString() })
         break
   }
}

const notify = (message: string) => {
   return chrome.notifications.create('', {
      type: 'basic',
      title: 'WalletChat',
      message: message || 'Enter your message here',
      iconUrl: './assets/icons/128.png',
   })
}

export {}
