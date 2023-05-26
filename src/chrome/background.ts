// import createMetaMaskProvider from 'metamask-extension-provider'
// import chrome from 'webextension-polyfill'
// import storage from '../utils/storage'
// import * as ENV from '../constants/env'
import { log } from '@/helpers/log'

function getTabInfo(tabId: number) {
	chrome.tabs.get(tabId)
}

chrome.tabs.onUpdated.addListener(function (tabId: any) {
	getTabInfo(tabId)
})

chrome.tabs.onActivated.addListener(function (activeInfo: any) {
	getTabInfo(activeInfo.tabId)
})

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'notify',
		title: 'WalletChat: %s',
		contexts: ['selection'],
	})

	// try {
	// 	let provider = createMetaMaskProvider()

	// 	provider.on('accountsChanged', handleAccountsChanged)

	// 	provider
	// 		.request({ method: 'eth_accounts' })
	// 		.then(handleAccountsChanged)
	// 		.catch((err) => {
	// 			// Some unexpected error.
	// 			// For backwards compatibility reasons, if no accounts are available,
	// 			// eth_accounts will return an empty array.
	// 			console.error(err)
	// 		})

	// 	function handleAccountsChanged(accounts: any) {
	// 		log('[background.ts] handleAccountsChanged')
	// 		if (accounts && accounts[0]) {
	// 			chrome.storage.local.set({
	// 				account: accounts[0],
	// 			})
	// 			getInboxCount(accounts[0])
	// 		}
	// 	}
	// } catch (e) {
	// 	log(e)
	// }
})

function startAlarm() {
	log('[background.ts] startAlarm')
	// Call fn immediately
	chrome.storage.local.get(['account'])

	// Create intervals to call alarm
	chrome.alarms.create('badgeUpdate', {
		periodInMinutes: 1 / 30,
		delayInMinutes: 0,
	})
}

const notify = (message: string) => {
	return chrome.notifications.create('', {
		type: 'basic',
		title: 'WalletChat',
		message: message || 'Enter your message here',
		iconUrl: './assets/icons/128.png',
	})
}

chrome.runtime.onStartup.addListener(() => {
	log('[background.ts] onStartup')
	startAlarm()
})
chrome.runtime.onConnect.addListener((port: any) => {
	log('[background.ts] onConnect', port)
})
chrome.runtime.onSuspend.addListener(() => {
	log('[background.ts] onSuspend')
})
chrome.runtime.onMessage.addListener((data: any) => {
	log('[background.ts] onMessage', data)
	if (data.type === 'notification') {
		notify(data.message)
	}
})

chrome.alarms.onAlarm.addListener((alarm: any) => {
	log('[background.ts] onAlarm')
	if (alarm.name === 'badgeUpdate') {
		chrome.storage.local.get(['account'])
	}
})

chrome.runtime.onInstalled.addListener((details: any) => {
	// When extension is installed or updated, set or reset the count variable in storage
	if (details.reason === 'update' || details.reason === 'install') {
		chrome.storage.local.set({
			count: 0,
		})
		// Start alarm when the extension is first installed.
		startAlarm()
	}
})

// function updateUnreadCountBadge(unreadCount: number) {
// 	switch (unreadCount) {
// 		case 0:
// 			chrome.action.setBadgeBackgroundColor({
// 				color: [110, 140, 180, 255],
// 			})
// 			chrome.action.setTitle({ title: 'No unread messages' })
// 			chrome.action.setBadgeText({ text: '' })
// 			break
// 		case 1:
// 			chrome.action.setBadgeBackgroundColor({
// 				color: '#1236AA',
// 			})
// 			chrome.action.setTitle({
// 				title: unreadCount + ' unread message',
// 			})
// 			chrome.action.setBadgeText({ text: unreadCount.toString() })
// 			break
// 		default:
// 			chrome.action.setBadgeBackgroundColor({
// 				color: '#1236AA',
// 			})
// 			chrome.action.setTitle({
// 				title: unreadCount + ' unread messages',
// 			})
// 			chrome.action.setBadgeText({ text: unreadCount.toString() })
// 			break
// 	}
// }

// async function getInboxCount(account: string) {
// 	log('[background.ts] getInboxCount', account)
// 	if (account) {
// 		fetch(
// 			` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_unread_cnt/${account}`,
// 			{
// 				method: 'GET',
// 				credentials: 'include',
// 				headers: {
// 					'Content-Type': 'application/json',
// 					Authorization: `Bearer ${}`,
// 				},
// 			}
// 		)
// 			.then((response) => response.json())
// 			.then((count: number) => {
// 				log('✅[GET][Unread Count]:', count)
// 				chrome.storage.local.get(['count'])
// 			})
// 			.catch((error) => {
// 				console.error('🚨[GET][Unread Count]:', error)
// 			})
// 	}
// }

export {}
