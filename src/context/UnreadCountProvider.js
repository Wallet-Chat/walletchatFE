import React, { useCallback, useEffect } from 'react'
import equal from 'fast-deep-equal/es6'
import { useWallet } from './WalletProvider'

//import { get } from  "../services/api"
import { setCookie } from '../helpers'  

export const UnreadCountContext = React.createContext()
export const useUnreadCount = () => React.useContext(UnreadCountContext)

export function withUnreadCount(Component) {
   const WalletComponent = (props) => (
      <UnreadCountContext.Consumer>
         {(contexts) => <Component {...props} {...contexts} />}
      </UnreadCountContext.Consumer>
   )
   return WalletComponent
}

const UnreadCountProvider = React.memo(({ children }) => {
   const [unreadCount, setUnreadCount] = React.useState(0)
   const [totalUnreadCount, setTotalUnreadCount] = React.useState(0)
   const { account } = useWallet()

   const getUnreadCount = useCallback(() => {
      if (account) {
         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/unreadcount/${account}`, {
            method: 'GET',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
         })
            .then((response) => response.json())
            .then((data) => {
               if (!equal(data, unreadCount)) {
                  console.log('✅[GET][unread Count]:', data)
                  let total_cnt = Object.values(data).reduce((a, b) => a + b);
                  // Send a string to the parent window.
                  window.parent.postMessage(total_cnt, "*");
                  setUnreadCount(data)
                  if (typeof data === 'object') {
                     setTotalUnreadCount(data?.dm + data?.nft + data?.community)
                  }
               }
            })
            .catch((error) => {
               console.error('🚨[GET][unread Count]:', error)
            })
      }
   }, [account, unreadCount])

   useEffect(() => {
      getUnreadCount()
   }, [getUnreadCount])

   useEffect(() => {
      const interval = setInterval(() => {
         getUnreadCount()
      }, 5000) // every 5s

      return () => {
         clearInterval(interval)
      }
   }, [account, unreadCount, getUnreadCount])

   return (
      <UnreadCountContext.Provider
         value={{
            unreadCount,
            setUnreadCount,
            totalUnreadCount
         }}
      >
         {children}
      </UnreadCountContext.Provider>
   )
})

export default UnreadCountProvider
