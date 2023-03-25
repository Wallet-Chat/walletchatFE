import React, { useCallback, useEffect } from 'react'
import equal from 'fast-deep-equal/es6'
import { useWallet } from './WalletProvider'
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'

export const UnreadCountContext = React.createContext()
export const useUnreadCount = () => React.useContext<any>(UnreadCountContext)

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
      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/unreadcount/${account}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (!equal(data, unreadCount)) {
            console.log('✅[GET][unread Count]:', data)
            //let total_cnt = Object.values(data).reduce((a, b) => a + b);
            //for now we only have DMs in widget so only sent DM unread count
            let total_cnt = data.dm

            //send message to parent for notifications when using widget
            let msg = {
              data: total_cnt,
              target: 'unread_cnt',
            }
            window.parent.postMessage(msg, '*') //targertOrigin should be a .env variable

            setUnreadCount(data)
            if (typeof data === 'object') {
              setTotalUnreadCount(data?.dm + data?.nft + data?.community)
            }
          }
        })
        .catch((error) => {
          console.error('🚨[GET][Unread Count]:', error)
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
        totalUnreadCount,
      }}
    >
      {children}
    </UnreadCountContext.Provider>
  )
})

export default UnreadCountProvider
