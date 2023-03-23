import * as wagmi from '@wagmi/core'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'

import React, { useState } from 'react'
import Web3 from 'web3'
import { SiweMessage } from 'siwe'

import { AnalyticsBrowser } from '@segment/analytics-next'

import storage from '../utils/extension-storage'
import Lit from '../utils/lit'
import * as ENV from '@/constants/env'
import { getFetchOptions } from '@/helpers/fetch'
import { endpoints, setAccount, upsertQueryData } from '@/redux/reducers/dm'
import { useAppDispatch } from '@/hooks/useDispatch'
import { getIsWidgetContext } from '@/utils/context'
import {
  getHasJwtForAccount,
  getJwtForAccount,
  parseJwt,
  storeJwtForAccount,
} from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'

// TODO: Context Type
export const WalletContext = React.createContext<any>(null)
export const useWallet = () => React.useContext(WalletContext)

const isWidget = getIsWidgetContext()

/* eslint-disable react/display-name */
const WalletProvider = React.memo(
  ({ children }: { children: React.ReactElement }) => {
    const dispatch = useAppDispatch()

    const prevAccount = React.useRef<null | string>()
    const prevNonce = React.useRef<null | string>()
    const siwePendingRef = React.useRef<boolean>(false)

    const provider = wagmi.getProvider()

    const [chainId, setChainId] = React.useState(wagmi.getNetwork()?.chain?.id)

    const accountAddress = useAppSelector((state) => state.dm.account)
    const accountAuthenticated =
      accountAddress && chainId ? getHasJwtForAccount(accountAddress) : null

    const [isAuthenticated, setAuthenticated] = useState(accountAuthenticated)

    const [nonce, setNonce] = React.useState<string | null>()
    const [email, setEmail] = useState(null)
    const [notifyDM, setNotifyDM] = useState('true')
    const [notify24, setNotify24] = useState('true')
    const [delegate, setDelegate] = useState<null | string>(null)

    const [siwePending, setSiwePending] = React.useState<boolean>(false)
    const [siweFailed, setSiweFailed] = React.useState(false)

    const [parentProvider, setParentProvider] = React.useState<null | any>()
    const [widgetOpen, setWidgetOpen] = React.useState(false)

    const { currentData: name } = endpoints.getName.useQueryState(
      accountAddress?.toLocaleLowerCase()
    )

    // help debug issues and watch for high traffic conditions
    const analytics = AnalyticsBrowser.load({
      writeKey: ENV.REACT_APP_SEGMENT_KEY,
    })
    const OneDay = 1 * 24 * 60 * 60 * 1000

    const updateName = React.useCallback(
      (newName: null | string, address: undefined | string) =>
        dispatch(
          upsertQueryData(
            'getName',
            address
              ? address.toLocaleLowerCase()
              : accountAddress?.toLocaleLowerCase(),
            newName
          )
        ),
      [accountAddress, dispatch]
    )

    const accountUnwatch = wagmi.watchAccount((wagmiAccount) =>
      dispatch(setAccount(wagmiAccount?.address))
    )
    const networkUnwatch = wagmi.watchNetwork((wagmiNetwork) =>
      setChainId(wagmiNetwork?.chain?.id)
    )

    const getSettings = React.useCallback((address: string) => {
      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_settings/${address}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(address)}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log('✅[GET][Settings]:', data)
          if (data[0]?.email) {
            console.log('-[Email]:', data[0].email)
            setEmail(data[0].email)
          }
          if (data[0]?.notifydm) {
            console.log('-[notifydm]:', data[0].notifydm)
            setNotifyDM(data[0].notifydm)
          }
          if (data[0]?.notify24) {
            console.log('-[notify24]:', data[0].notify24)
            setNotify24(data[0].notify24)
          }
        })
        .catch((error: any) => {
          console.error('🚨[GET][Setting]:', error)
        })
    }, [])

    const signIn = React.useCallback(
      (address: string, jwt: string) => {
        Lit.connectManual()

        console.log('✅[INFO][JWT]:', jwt)

        // if we log in with a full delegate, act as the vault
        const walletInJWT = parseJwt(jwt).sub
        if (walletInJWT.toLocaleLowerCase() !== address.toLocaleLowerCase()) {
          console.log(
            '✅[Using Full Delegate Wallet]:',
            walletInJWT,
            accountAddress
          )
          storage.set('delegate', address)
          setDelegate(address) // not sure this is used anymore
          setAccount(walletInJWT)
        }

        dispatch(
          endpoints.getName.initiate(accountAddress?.toLocaleLowerCase())
        )

        getSettings(address)

        if (isWidget) {
          window.parent.postMessage({ data: true, target: 'sign_in' }, '*')
        }
      },
      [accountAddress, dispatch, getSettings]
    )

    React.useEffect(() => {
      setAuthenticated(accountAuthenticated)
    }, [accountAuthenticated])

    React.useEffect(() => {
      if (analytics && accountAddress && name && email) {
        analytics.identify(accountAddress, { name, email })
      }
    }, [accountAddress, analytics, email, name])

    function getNonce(address: string) {
      fetch(` ${ENV.REACT_APP_REST_API}/users/${address}/nonce`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => response.json())
        .then(async (usersData: any) => {
          console.log('✅[GET][Nonce]:', usersData)
          setNonce(usersData.Nonce)
        })
        .catch((error) => {
          console.log('🚨[GET][Nonce]:', error)
        })
    }

    React.useEffect(() => {
      if (accountAddress && (!isWidget || widgetOpen)) {
        setAccount(accountAddress)

        if (prevAccount.current !== accountAddress.toString()) {
          prevAccount.current = accountAddress.toString()

          // limit wallet connection recording to once per day
          ;(async () => {
            const lastTimestamp = await storage.get(
              'last-wallet-connection-timestamp'
            )
            const currentTime = new Date().getTime()
            if (currentTime - lastTimestamp > OneDay) {
              analytics.track('ConnectWallet', {
                site: document.referrer,
                account: accountAddress,
              })
              storage.set('last-wallet-connection-timestamp', currentTime)
            }
          })()

          fetch(
            ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/welcome`,
            getFetchOptions(accountAddress)
          )
            .then((response) => response.json())
            .then(async (welcomeData) => {
              console.log('✅[GET][Welcome]:', welcomeData.msg)

              if (
                !welcomeData.msg.includes(accountAddress.toLocaleLowerCase()) &&
                !accountAddress.includes(storage.get('delegate'))
              ) {
                getNonce(accountAddress)
              } else {
                const currentName = welcomeData.msg.toString().split(':')[1]

                if (currentName) {
                  updateName(currentName, accountAddress)
                  console.log('✅[Name]:', currentName)
                } else {
                  updateName(null, accountAddress)
                }

                // safe to pass jwt here because we know it exists due to
                // successful welcome call, the extra || '' is just to
                // satisfy typescript
                signIn(accountAddress, getJwtForAccount(accountAddress) || '')
              }
            })
            .catch((welcomeError) => {
              console.log('🚨[GET][Welcome]:', welcomeError)
              getNonce(accountAddress)
            })
        }
      } else if (isWidget && widgetOpen && !accountAddress) {
        window.parent.postMessage({ data: false, target: 'sign_in' }, '*')
      } else if (isWidget && !widgetOpen && accountAddress) {
        // notify the widget that we are signed in
        window.parent.postMessage({ data: true, target: 'sign_in' }, '*')
      }
    }, [OneDay, analytics, accountAddress, updateName, signIn, widgetOpen])

    React.useEffect(() => {
      if (!isWidget) return

      window.addEventListener('message', (e) => {
        const data = e.data

        const {
          data: messageData,
          target,
        }: {
          data:
            | undefined
            | null
            | {
                isInjected: boolean
                connectorOptions: null | {
                  projectId: string
                  address: string
                  chainId: number
                }
              }
          target: undefined | string
        } = data

        if (target === 'widget_open') {
          setWidgetOpen(true)
        }

        if (target === 'sign_in') {
          if (messageData) {
            if (messageData.isInjected) {
              setParentProvider({ connector: new wagmi.InjectedConnector() })
            } else if (messageData.connectorOptions) {
              setParentProvider({
                connector: new WalletConnectConnector({
                  options: {},
                }),
              })
            }
          } else if (messageData === null) {
            setParentProvider(null)
          }
        }
      })
    }, [])

    React.useEffect(() => {
      return () => {
        if (accountUnwatch) {
          accountUnwatch()
        }
        if (networkUnwatch) {
          networkUnwatch()
        }
      }
    }, [accountUnwatch, networkUnwatch])

    const doRequestSiwe = React.useCallback(async () => {
      if (
        accountAddress &&
        nonce &&
        chainId &&
        !getHasJwtForAccount(accountAddress) &&
        !siwePendingRef.current &&
        prevNonce.current !== nonce
      ) {
        const domain = window.location.hostname
        const origin = window.location.protocol + domain
        const statement =
          'You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.'

        setSiwePending(true)
        siwePendingRef.current = true

        const siweMessage = new SiweMessage({
          domain,
          address: accountAddress,
          statement,
          uri: origin,
          version: '1',
          chainId,
          nonce,
        })

        const messageToSign = siweMessage.prepareMessage()
        const signer = await wagmi.fetchSigner()

        let signature
        try {
          signature = await signer?.signMessage(messageToSign)
        } catch (error) {
          console.log('🚨[SIWE][Failed or Rejected]:', error)
        }

        setSiwePending(false)
        siwePendingRef.current = false

        if (!signature) {
          setSiweFailed(true)
          return
        }

        setSiweFailed(false)

        const authSig = {
          sig: signature,
          derivedVia: 'web3.eth.personal.sign',
          signedMessage: messageToSign,
          address: accountAddress.toLocaleLowerCase(),
        }

        console.log('✅[INFO][AuthSig]:', authSig)

        fetch(`${ENV.REACT_APP_REST_API}/signin`, {
          body: JSON.stringify({
            name: chainId.toString(),
            address: accountAddress,
            nonce,
            msg: messageToSign,
            sig: signature,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
          .then((response) => response.json())
          .then(async (signInData) => {
            storeJwtForAccount(accountAddress, signInData.access)
            setAuthenticated(true)
            localStorage.setItem('lit-auth-signature', JSON.stringify(authSig))

            signIn(accountAddress, signInData.access)
          })

        prevNonce.current = nonce
      }
    }, [accountAddress, chainId, nonce, signIn])

    React.useEffect(() => {
      doRequestSiwe()
    }, [doRequestSiwe])

    const disconnectWallet = React.useCallback(async () => {
      accountUnwatch()
      networkUnwatch()
      wagmi.disconnect()

      const rkRecent = localStorage.getItem('rk-recent')
      localStorage.clear()
      if (rkRecent) localStorage.setItem('rk-recent', rkRecent)

      prevAccount.current = null
      setNonce(null)
      setSiweFailed(false)
    }, [accountUnwatch, networkUnwatch])

    const contextValue = React.useMemo(
      () => ({
        name,
        email,
        notifyDM,
        notify24,
        setName: updateName,
        setEmail,
        setNotifyDM,
        setNotify24,
        account: accountAddress?.toLowerCase(),
        disconnectWallet,
        isAuthenticated,
        web3: provider && new Web3(provider),
        provider,
        delegate,
        parentProvider,
        siweFailed,
        siwePending,
        doRequestSiwe,
      }),
      [
        accountAddress,
        delegate,
        email,
        isAuthenticated,
        name,
        notify24,
        notifyDM,
        provider,
        updateName,
        parentProvider,
        siweFailed,
        siwePending,
        doRequestSiwe,
        disconnectWallet,
      ]
    )

    return (
      <WalletContext.Provider value={contextValue}>
        {children}
      </WalletContext.Provider>
    )
  }
)

export default WalletProvider
