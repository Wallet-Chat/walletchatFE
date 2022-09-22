/*global chrome*/
import React, { useEffect, useState } from 'react'
import createMetaMaskProvider from 'metamask-extension-provider'
import Web3 from 'web3'
//import Web3Modal from 'web3modal'
import Web3Modal from '@0xsequence/web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { sequence } from '0xsequence'
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
   sequence: {
      package: sequence,
      options: {
         appName: 'WalletChat',
         //defaultNetwork: 'ethereum' // optional
      },
   }
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
   const [isFetchingName, setIsFetchingName] = useState(true)
   const [account, setAccount] = useState(null)
   const [accounts, setAccounts] = useState(null)
   const [web3, setWeb3] = useState(null)
   const [isAuthenticated, setAuthenticated] = useState(false)
   const [appLoading, setAppLoading] = useState(false)
   const [error, setError] = useState()

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

      connectEagerly()
   }, [web3Modal])

   useEffect(() => {
      if (web3ModalProvider?.on) {
         const handleAccountsChanged = (accounts) => {
            console.log('handleAccountsChanged', accounts)
            setAccount(getNormalizeAddress(accounts))
            setName(null)
            getName(accounts[0])
            storage.set('current-address', {
               address: getNormalizeAddress(accounts),
            })
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

         console.log('subscribeToEvents', web3ModalProvider)
         web3ModalProvider.on(EthereumEvents.CHAIN_CHANGED, handleChainChanged)
         web3ModalProvider.on(
            EthereumEvents.ACCOUNTS_CHANGED,
            handleAccountsChanged
         )
         web3ModalProvider.on(EthereumEvents.CONNECT, handleConnect)
         web3ModalProvider.on(EthereumEvents.DISCONNECT, handleDisconnect)

         return () => {
            console.log('unsubscribeToEvents', web3ModalProvider)
            if (web3ModalProvider?.removeListener) {
               web3ModalProvider.removeListener(
                  EthereumEvents.CHAIN_CHANGED,
                  handleChainChanged
               )
               web3ModalProvider.removeListener(
                  EthereumEvents.ACCOUNTS_CHANGED,
                  handleAccountsChanged
               )
               web3ModalProvider.removeListener(
                  EthereumEvents.CONNECT,
                  handleConnect
               )
               web3ModalProvider.removeListener(
                  EthereumEvents.DISCONNECT,
                  handleDisconnect
               )
            }
         }
      }
   }, [web3ModalProvider])

   const getName = (_account) => {
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      if (!_account) {
         console.log('No account connected')
         return
      }
      setIsFetchingName(true)
      fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/name/${_account}`, {
         method: 'GET',
         credentials: "include",
         headers: {
            'Content-Type': 'application/json',
            //Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
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
         .then(() => {
            setIsFetchingName(false)
         })
   }

   const getAccountsExtension = async (provider) => {
      if (provider) {
         const accounts = await provider
            .request({
               method: 'eth_requestAccounts',
               params: [
                  {
                     eth_accounts: {},
                  },
               ],
            })
            .catch((error) => {
               if (error.code === 4001) {
                  // EIP-1193 userRejectedRequest error
                  console.log('Permissions needed to continue')
                  setError(error.message)
               } else {
                  console.error(error)
               }
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
         let _provider, _account, _nonce, _signer
         let _web3 = new Web3(provider)

         if (isChromeExtension()) {
            _provider = createMetaMaskProvider()
            const _accounts = await getAccountsExtension(provider)
            _account = getNormalizeAddress(_accounts)
         } else {
            const instance = await web3Modal.connect()
            setWeb3ModalProvider(instance)
            _provider = new ethers.providers.Web3Provider(instance)
            _account = await _provider.getSigner().getAddress()
            _signer = await _provider.getSigner()
            const network = await _provider.getNetwork()
            setChainId(network.chainId)
            const _w3 = new Web3(_provider)

            //TODO JWT
            fetch(` ${process.env.REACT_APP_REST_API}/users/${_account}/nonce`, {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
               },
            })
            .then((response) => response.json())
            .then(async (data) => {
               console.log('✅[GET][Nonce]:', data)
               _nonce = data.Nonce
               //console.log('✅[GET][Data.nonce]:', data.Nonce)
               //const signature = await _signer.signMessage("Sign to Log in to WalletChat: \r\n" + _nonce)
               const signature = await _signer.signMessage(_nonce)
               console.log('✅[INFO][Signature]:', signature)

               fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                  body: JSON.stringify({ "address": _account, "nonce": _nonce, "sig": signature }),
                  headers: {
                  'Content-Type': 'application/json'
                  },
                  method: 'POST'
               }).then((response) => response.json())
               .then(async (data) => {
                  console.log('✅[INFO][JWT]:', data.access)
               })
            })
            .catch((error) => {
               console.error('🚨[GET][Nonce]:', error)
            })
            //END JWT AUTH sequence

            if (network.chainId !== '1') {
               // check if the chain to connect to is installed
               await _provider.provider.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: _web3.utils.toHex(1) }], // chainId must be in hexadecimal numbers
               }).then(() => {
                  setChainId(1)
               })
            }
         }

         setProvider(_provider)

         if (_account) {
            setAppLoading(true)
            setAccount(_account)
            // setChainId(chainId)
            setAuthenticated(true)
            getName(_account)
            setWeb3(_web3)

            if (isChromeExtension()) {
               storage.set('metamask-connected', { connected: true })
               chrome.storage.local.set({
                  account: _account,
               })
            }
         }
      } catch (error) {
         console.log('🚨connectWallet', error)
         if (error.message === "User Rejected") {
            setError("Your permission is needed to continue. Please try signing in again.")
         }
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

   return (
      <WalletContext.Provider
         value={{
            name,
            setName,
            isFetchingName,
            account,
            accounts,
            walletRequestPermissions,
            disconnectWallet,
            connectWallet,
            isAuthenticated,
            appLoading,
            web3,
            provider,
            error,
         }}
      >
         {children}
      </WalletContext.Provider>
   )
})

export default WalletProvider
