import React from 'react'
import { ColorModeScript, ChakraProvider, Flex } from '@chakra-ui/react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { createClient, WagmiConfig } from 'wagmi'

import { Provider } from 'react-redux'
import { chains, provider, connectors } from '@/context/WalletProvider'
import { App } from './App'
import reportWebVitals from './reportWebVitals'
// import * as serviceWorker from './serviceWorker'
import WalletProvider from './context/WalletProvider'
import UnreadCountProvider from './context/UnreadCountProvider'
import { theme } from './theme'
import { store } from './redux/store'
import { getAutoConnect } from './helpers/widget'

const wagmiClient = createClient({
  autoConnect: false,
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
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
