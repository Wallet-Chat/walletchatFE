import { ChromeMessage, Sender } from '../types/ChromeTypes'
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
      console.log('sender.tab: ', sender.tab && sender.tab.url)
      console.log('request message: ', message)
      response(document.title)
   }
}
const main = () => {
   console.log('[content.ts] Main')
   /**
    * Fired when a message is sent from either an extension process or a content script.
    */
   chrome.runtime.onMessage.addListener(messagesFromReactAppListener)
}
main()

var extensionOrigin = 'chrome-extension://' + chrome.runtime.id
if (!window.location.ancestorOrigins.contains(extensionOrigin)) {
   if (
      window.location.host === 'looksrare.org' ||
      window.location.host === 'x2y2.io' ||
      window.location.host === 'opensea.io'
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
