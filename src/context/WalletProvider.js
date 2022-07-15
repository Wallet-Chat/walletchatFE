import React, { useState } from 'react'
import createMetaMaskProvider from 'metamask-extension-provider'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import { getNormalizeAddress } from '.'

import { EthereumEvents } from '../utils/events'
import storage from '../utils/storage'
import { ethers } from 'ethers'
import { isChromeExtension } from '../helpers/chrome'

const providerOptions = {
   walletconnect: {
      package: WalletConnectProvider, // required
      options: {
         infuraId: process.env.REACT_APP_INFURA_ID, // required
      },
   },
   coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
         appName: 'WalletChat',
         infuraId: process.env.REACT_APP_INFURA_ID,
      },
   },
}

if (!process.env.REACT_APP_INFURA_ID) {
   console.log('Missing REACT_APP_INFURA_ID')
}

const web3Modal = new Web3Modal({
   network: 'mainnet', // optional
   cacheProvider: true, // optional
   providerOptions, // required
})

export const WalletContext = React.createContext()
export const useWallet = () => React.useContext(WalletContext)

export function withWallet(Component) {
   const WalletComponent = (props) => (
      <WalletContext.Consumer>
         {(contexts) => <Component {...props} {...contexts} />}
      </WalletContext.Consumer>
   )
   return WalletComponent
}

const WalletProvider = React.memo(({ children }) => {
   const [provider, setProvider] = useState()
   const [web3ModalProvider, setWeb3ModalProvider] = useState()
   const [chainId, setChainId] = useState(null)
   const [name, setName] = useState(null)
   const [account, setAccount] = useState(null)
   const [accounts, setAccounts] = useState(null)
   const [web3, setWeb3] = useState(null)
   const [isAuthenticated, setAuthenticated] = useState(false)
   const [appLoading, setAppLoading] = useState(false)

   React.useEffect(() => {
      const connectEagerly = async () => {
         if (isChromeExtension()) {
            const metamask = await storage.get('metamask-connected')
            if (metamask?.connected) {
               await connectWallet()
            }
         } else {
            if (web3Modal?.cachedProvider) connectWallet()
         }
      }
      const unsubscribeToEvents = (provider) => {
         if (provider && provider.removeListener) {
            provider.removeListener(
               EthereumEvents.CHAIN_CHANGED,
               handleChainChanged
            )
            provider.removeListener(
               EthereumEvents.ACCOUNTS_CHANGED,
               handleAccountsChanged
            )
            provider.removeListener(EthereumEvents.CONNECT, handleConnect)
            provider.removeListener(EthereumEvents.DISCONNECT, handleDisconnect)
         }
      }

      connectEagerly()

      return () => {
         unsubscribeToEvents(provider)
      }
   }, [web3Modal])

   const subscribeToEvents = (provider) => {
      if (provider && provider.on) {
         provider.on(EthereumEvents.CHAIN_CHANGED, handleChainChanged)
         provider.on(EthereumEvents.ACCOUNTS_CHANGED, handleAccountsChanged)
         provider.on(EthereumEvents.CONNECT, handleConnect)
         provider.on(EthereumEvents.DISCONNECT, handleDisconnect)
      }
   }

   const getName = (_account) => {
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      if (!_account) {
         console.log('No account connected')
         return
      }
      fetch(` ${process.env.REACT_APP_REST_API}/name/${_account}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[GET][Name]:', data)
            if (data[0]?.name) {
               setName(data[0].name)
            }
         })
         .catch((error) => {
            console.error('🚨[GET][Name]:', error)
         })
   }

   const getAccountsExtension = async (provider) => {
      if (provider) {
         // const [accounts, chainId] = await Promise.all([
         //    provider.request({
         //       method: 'eth_requestAccounts',
         //       params: [
         //          {
         //             eth_accounts: {},
         //          },
         //       ],
         //    }),
         //    provider.request({ method: 'eth_chainId' }),
         // ])
         // return [accounts, chainId]
         const accounts = await provider.request({
            method: 'eth_requestAccounts',
            params: [
               {
                  eth_accounts: {},
               },
            ],
         })
         return accounts
      }
      return false
   }

   const walletRequestPermissions = async () => {
      if (provider) {
         await provider.request({
            method: 'wallet_requestPermissions',
            params: [
               {
                  eth_accounts: {},
               },
            ],
         })
      }
   }

   const connectWallet = async () => {
      console.log('connectWallet')
      try {
         let _provider, _account

         if (isChromeExtension()) {
            _provider = createMetaMaskProvider()
            const _accounts = await getAccountsExtension(provider)
            _account = getNormalizeAddress(_accounts)
         } else {
            const instance = await web3Modal.connect()
            setWeb3ModalProvider(instance)
            _provider = new ethers.providers.Web3Provider(instance)
            await _provider.getSigner().getAddress()
            _account = await _provider.getSigner().getAddress()
            const network = await _provider.getNetwork()
            setChainId(network)
         }

         setProvider(_provider)

         if (_account) {
            setAppLoading(true)
            setAccount(_account)
            // setChainId(chainId)
            setAuthenticated(true)
            getName(_account)
            const _web3 = new Web3(provider)
            setWeb3(_web3)

            if (isChromeExtension()) {
               storage.set('metamask-connected', { connected: true })
            }
            subscribeToEvents(_provider)
         }
      } catch (e) {
         console.log('🚨connectWallet', e)
      } finally {
         setAppLoading(false)
      }
   }

   const disconnectWallet = async () => {
      console.log('disconnectWallet')
      try {
         if (isChromeExtension) {
            storage.set('metamask-connected', { connected: false })
         } else {
            console.log(web3ModalProvider.close)
            if (web3ModalProvider.close) {
               await web3ModalProvider.close()
               await web3Modal.clearCachedProvider()
               setProvider(null)
            }
         }
         storage.set('current-address', { address: null })
         setAccount(null)
         setChainId(null)
         setAuthenticated(false)
         setWeb3(null)
      } catch (e) {
         console.log(e)
      }
   }

   const handleAccountsChanged = (accounts) => {
      console.log('handleAccountsChanged', accounts)
      setAccount(getNormalizeAddress(accounts))
      setName(null)
      getName(accounts[0])
      storage.set('current-address', { address: getNormalizeAddress(accounts) })
      storage.set('inbox', [])
      console.log('[account changes]: ', getNormalizeAddress(accounts))
   }

   const handleChainChanged = (chainId) => {
      setChainId(chainId)
      console.log('[chainId changes]: ', chainId)
   }

   const handleConnect = () => {
      setAuthenticated(true)
      console.log('[connected]')
   }

   const handleDisconnect = () => {
      console.log('[disconnected]')
      storage.set('inbox', [])
      disconnectWallet()
   }

   return (
      <WalletContext.Provider
         value={{
            name,
            setName,
            account,
            accounts,
            walletRequestPermissions,
            disconnectWallet,
            connectWallet,
            isAuthenticated,
            appLoading,
            web3,
         }}
      >
         {children}
      </WalletContext.Provider>
   )
})

export default WalletProvider
