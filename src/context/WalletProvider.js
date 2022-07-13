import React, { useState } from 'react'
import createMetaMaskProvider from 'metamask-extension-provider'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { getNormalizeAddress } from '.'
import EthCrypto from 'eth-crypto'

import { EthereumEvents } from '../utils/events'
import storage from '../utils/storage'
import { ethers } from 'ethers'

const providerOptions = {
   walletconnect: {
      package: WalletConnectProvider, // required
      options: {
         infuraId: process.env.REACT_APP_INFURA_ID, // required
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
   const [library, setLibrary] = useState()
   const [chainId, setChainId] = useState(null)
   const [name, setName] = useState(null)
   const [account, setAccount] = useState(null)
   const [accounts, setAccounts] = useState(null)
   const [web3, setWeb3] = useState(null)
   const [isAuthenticated, setAuthenticated] = useState(false)
   const [appLoading, setAppLoading] = useState(false)

   // console.log({ chainId, account, web3, isAuthenticated, publicKey })

   React.useEffect(() => {
      const connectEagerly = async () => {
         const metamask = await storage.get('metamask-connected')
         if (metamask?.connected) {
            await connectWallet()
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

      // connectEagerly()

      return () => {
         unsubscribeToEvents(provider)
      }
   }, [])

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
         
         let _provider, _accounts

         if (window.ethereum) {
            console.log('found window.ethereum>>')
            _provider = await web3Modal.connect()
            const library = new ethers.providers.Web3Provider(_provider)
            _accounts = await library.listAccounts()
            const network = await library.getNetwork()
            setLibrary(library)
            setChainId(network)
         } else {
            _provider = createMetaMaskProvider()
            _accounts = await getAccountsExtension(provider)
         }
         
         setProvider(_provider)  
         

         if (_accounts) {
            setAppLoading(true)
            const _account = getNormalizeAddress(_accounts)
            setAccount(_account)
            setAccounts(_accounts)
            // setChainId(chainId)
            setAuthenticated(true)
            getName(_account)
            const _web3 = new Web3(provider)
            setWeb3(_web3)

            if (!window.ethereum) {
               storage.set('metamask-connected', { connected: true })
            }
            subscribeToEvents(provider)
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
         if (window.ethereum) {
            await web3Modal.clearCachedProvider()
         } else {
            storage.set('metamask-connected', { connected: false })
         }
         storage.set('current-address', { address: null })
         setAccount(null)
         setChainId(null)
         setAuthenticated(false)
         setWeb3(null)
         web3Modal.clearCachedProvider()
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
