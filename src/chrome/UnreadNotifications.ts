import { EthereumEvents } from '../utils/events'
import { getNormalizeAddress } from '../utils'
import createMetaMaskProvider from 'metamask-extension-provider'

export default class UnreadNotifications {

   provider
   address: string | null

   constructor() {
      this.getUnreadCount()
      this.address = ""
      this.provider = window.ethereum ? window.ethereum : createMetaMaskProvider()

      if (this.provider && this.provider.on) {
         this.provider.on(EthereumEvents.ACCOUNTS_CHANGED, (accounts: any) => {
            this.address = getNormalizeAddress(accounts)
            console.log('[account change / Unread Notifications]', this.address)
         })
      }
   }

   getUnreadCount = async () => {

      if (this.address && this.address.length > 0) {
         fetch(   
            ` ${process.env.REACT_APP_REST_API}/get_unread_cnt/${this.address}`,
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
               chrome.browserAction.setBadgeBackgroundColor(
                  { color: '#F00' },
                  () => {
                     chrome.browserAction.setBadgeText({
                        text: count.toString(),
                     })
                  }
               )
            })
            .catch((error) => {
               console.error('🚨🚨REST API Error [GET]:', error)
            })
      }
   }

   clear = () => {
      chrome.browserAction.setBadgeText({})
   }
}