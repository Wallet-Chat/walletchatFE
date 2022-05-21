import React, { useState } from 'react'
import createMetaMaskProvider from 'metamask-extension-provider'
import Web3 from 'web3'
import { getNormalizeAddress } from '.'
import EthCrypto from 'eth-crypto'

import { EthereumEvents } from '../utils/events'
import storage from '../utils/storage'

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
   const [chainId, setChainId] = useState(null)
   const [account, setAccount] = useState(null)
   const [web3, setWeb3] = useState(null)
   const [isAuthenticated, setAuthenticated] = useState(false)
   const [appLoading, setAppLoading] = useState(false)
   const [publicKey, setPublicKey] = useState()
   const [privateKey, setPrivateKey] = useState()

   console.log({ chainId, account, web3, isAuthenticated, publicKey })

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

      connectEagerly()
      
      return () => {
         const provider = getProvider()
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

   const getProvider = () => {
      if (window.ethereum) {
         console.log('found window.ethereum>>')
         return window.ethereum
      } else {
         const provider = createMetaMaskProvider()
         return provider
      }
   }

   const getAccounts = async (provider) => {
      if (provider) {
         const [accounts, chainId] = await Promise.all([
            provider.request({
               method: 'eth_requestAccounts',
            }),
            provider.request({ method: 'eth_chainId' }),
         ])
         return [accounts, chainId]
      }
      return false
   }

   const createEncryptionKeyPair = async (accountlocal) => {
      // create identitiy with key-pairs and address
      const keyPair = EthCrypto.createIdentity();

      fetch(` ${process.env.REACT_APP_REST_API}/create_settings`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            "walletaddr": accountlocal,
            "publickey": keyPair.publicKey
        }),
      })

      return keyPair;
   }

   const connectWallet = async () => {
      console.log('connectWallet')
      try {
         const provider = getProvider()
         const [accounts, chainId] = await getAccounts(provider)
         if (accounts && chainId) {
            setAppLoading(true)
            const account = getNormalizeAddress(accounts)
            const web3 = new Web3(provider)
            setAccount(account)
            setChainId(chainId)
            setWeb3(web3)
            setAuthenticated(true)

            //only do this once at first login, never again or we can't decrypt previous data
            //until this is moved we likely will have a few latenet issues decrypting older data
            let publicKey = await storage.get('public-key')
            if (publicKey) setPublicKey(publicKey.key)
            let privateKey = await storage.get('private-key')
            if (privateKey) setPrivateKey(privateKey.key)
            console.log("pubKey: ", publicKey)
            if(!publicKey) {
               const keyPair = await createEncryptionKeyPair(account)
               storage.set('public-key', { key: keyPair.publicKey })
               storage.set('private-key', { key: keyPair.privateKey })
               console.log("created keypair", publicKey, privateKey)
            }

            storage.set('metamask-connected', { connected: true })
            subscribeToEvents(provider)
         }
      } catch (e) {
         console.log('error while connect', e)
      } finally {
         setAppLoading(false)
      }
   }

   const disconnectWallet = () => {
      console.log('disconnectWallet')
      try {
         storage.set('metamask-connected', { connected: false })
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
      setAccount(getNormalizeAddress(accounts))
      storage.set('current-address', { address: getNormalizeAddress(accounts)})
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
      disconnectWallet()
   }

   return (
      <WalletContext.Provider
         value={{
            account,
            publicKey,
            privateKey,
            disconnectWallet,
            connectWallet,
            isAuthenticated,
            appLoading,
            web3
         }}
      >
         {children}
      </WalletContext.Provider>
   )
})

export default WalletProvider
