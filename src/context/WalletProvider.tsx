import * as wagmi from '@wagmi/core'

import React from 'react'
import Web3 from 'web3'
import { SiweMessage } from 'siwe'

import { AnalyticsBrowser } from '@segment/analytics-next'
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import ReactGA from "react-ga4";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useProvider,
} from 'wagmi'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import { API } from 'react-wallet-chat/dist/src/types'
import storage from '../utils/extension-storage'
import { log, enableDebugPrints, disableDebugPrints } from '../helpers/log'
import Lit from '../utils/lit'
import * as ENV from '@/constants/env'
import { getFetchOptions } from '@/helpers/fetch'
import { endpoints, upsertQueryData } from '@/redux/reducers/dm'
import {
  selectAccount,
  selectIsAuthenticated,
  setAccount,
  setIsAuthenticated,
} from '@/redux/reducers/account'
import { useAppDispatch } from '@/hooks/useDispatch'
import { getIsWidgetContext } from '@/utils/context'
import {
  getHasJwtForAccount,
  getJwtForAccount,
  parseJwt,
  storeJwtForAccount,
  deleteJwtForAccount,
} from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import { getWidgetUrl, postMessage } from '@/helpers/widget'
import * as APP from '@/constants/app'

const isWidget = getIsWidgetContext()

/* eslint-disable react/display-name */
const WalletProviderContext = (chains: any) => {
  const dispatch = useAppDispatch()

  // help debug issues and watch for high traffic conditions
  const analytics = AnalyticsBrowser.load({
    writeKey: ENV.REACT_APP_SEGMENT_KEY,
  })
  /* Initialize analytics instance */
  const analyticsGA4 = Analytics({
    app: 'WalletChatApp',
    plugins: [
      /* Load Google Analytics v4 */
      googleAnalyticsPlugin({
        measurementIds: [ENV.REACT_APP_GOOGLE_GA4_KEY],
      }),
    ],
  })
  ReactGA.initialize(ENV.REACT_APP_GOOGLE_GA4_KEY);

  const didDisconnect = React.useRef<boolean>(false)
  const prevAccount = React.useRef<null | string>()
  const prevNonce = React.useRef<null | string>()
  const siwePendingRef = React.useRef<boolean>(false)
  const widgetWalletDataRef = React.useRef<
    | null
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

  const [connectConfig, setConnectConfig] = React.useState<
    undefined | { chainId: number; connector: any }
  >()

  const currentProvider = useProvider();

  const { chain } = useNetwork()
  const [chainId, setChainId] = React.useState(chain?.id)

  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount()

  const { connect, connectAsync } = useConnect()
  const { disconnect, disconnectAsync } = useDisconnect()

  const accountAddress = useAppSelector(
    (state) => selectAccount(state) || wagmiAddress || storage.get('current-address')
  )
  const isAuthenticated = useAppSelector((state) =>
    selectIsAuthenticated(state)
  )

  const initialJwt = accountAddress && storage.get('jwt')
  const accountAuthenticated = getHasJwtForAccount(accountAddress || "")

  const [nonce, setNonce] = React.useState<string | null>()
  const [email, setEmail] = React.useState(null)
  const [telegramCode, setTelegramCode] = React.useState(null)
  const [telegramHandle, setTelegramHandle] = React.useState(null)
  const [notifyDM, setNotifyDM] = React.useState('true')
  const [notify24, setNotify24] = React.useState('true')
  const [delegate, setDelegate] = React.useState<null | string>(null)
  const [widgetAuthSig, setWidgetAuthSig] = React.useState<
    undefined | { signature: undefined | null | string; msgToSign: string; 
                  walletName: undefined | null | string; account: undefined | null | string; chainId: number }
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
        log('✅[GET][Settings]:', data)
        if (data[0]?.email) {
          log('-[Email]:', data[0].email)
          setEmail(data[0].email)
        }
        if (data[0]?.notifydm) {
          log('-[notifydm]:', data[0].notifydm)
          setNotifyDM(data[0].notifydm)
        }
        if (data[0]?.notify24) {
          log('-[notify24]:', data[0].notify24)
          setNotify24(data[0].notify24)
        }
        if (data[0]?.telegramcode) {
          log('-[telegramcode]:', data[0].telegramcode)
          setTelegramCode(data[0].telegramcode)
        }
        if (data[0]?.telegramhandle) {
          log('-[telegramcode]:', data[0].telegramhandle)
          setTelegramHandle(data[0].telegramhandle)
        }
      })
      .catch((error: any) => {
        console.error('🚨[GET][Setting]:', error)
      })
  }, [])

  const signIn = React.useCallback(
    (address: string, jwt: string) => {
      
      //TODO: make sure this request doesn't get called on mobile (window.ethereum doesn;'t exist here)
      // window.ethereum.request({
      //   method: 'wallet_invokeSnap',
      //   params: {
      //     snapId: "npm:walletchat-metamask-snap", //"local:http://localhost:8080",
      //     request: { method: 'set_snap_state', params: { apiKey: jwt, address } },
      //   },
      // });

      Lit.setAuthSig(address)
      Lit.connectManual()

      log('✅[INFO][JWT]:', jwt)
      // if we log in with a full delegate, act as the vault
      const walletInJWT = parseJwt(jwt).sub
      if (walletInJWT.toLocaleLowerCase() !== address.toLocaleLowerCase()) {
        log(
          '✅[Using Full Delegate Wallet]:',
          walletInJWT,
          accountAddress
        )
        storage.set('delegate', address)
        setDelegate(address) // not sure this is used anymore
        dispatch(setAccount(walletInJWT))
      }

      getSettings(address)
      dispatch(setIsAuthenticated(true))

      if(accountAddress) {
        dispatch(endpoints.getName.initiate(accountAddress.toLocaleLowerCase()))
      } else {
        dispatch(endpoints.getName.initiate(address.toLocaleLowerCase()))
      }

      pendingConnect.current = false
    },
    [accountAddress, dispatch, getSettings]
  )

  React.useEffect(() => {
    dispatch(setIsAuthenticated(accountAuthenticated))

    if (storage.get('app-version') !== APP.VERSION) {
      localStorage.clear()
      storage.set('app-version', APP.VERSION)
      window.location.reload()
    }
  }, [dispatch, initialJwt, accountAuthenticated])

  React.useEffect(() => {
    if (analytics && accountAddress && name && email) {
      analytics.identify(accountAddress, { name, email })
      analyticsGA4.identify(accountAddress, { name, email })
      
    }
  }, [accountAddress, email, name])

  function getNonce(address: string) {
    fetch(` ${ENV.REACT_APP_REST_API}/users/${address}/nonce`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then(async (usersData: { Nonce: string }) => {
        log('✅[GET][Nonce]:', usersData)
        setNonce(usersData.Nonce)
      })
      .catch((error) => {
        log('🚨[GET][Nonce]:', error)
      })
  }

  async function getNonceAsync(address: string) {
    let retVal = ""
    await fetch(` ${ENV.REACT_APP_REST_API}/users/${address}/nonce`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then(async (usersData: { Nonce: string }) => {
        log('✅[GET][Nonce Local]:', usersData)
        retVal = usersData.Nonce
      })
      .catch((error) => {
        log('🚨[GET][Nonce Local]:', error)
      })
      return retVal;
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
            log('✅[GET][Welcome]:', welcomeData.msg)

            if (
              !welcomeData.msg.includes(accountAddress.toLocaleLowerCase()) &&
              !accountAddress.includes(storage.get('delegate'))
            ) {
              getNonce(accountAddress)
            } else {
              const currentName = welcomeData.msg.toString().split(':')[1]

              if (currentName) {
                updateName(currentName, accountAddress)
                log('✅[Name]:', currentName)
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
            log('🚨[GET][Welcome]:', welcomeError)
            deleteJwtForAccount(accountAddress) //if JWT is invalid remove it
            getNonce(accountAddress)
          })
      }
    }
  }, [accountAddress, updateName, signIn])

  // Updates the necessary state to signIn to WalletChat with an account based on widget provided data
  // Currently only needs account address & chainId
  const updateAccountFromWidget = React.useCallback(
    // withSignature forces a SIWE signature request
    (withSignature?: boolean, config?: any) => {
      if (widgetWalletDataRef.current === undefined) {
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

        //skip wallet connection if parent integration didn't send wallet connetion info
        // if (widgetWalletDataRef == null) {
        //   if (connectConfig || config) {
        //     connect(connectConfig || config)
        //     //todo: use wagmi injected connector instead of asking user for connection again?
        //   }
        // }
      }
    },
    [connect, connectConfig, dispatch]
  )

  const clearWidgetData = React.useCallback(() => {
    setWidgetAuthSig(undefined)
    widgetWalletDataRef.current = null
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
      //don't overwrite the current-widget-origin with the current host (weird metamask messages when changing chain)
      const currentSite = window.location.protocol + "//" + window.location.host
      if (currentOrigin !== origin && origin != currentSite) {
        storage.set('current-widget-origin', origin)
      }

      if (data.target === 'origin') {
        currentWidgetHost.current = data.data
      }

      const { data: messageData, target }: API = data

      if (target === 'signed_message') {
        //TODO, should probably clean this up to pass in account and chain ID?
        log("*** Setting Widget Auth Sig ***", messageData)
        setWidgetAuthSig(messageData)
        const regex = /0x[a-fA-F0-9]{40}/;
        const matches = messageData.msgToSign.match(regex);

        const regexChainID = /Chain ID: (\d+)/;
        const matchesChainID = messageData.msgToSign.match(regexChainID);

        let chainID = '1'
        if (matchesChainID && matchesChainID.length > 1) {
           chainID = matches[1];
        }

        if (matches && matches.length > 0) {
          const matchedAccount = matches[0]
          let localNonce = await getNonceAsync(matchedAccount)
          log("signed_message from: ", matchedAccount)
          
          fetch(`${ENV.REACT_APP_REST_API}/signin`, {
            body: JSON.stringify({
              name: chainID,
              address: matchedAccount,
              nonce: localNonce,
              msg: messageData.msgToSign,
              sig: messageData.signature,
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
            .then((response) => response.json())
            .then(async (signInData) => {
              storeJwtForAccount(matchedAccount, signInData.access)
    
              const currentSigs = storage.get('lit-auth-signature-by-account')
              storage.set('lit-auth-signature-by-account', {
                ...currentSigs,
                [matchedAccount.toLocaleLowerCase()]: widgetAuthSig,
              })
    
              signIn(matchedAccount, signInData.access)
            })
        }
      }

      if (data === 'debugON') {
        enableDebugPrints()
      }

      if (data === 'debugOFF') {
        disableDebugPrints()
      }

      if (target === 'sign_in' && messageData) {
        const shouldRequestSignature = messageData.requestSignature
        const widgetAccountChanged =
          widgetWalletDataRef?.current?.account !== messageData.account &&
          !didDisconnect.current

        if (widgetAccountChanged && widgetWalletDataRef.current !== null) {
          widgetWalletDataRef.current = messageData
          setWidgetWalletData(widgetWalletDataRef.current)

          let connector
          const walletIs = (walletName: string) =>
            messageData.walletName.toLowerCase().includes(walletName)

          if (walletIs('metamask')) {
            connector = new MetaMaskConnector({
              chains,
              options: {
                shimDisconnect: true,
                UNSTABLE_shimOnConnectSelectAccount: true,
              },
            })

            storage.set('current-widget-provider', 'metamask')
          }

          if (walletIs('coinbase')) {
            connector = new CoinbaseWalletConnector({
              chains,
              options: {
                appName: APP.NAME,
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
            connector = new WalletConnectConnector({
              chains,
              options: {
                projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID
              },
            })
            storage.set('current-widget-provider', 'wallet-connect')
          }

          if (connector) {
            // if(messageData.) {
            //   if (!wagmiConnected) {
            //     await connectAsync({ chainId: messageData.chainId, connector })
            //   }
            //   await disconnectAsync()
            // }

            setConnectConfig({ chainId: messageData.chainId, connector })
            updateAccountFromWidget(
              pendingConnect.current || shouldRequestSignature,
              { chainId: messageData.chainId, connector }
            )
          }
        }
      }
    }

    window.addEventListener('message', eventListener)
    return () => window.removeEventListener('message', eventListener)
  }, [
    connectAsync,
    disconnectAsync,
    wagmiConnected,
    updateAccountFromWidget,
    wagmiAddress,
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
          analytics.track('ConnectWallet_GoodDollar', {
            site: document.referrer,
            account: accountAddress,
          })
          // ReactGA.event({
          //   category: "ConnectWallet",
          //   action: "ConnectWallet",
          //   label: "TestLabel123", // optional
          // });
          analyticsGA4.track('ConnectWallet_GoodDollar', {
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
    if (!wagmiAddress) {
      if (prevAccount.current === null) {
        // Fallback for when signed out and this effect re-ran
        // revert prevAccount to default state so can log back in
        prevAccount.current = undefined
      }
    } else {
      didDisconnect.current = false
    }

    dispatch(setAccount(wagmiAddress))
  }, [wagmiAddress, dispatch])

  React.useEffect(() => {
    setChainId(chain?.id)
  }, [chain?.id])

  const requestSIWEandFetchJWT = React.useCallback(async () => {
    let _accountAddress = accountAddress
    if(!accountAddress && widgetAuthSig?.account) {
      dispatch(setAccount(widgetAuthSig?.account)) 
      getNonce(widgetAuthSig?.account)
      _accountAddress = widgetAuthSig?.account
    }
    const walletIsConnected = _accountAddress && chainId

    const accountHasNoJwt =
      _accountAddress && !getHasJwtForAccount(_accountAddress)

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
      let messageToSign = widgetAuthSig?.msgToSign

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
        const origin = window.location.protocol + "//" + domain
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
          log('🚨[SIWE][Failed or Rejected]:', error)
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

      log('✅[INFO][AuthSig]:', authSig)

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
    setWidgetAuthSig(undefined)
    didDisconnect.current = true

    Lit.disconnect()
    disconnect()

    widgetWalletDataRef.current = undefined
    dispatch(setAccount(null))
    setSiweLastFailure(null)
    siweFailedRef.current = false
    dispatch(setIsAuthenticated(false))
  }, [disconnect, dispatch])

  React.useEffect(() => {
    if (widgetWalletData) {
      previousWidgetData.current = widgetWalletData
    }
  }, [widgetWalletData])

  return React.useMemo(
    () => ({
      email,
      notifyDM,
      notify24,
      setName: updateName,
      telegramCode,
      telegramHandle,
      setEmail,
      setTelegramCode,
      setTelegramHandle,
      setNotifyDM,
      setNotify24,
      disconnectWallet,
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
      delegate,
      email,
      notify24,
      notifyDM,
      telegramCode,
      telegramHandle,
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
  ({ children, chains }: { children: React.ReactElement; chains: any }) => {
    const value = WalletProviderContext(chains)

    return (
      <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
    )
  }
)

export default WalletProvider
