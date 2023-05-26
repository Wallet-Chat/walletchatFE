import { log } from '@/helpers/log'

export enum Sender {
	React,
	Content,
}

export interface ChromeMessage {
	from: Sender
	message: any
}

type MessageResponse = (response?: any) => void
const validateSender = (
	message: ChromeMessage,
	sender: chrome.runtime.MessageSender
) => {
	return sender.id === chrome.runtime.id && message.from === Sender.React
}
const messagesFromReactAppListener = (
	message: ChromeMessage,
	sender: chrome.runtime.MessageSender,
	response: MessageResponse
) => {
	const isValidated = validateSender(message, sender)
	if (isValidated) {
		log('sender.tab: ', sender.tab && sender.tab.url)
		log('request message: ', message)
		response(document.title)
	}
}
const main = () => {
	log('[content.ts] Main')
	/**
	 * Fired when a message is sent from either an extension process or a content script.
	 */
	chrome.runtime.onMessage.addListener(messagesFromReactAppListener)

	// SetTerminal to run every 5 seconds (5000 ms), setTimeout to run just on
	setTimeout(myMainFunction, 5000)
}
main()

async function myMainFunction() {
	const iframe = document.querySelector('iframe')
	if (iframe) {
		iframe.remove()
	}
}

var extensionOrigin = 'chrome-extension://' + chrome.runtime.id
if (!self.location.ancestorOrigins.contains(extensionOrigin)) {
	if (
		self.location.host === 'looksrare.org' ||
		self.location.host === 'x2y2.io' ||
		self.location.host === 'opensea.io'
	) {
		var iframe = document.createElement('iframe')
		// Must be declared at web_accessible_resources in manifest.json
		iframe.src = chrome.runtime.getURL('modal.html')

		// Some styles for a fancy sidebar
		iframe.style.cssText =
			'position:fixed;top:90px;right:10px;display:block;' +
			'width:202px;height:70px;z-index:1000000;border:none;background:none;pointer-events:none;'
		document.body.appendChild(iframe)
	}
}
