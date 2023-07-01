import React from 'react'
import { ColorModeScript, ChakraProvider, Flex } from '@chakra-ui/react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import "focus-visible/dist/focus-visible"

import '@rainbow-me/rainbowkit/styles.css'
import {
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
  metaMaskWallet,
  coinbaseWallet
} from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { createClient, WagmiConfig, configureChains } from 'wagmi'
import { mainnet, polygon, optimism, avalanche, avalancheFuji, celo } from 'wagmi/chains'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

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

export const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, polygon, optimism, avalanche, avalancheFuji, celo],
  [
    infuraProvider({ apiKey: ENV.REACT_APP_INFURA_ID }),
    alchemyProvider({ apiKey: ENV.REACT_APP_ALCHEMY_API_KEY_ETHEREUM }),
    publicProvider(),
  ]
)

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID , chains }),
      trustWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID , chains }),
      rainbowWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID , chains }),
      walletConnectWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID , chains}),
      coinbaseWallet({ appName: "WalletChat", chains })
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
  webSocketProvider,
})

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript />
    <Provider store={store}>
      <BrowserRouter>
        <WagmiConfig client={wagmiClient}>
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
