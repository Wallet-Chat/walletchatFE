import * as wagmi from '@wagmi/core'

import React from 'react'
import Web3 from 'web3'
import { SiweMessage } from 'siwe'

import { AnalyticsBrowser } from '@segment/analytics-next'

import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import {
  configureChains,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useProvider,
} from 'wagmi'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'

import { mainnet, polygon, optimism, celo } from 'wagmi/chains'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

import { API } from 'react-wallet-chat/dist/src/types'
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
import { getWidgetUrl, postMessage } from '@/helpers/widget'

export const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, celo],
  [infuraProvider({ apiKey: ENV.REACT_APP_INFURA_ID }), publicProvider()]
)

const APP_NAME = 'WalletChat'

export const { connectors } = getDefaultWallets({
  appName: APP_NAME,
  chains,
})

// help debug issues and watch for high traffic conditions
const analytics = AnalyticsBrowser.load({
  writeKey: ENV.REACT_APP_SEGMENT_KEY,
})

const isWidget = getIsWidgetContext()

/* eslint-disable react/display-name */
const WalletProviderContext = () => {
  const dispatch = useAppDispatch()

  const didDisconnect = React.useRef<boolean>(false)
  const prevAccount = React.useRef<null | string>()
  const prevNonce = React.useRef<null | string>()
  const siwePendingRef = React.useRef<boolean>(false)
  const widgetWalletDataRef = React.useRef<
    | undefined
    | {
        account: string
        chainId: number
        requestSignature?: boolean
      }
  >()
  const previousWidgetData = React.useRef(widgetWalletDataRef.current)
  const [widgetWalletData, setWidgetWalletData] = React.useState<
    undefined | { account: string; chainId: number }
  >()
  const pendingConnect = React.useRef<boolean>(false)

  const siweAttempted = React.useRef<boolean>(false)
  const siweFailedRef = React.useRef<boolean>(false)
  const currentWidgetHost = React.useRef<{
    domain: string
    origin: string
  } | null>(null)

  const [connectConfig, setConnectConfig] = React.useState<any>()

  const currentProvider = useProvider()

  const { chain } = useNetwork()
  const [chainId, setChainId] = React.useState(chain?.id)

  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()

  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const accountAddress = useAppSelector(
    (state) => state.dm.account || wagmiAddress
  )

  const initialJwt = accountAddress && storage.get('jwt')
  const accountAuthenticated =
    accountAddress && chainId && wagmiConnected
      ? getHasJwtForAccount(accountAddress)
      : null

  const [isAuthenticated, setAuthenticated] =
    React.useState(accountAuthenticated)

  const [nonce, setNonce] = React.useState<string | null>()
  const [email, setEmail] = React.useState(null)
  const [notifyDM, setNotifyDM] = React.useState('true')
  const [notify24, setNotify24] = React.useState('true')
  const [delegate, setDelegate] = React.useState<null | string>(null)
  const [widgetAuthSig, setWidgetAuthSig] = React.useState<
    undefined | { signature: undefined | null | string; signedMsg: string }
  >()
  const widgetSignature = widgetAuthSig?.signature

  const [siwePending, setSiwePending] = React.useState<boolean>(false)
  const [siweLastFailure, setSiweLastFailure] = React.useState<null | number>(
    null
  )

  const { currentData: name } = endpoints.getName.useQueryState(
    accountAddress?.toLocaleLowerCase()
  )

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
        dispatch(setAccount(walletInJWT))
      }

      dispatch(endpoints.getName.initiate(accountAddress?.toLocaleLowerCase()))

      getSettings(address)
      setAuthenticated(true)

      pendingConnect.current = false
    },
    [accountAddress, dispatch, getSettings]
  )

  React.useEffect(() => {
    setAuthenticated(accountAuthenticated)

    if (storage.get('app-version') !== '3.0.1') {
      localStorage.clear()
      storage.set('app-version', '3.0.1')
      window.location.reload()
    }
  }, [initialJwt, accountAuthenticated])

  React.useEffect(() => {
    if (analytics && accountAddress && name && email) {
      analytics.identify(accountAddress, { name, email })
    }
  }, [accountAddress, email, name])

  function getNonce(address: string) {
    fetch(` ${ENV.REACT_APP_REST_API}/users/${address}/nonce`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then(async (usersData: { Nonce: string }) => {
        console.log('✅[GET][Nonce]:', usersData)
        setNonce(usersData.Nonce)
      })
      .catch((error) => {
        console.log('🚨[GET][Nonce]:', error)
      })
  }

  React.useEffect(() => {
    if (isWidget) {
      if (!accountAddress) {
        postMessage({ data: false, target: 'is_signed_in' })
      } else {
        // notify the widget that we are signed in
        postMessage({ data: true, target: 'is_signed_in' })
      }
    }

    if (accountAddress) {
      if (
        prevAccount.current?.toLocaleLowerCase() !==
        accountAddress.toLocaleLowerCase()
      ) {
        prevAccount.current = accountAddress.toLocaleLowerCase()

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
    }
  }, [accountAddress, updateName, signIn])

  // Updates the necessary state to signIn to WalletChat with an account based on widget provided data
  // Currently only needs account address & chainId
  const updateAccountFromWidget = React.useCallback(
    // withSignature forces a SIWE signature request
    (withSignature?: boolean) => {
      if (!widgetWalletDataRef.current) {
        widgetWalletDataRef.current = previousWidgetData.current
      }

      if (widgetWalletDataRef.current) {
        setWidgetAuthSig(undefined)

        widgetWalletDataRef.current = {
          ...widgetWalletDataRef.current,
          requestSignature: Boolean(withSignature),
        }

        dispatch(setAccount(widgetWalletDataRef.current.account))
        setChainId(widgetWalletDataRef.current.chainId)
        didDisconnect.current = false

        connect(connectConfig)
      }
    },
    [connect, connectConfig, dispatch]
  )

  const clearWidgetData = React.useCallback(() => {
    setWidgetAuthSig(undefined)
    widgetWalletDataRef.current = undefined
    setWidgetWalletData(undefined)
  }, [])

  React.useEffect(() => {
    if (!isWidget) return

    const eventListener = async (e: MessageEvent) => {
      const { data, origin }: { data: API; origin: string } = e

      if (getWidgetUrl()) {
        postMessage({ data: getWidgetUrl(), target: 'url_env' })
      }

      const currentOrigin = storage.get('current-widget-origin')
      if (currentOrigin !== origin) {
        storage.set('current-widget-origin', origin)
      }

      if (data.target === 'origin') {
        currentWidgetHost.current = data.data
      }

      const { data: messageData, target }: API = data

      if (target === 'signed_message') {
        setWidgetAuthSig(messageData)
      }

      if (target === 'sign_in' && messageData) {
        const shouldRequestSignature = messageData.requestSignature
        const widgetAccountChanged =
          widgetWalletDataRef?.current?.account !== messageData.account &&
          !didDisconnect.current

        if (widgetAccountChanged) {
          widgetWalletDataRef.current = messageData
          setWidgetWalletData(widgetWalletDataRef.current)
          updateAccountFromWidget(
            pendingConnect.current || shouldRequestSignature
          )

          let connector
          const walletIs = (walletName: string) =>
            messageData.walletName.toLowerCase().includes(walletName)

          if (walletIs('metamask')) {
            connector = new MetaMaskConnector({ chains })
            storage.set('current-widget-provider', 'metamask')
          }

          if (walletIs('coinbase')) {
            connector = new CoinbaseWalletConnector({
              chains,
              options: {
                appName: APP_NAME,
                jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${ENV.REACT_APP_ALCHEMY_API_KEY_ETHEREUM}`,
              },
            })
            storage.set('current-widget-provider', 'coinbase')
          }

          if (
            walletIs('connect') ||
            walletIs('gooddollar') ||
            walletIs('zengo')
          ) {
            connector = new WalletConnectLegacyConnector({
              chains,
              options: {
                qrcode: true,
              },
            })
            storage.set('current-widget-provider', 'wallet-connect')
          }

          if (connector && !wagmiConnected) {
            connect({ chainId: messageData.chainId, connector })
            setConnectConfig({ chainId: messageData.chainId, connector })
          }
        }
      }
    }

    window.addEventListener('message', eventListener)
    return () => window.removeEventListener('message', eventListener)
  }, [
    disconnect,
    wagmiConnected,
    connect,
    accountAddress,
    dispatch,
    updateAccountFromWidget,
    isAuthenticated,
  ])

  React.useEffect(() => {
    if (isAuthenticated && wagmiConnected) {
      const analyticsRecord = async () => {
        // limit wallet connection recording to once per day
        const lastTimestamp = await storage.get(
          'last-wallet-connection-timestamp'
        )
        const currentTime = new Date().getTime()
        const oneDay = 1 * 24 * 60 * 60 * 1000

        if (currentTime - lastTimestamp > oneDay) {
          analytics.track('ConnectWallet', {
            site: document.referrer,
            account: accountAddress,
          })
          storage.set('last-wallet-connection-timestamp', currentTime)
        }
      }

      analyticsRecord()

      const origin = storage.get('current-widget-origin')
      storage.push('widget-logins', origin)
    }
  }, [accountAddress, isAuthenticated, wagmiConnected])

  React.useEffect(() => {
    const accountUnwatch = wagmi.watchAccount(({ address }) => {
      if (!address) {
        if (prevAccount.current === null) {
          // Fallback for when signed out and this effect re-ran
          // revert prevAccount to default state so can log back in
          prevAccount.current = undefined
        }
      } else if (
        prevAccount.current &&
        prevAccount.current !== address.toLocaleLowerCase()
      ) {
        Lit.disconnect()
        disconnect()
      } else {
        didDisconnect.current = false
      }

      dispatch(setAccount(address))
    })
    const networkUnwatch = wagmi.watchNetwork((wagmiNetwork) =>
      setChainId(wagmiNetwork?.chain?.id)
    )

    return () => {
      accountUnwatch()
      networkUnwatch()
    }
  }, [disconnect, dispatch])

  const requestSIWEandFetchJWT = React.useCallback(async () => {
    const walletIsConnected = accountAddress && chainId

    const accountHasNoJwt =
      accountAddress && !getHasJwtForAccount(accountAddress)

    const hasNewNonce = prevNonce.current !== nonce
    const requestAlreadyInitiated = siwePendingRef.current

    const preventDuplicateRequests = !requestAlreadyInitiated && hasNewNonce
    const hasPendingWidgetSignature = widgetAuthSig !== undefined

    // in the pending widget signature case, the function has only requested SIWE, but not fetched JWT yet
    // so it will need to be called again in order to fetch the JWT, so it will skip the SIWE request
    const shouldRequestJwt =
      preventDuplicateRequests || hasPendingWidgetSignature

    const needsToRequestJwt =
      walletIsConnected && nonce && accountHasNoJwt && shouldRequestJwt

    if (needsToRequestJwt) {
      setSiwePending(true)
      siwePendingRef.current = true

      let signature = widgetAuthSig?.signature
      let messageToSign = widgetAuthSig?.signedMsg

      const shouldRetrySignature = siweFailedRef.current
      const widgetRequestedSIWE =
        widgetWalletDataRef.current?.requestSignature &&
        widgetSignature !== null

      const shouldRequestSIWE = widgetWalletDataRef.current
        ? widgetRequestedSIWE
        : !siweAttempted.current || shouldRetrySignature
      const needsToRequestSIWE = !signature && shouldRequestSIWE

      if (needsToRequestSIWE) {
        const domain = window.location.host
        const origin = window.location.protocol + domain
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

        messageToSign = siweMessage.prepareMessage()

        const signer = await wagmi.fetchSigner()

        try {
          signature = await signer?.signMessage(messageToSign)
        } catch (error) {
          console.log('🚨[SIWE][Failed or Rejected]:', error)
        }

        siweAttempted.current = true
      }

      setSiwePending(false)
      siwePendingRef.current = false

      if (!signature || !messageToSign) {
        if (
          !widgetWalletDataRef.current ||
          widgetWalletDataRef.current.requestSignature
        ) {
          setSiweLastFailure(Date.now())
          siweFailedRef.current = true
        }

        return
      }

      setSiweLastFailure(null)
      siweFailedRef.current = false
      siweAttempted.current = false

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

          const currentSigs = storage.get('lit-auth-signature-by-account')
          storage.set('lit-auth-signature-by-account', {
            ...currentSigs,
            [accountAddress.toLocaleLowerCase()]: authSig,
          })
          Lit.setAuthSig(accountAddress)

          signIn(accountAddress, signInData.access)
        })

      prevNonce.current = nonce
    }

    return true
  }, [widgetAuthSig, accountAddress, chainId, nonce, signIn, widgetSignature])

  React.useEffect(() => {
    requestSIWEandFetchJWT()
  }, [requestSIWEandFetchJWT])

  const disconnectWallet = React.useCallback(async () => {
    didDisconnect.current = true

    Lit.disconnect()
    disconnect()

    dispatch(setAccount(null))
    setNonce(null)
    setSiweLastFailure(null)
    siweFailedRef.current = false
    setAuthenticated(false)
  }, [disconnect, dispatch])

  React.useEffect(() => {
    if (widgetWalletData) {
      previousWidgetData.current = widgetWalletData
    }
  }, [widgetWalletData])

  return React.useMemo(
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
      web3: currentProvider && new Web3(currentProvider),
      signIn,
      provider: currentProvider,
      delegate,
      siweLastFailure,
      siwePending,
      requestSIWEandFetchJWT,
      resetWidgetDataWithSignature: () => updateAccountFromWidget(true),
      widgetWalletData,
      pendingConnect,
      clearWidgetData,
      previousWidgetData,
    }),
    [
      accountAddress,
      delegate,
      email,
      isAuthenticated,
      name,
      notify24,
      notifyDM,
      currentProvider,
      updateName,
      signIn,
      siweLastFailure,
      siwePending,
      requestSIWEandFetchJWT,
      disconnectWallet,
      updateAccountFromWidget,
      widgetWalletData,
      pendingConnect,
      clearWidgetData,
      previousWidgetData,
    ]
  )
}

export const WalletContext = React.createContext<
  ReturnType<typeof WalletProviderContext>
>({})

export const useWallet = () => React.useContext(WalletContext)

const WalletProvider = React.memo(
  ({ children }: { children: React.ReactElement }) => {
    const value = WalletProviderContext()

    return (
      <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
    )
  }
)

export default WalletProvider
