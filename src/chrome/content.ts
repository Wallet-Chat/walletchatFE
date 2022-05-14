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

var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
if (!window.location.ancestorOrigins.contains(extensionOrigin)) {
    var iframe = document.createElement('iframe');
    // Must be declared at web_accessible_resources in manifest.json
    iframe.src = chrome.runtime.getURL('modal.html');

    // Some styles for a fancy sidebar
    iframe.style.cssText = 'position:fixed;top:0;right:0;display:block;' +
                           'width:161px;height:56px;z-index:1000;border:none;background:none;';
    document.body.appendChild(iframe);
}