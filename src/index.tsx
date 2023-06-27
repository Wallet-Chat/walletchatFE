import React from 'react'
import { ColorModeScript, ChakraProvider, Flex } from '@chakra-ui/react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  ledgerWallet,
  braveWallet,
  walletConnectWallet,
  coinbaseWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, WagmiConfig, configureChains } from 'wagmi'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { mainnet, polygon, optimism, avalanche, avalancheFuji, celo } from 'wagmi/chains'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import { Provider } from 'react-redux'
import { App } from './App'
import reportWebVitals from './reportWebVitals'
// import * as serviceWorker from './serviceWorker'
import WalletProvider from './context/WalletProvider'
import UnreadCountProvider from './context/UnreadCountProvider'
import { theme } from './theme'
import { store } from './redux/store'
// import { getAutoConnect } from './helpers/widget'
import * as ENV from '@/constants/env'
import * as APP from './constants/app'

// export const { chains, publicClient, webSocketPublicClient } = configureChains(
//   [mainnet, polygon, optimism, avalanche, avalancheFuji, celo],
//   [
//     infuraProvider({ apiKey: ENV.REACT_APP_INFURA_ID }),
//     alchemyProvider({ apiKey: ENV.REACT_APP_ALCHEMY_API_KEY_ETHEREUM }),
//     publicProvider(),
//   ]
// )

export const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, avalanche, avalancheFuji, celo], 
  [
    infuraProvider({ apiKey: ENV.REACT_APP_INFURA_ID }),
    alchemyProvider({ apiKey: ENV.REACT_APP_ALCHEMY_API_KEY_ETHEREUM }),
    publicProvider()
  ]
)

const { wallets } = getDefaultWallets({
  appName: APP.NAME,
  projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID,
  chains
})
const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      ledgerWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID, chains }),
      coinbaseWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID, chains })
    ]
  }
])

const connector = new WalletConnectConnector({
  chains,
  options: {
    projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID,
  },
})

const wagmiClient = createConfig({
  connectors: [connector],
  publicClient,
})

// const wagmiClient = createConfig({
//   autoConnect: false,
//   connectors: [
//     ...connectors(),
//     new MetaMaskConnector({
//       chains,
//       options: {
//         shimDisconnect: true,
//         UNSTABLE_shimOnConnectSelectAccount: true,
//       },
//     }),
//   ],
//   publicClient,
//   webSocketPublicClient,
// })

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript />
    <Provider store={store}>
      <BrowserRouter>
        <WagmiConfig config={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <WalletProvider chains={chains}>
              <UnreadCountProvider>
                <ChakraProvider theme={theme}>
                  <Flex w='100vw' h='100vh'>
                    <App />
                  </Flex>
                </ChakraProvider>
              </UnreadCountProvider>
            </WalletProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorker.unregister()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
