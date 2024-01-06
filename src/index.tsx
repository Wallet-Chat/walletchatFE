import React from 'react'
import { ColorModeScript, ChakraProvider, Flex } from '@chakra-ui/react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import {
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
  metaMaskWallet,
  coinbaseWallet
} from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css'
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { createClient, WagmiConfig, configureChains, sepolia } from 'wagmi'
import { mainnet, polygon, optimism, avalanche, avalancheFuji, celo, sepolia } from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
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
  [mainnet, polygon, optimism, avalanche, avalancheFuji, celo, sepolia],
  [
    infuraProvider({ apiKey: ENV.REACT_APP_INFURA_ID }),
    alchemyProvider({ apiKey: ENV.REACT_APP_ALCHEMY_API_KEY_ETHEREUM }),
    publicProvider(),
  ]
)

const mobileWallet = [
  //trust wallet ID
  "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
  //metamask wallet ID
  "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
  //safe wallet ID
  "225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f",
  //rainbow wallet ID
  "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
  //uniswap wallet ID
  "c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a",
  //zerion wallet ID
  "ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18",
  //argent wallet ID
  "bc949c5d968ae81310268bf9193f9c9fb7bb4e1283e1284af8f2bd4992535fd6",
  //imToken wallet ID
  "ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef",
  //spot wallet ID
  "74f8092562bd79675e276d8b2062a83601a4106d30202f2d509195e30e19673d"
]

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID , chains }),
      trustWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID , chains }),
      rainbowWallet({ projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID , chains }),
      walletConnectWallet({ 
        projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID, 
        chains,
        // options: {
        //   projectId: ENV.REACT_APP_WALLETCONNECT_PROJECT_ID, 
        //   qrcodeModalOptions: {
        //     desktopLinks: mobileWallet,
        //     mobileLinks: mobileWallet
        //   }
        // }
      }),
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
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
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
