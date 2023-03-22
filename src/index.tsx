import React from 'react'
import { ColorModeScript, ChakraProvider } from '@chakra-ui/react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, polygon, optimism } from 'wagmi/chains'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

import { Provider } from 'react-redux'
import { App } from './App'
import reportWebVitals from './reportWebVitals'
// import * as serviceWorker from './serviceWorker'
import WalletProvider from './context/WalletProvider'
import UnreadCountProvider from './context/UnreadCountProvider'
import { theme } from './theme'
import { store } from './redux/store'
import * as ENV from '@/constants/env'

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism],
  [infuraProvider({ apiKey: ENV.REACT_APP_INFURA_ID }), publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'WalletChat',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript />
    <Provider store={store}>
      <BrowserRouter>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <WalletProvider>
              <UnreadCountProvider>
                <ChakraProvider theme={theme}>
                  <App />
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
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
