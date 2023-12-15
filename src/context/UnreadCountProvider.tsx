import React, { useCallback, useEffect } from 'react'
import equal from 'fast-deep-equal/es6'
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'
import { getIsWidgetContext } from '@/utils/context'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount, selectIsAuthenticated } from '@/redux/reducers/account'
import { log } from '@/helpers/log'

const isWidget = getIsWidgetContext()

export const UnreadCountContext = React.createContext<any>(null)
export const useUnreadCount = () => React.useContext<any>(UnreadCountContext)

const UnreadCountProvider = ({ children }: { children: any }) => {
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [totalUnreadCount, setTotalUnreadCount] = React.useState(0)

  const account = useAppSelector((state) => selectAccount(state))
  const isAuthenticated = useAppSelector((state) =>
    selectIsAuthenticated(state)
  )

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
            log('✅[GET][Unread Count]:', data)

            try {
              //code specific to being loaded in a WebView - send if we are in Android app - otherwise just fail out of the catch
              const message = {
                target: 'unread_cnt',
                data: data.dm,
              };
              window.ReactNativeWebView.postMessage(JSON.stringify(message));
            } catch {}
  
            // send message to parent for notifications when using widget
            if (isWidget) {
              window.parent.postMessage(
                {
                  data: data.dm,
                  target: 'unread_cnt',
                },
                '*' // targertOrigin should be a .env variable
              )
            }

            setUnreadCount(data)
            if (
              Number.isInteger(data?.dm) &&
              Number.isInteger(data?.nft) &&
              Number.isInteger(data?.community)
            ) {
              setTotalUnreadCount(data.dm + data.nft + data.community)
            }
          }
        })
        .catch((error) => console.error('🚨[GET][Unread Count]:', error))
    }
  }, [account, unreadCount])

  useEffect(() => {
    if (isAuthenticated) {
      getUnreadCount()

      const interval = setInterval(getUnreadCount, 5000) // every 5s

      return () => clearInterval(interval)
    }
    else {
      try {
        //code specific to being loaded in a WebView - send if we are in Android app - otherwise just fail out of the catch
        const message = {
          target: 'unread_cnt',
          data: 1,
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      } catch {}

      // send message to parent for notifications when using widget
      if (isWidget) {
        setUnreadCount(1)
        window.parent.postMessage(
          {
            data: 1,
            target: 'unread_cnt',
          },
          '*' // targertOrigin should be a .env variable
        )
      }
    }
  }, [getUnreadCount, isAuthenticated])

  const value = React.useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      totalUnreadCount,
    }),
    [unreadCount, totalUnreadCount]
  )

  return (
    <UnreadCountContext.Provider value={value}>
      {children}
    </UnreadCountContext.Provider>
  )
}

export default UnreadCountProvider
