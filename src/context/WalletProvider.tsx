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
import {
  endpoints,
  setAccount as setAccountAddress,
  upsertQueryData,
} from '@/redux/reducers/dm'
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

    const prevAccount = React.useRef<string>()

    const provider = wagmi.getProvider()

    const [chainId, setChainId] = React.useState(wagmi.getNetwork()?.chain?.id)

    const [account, setAccount] = React.useState(wagmi.getAccount())
    const accountAddress = useAppSelector((state) => state.dm.account)
    const [nonce, setNonce] = React.useState<string | null>()
    const [email, setEmail] = useState(null)
    const [notifyDM, setNotifyDM] = useState('true')
    const [notify24, setNotify24] = useState('true')
    const [isAuthenticated, setAuthenticated] = useState(
      Boolean(accountAddress && getHasJwtForAccount(accountAddress) && chainId)
    )
    const [delegate, setDelegate] = useState<null | string>(null)

    const [isSigningIn, setIsSigningIn] = React.useState(false)
    const [siweFailed, setSiweFailed] = React.useState(false)

    const [parentProvider, setParentProvider] = React.useState<null | any>()
    const [widgetOpen, setWidgetOpen] = React.useState(false)

    const { data: name } = endpoints.getName.useQueryState(
      accountAddress?.toLocaleLowerCase()
    )

    // help debug issues and watch for high traffic conditions
    const analytics = AnalyticsBrowser.load({
      writeKey: ENV.REACT_APP_SEGMENT_KEY,
    })
    const OneDay = 1 * 24 * 60 * 60 * 1000

    const setName = React.useCallback(
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

    wagmi.watchAccount((wagmiAccount) => {
      setAccount(wagmiAccount)
      dispatch(setAccountAddress(wagmiAccount?.address))
    })
    wagmi.watchNetwork((wagmiNetwork) => {
      const newChainId = wagmiNetwork?.chain?.id
      setChainId(newChainId)

      if (!newChainId) {
        setAuthenticated(false)
      } else {
        setAuthenticated(true)
      }
    })

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
          setAccountAddress(walletInJWT)
        }

        dispatch(
          endpoints.getName.initiate(accountAddress?.toLocaleLowerCase())
        )

        getSettings(address)

        if (isWidget) {
          window.parent.postMessage({ data: true, target: 'sign_in' }, '*')
        }

        setAuthenticated(true)
        setIsSigningIn(false)
      },
      [accountAddress, dispatch, getSettings]
    )

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
      setIsSigningIn(true)

      const address = account && account.address
      if (address && (!isWidget || widgetOpen)) {
        setAccountAddress(address)

        if (prevAccount.current !== address.toString()) {
          prevAccount.current = address.toString()

          // limit wallet connection recording to once per day
          ;(async () => {
            const lastTimestamp = await storage.get(
              'last-wallet-connection-timestamp'
            )
            const currentTime = new Date().getTime()
            if (currentTime - lastTimestamp > OneDay) {
              analytics.track('ConnectWallet', {
                site: document.referrer,
                account: address,
              })
              storage.set('last-wallet-connection-timestamp', currentTime)
            }
          })()

          fetch(
            ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/welcome`,
            getFetchOptions(address)
          )
            .then((response) => response.json())
            .then(async (welcomeData) => {
              console.log('✅[GET][Welcome]:', welcomeData.msg)

              if (
                !welcomeData.msg.includes(address.toLocaleLowerCase()) &&
                !address.includes(storage.get('delegate'))
              ) {
                getNonce(address)
              } else {
                const currentName = welcomeData.msg.toString().split(':')[1]

                if (currentName) {
                  setName(currentName, address)
                  console.log('✅[Name]:', currentName)
                } else {
                  setName(null, address)
                }

                // safe to pass jwt here because we know it exists due to
                // successful welcome call, the extra || '' is just to
                // satisfy typescript
                signIn(address, getJwtForAccount(address) || '')
              }
            })
            .catch((welcomeError) => {
              console.log('🚨[GET][Welcome]:', welcomeError)
              getNonce(address)
            })
        }
      } else if (isWidget && widgetOpen && !address) {
        window.parent.postMessage({ data: false, target: 'sign_in' }, '*')
      } else if (isWidget && !widgetOpen && address) {
        // notify the widget that we are signed in
        window.parent.postMessage({ data: true, target: 'sign_in' }, '*')
      }

      setIsSigningIn(false)
    }, [OneDay, analytics, account, setName, signIn, widgetOpen])

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
                  options: {
                    projectId: messageData.connectorOptions.projectId,
                    version: '2',
                  },
                }),
              })
            }
          } else if (messageData === null) {
            setParentProvider(null)
          }
        }
      })
    }, [])

    const doRequestSiwe = React.useCallback(async () => {
      if (accountAddress && nonce && chainId) {
        setIsSigningIn(true)

        const domain = 'walletchat.fun'
        const origin = 'https://walletchat.fun'
        const statement =
          'You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.'

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

        if (!signature) {
          setIsSigningIn(false)
          setSiweFailed(true)
          return
        }

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
            localStorage.setItem('lit-auth-signature', JSON.stringify(authSig))

            signIn(accountAddress, signInData.access)
          })

        setAuthenticated(true)
      }
    }, [accountAddress, chainId, nonce, signIn])

    React.useEffect(() => {
      doRequestSiwe()
    }, [doRequestSiwe])

    const disconnectWallet = async () => {
      wagmi.disconnect()

      const rkRecent = localStorage.getItem('rk-recent')
      localStorage.clear()
      if (rkRecent) localStorage.setItem('rk-recent', rkRecent)

      document.location.reload()
    }

    const contextValue = React.useMemo(
      () => ({
        name,
        email,
        notifyDM,
        notify24,
        setName,
        setEmail,
        setNotifyDM,
        setNotify24,
        account: accountAddress?.toLowerCase(),
        disconnectWallet,
        isAuthenticated,
        web3: provider && new Web3(provider),
        provider,
        delegate,
        isSigningIn,
        parentProvider,
        siweFailed,
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
        setName,
        isSigningIn,
        parentProvider,
        siweFailed,
        doRequestSiwe,
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
