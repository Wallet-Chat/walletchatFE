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
import { SiweMessage } from 'siwe'
import Lit from '../utils/lit'
//import { TempleWallet } from "@temple-wallet/dapp";
import { DAppClient } from '@airgap/beacon-sdk'
import * as siwt from '@stakenow/siwt'

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
   const [email, setEmail] = useState(null)
   const [notifyDM, setNotifyDM] = useState(null)
   const [notify24, setNotify24] = useState(null)
   const [isFetchingName, setIsFetchingName] = useState(true)
   const [account, setAccount] = useState(null)
   const [accounts, setAccounts] = useState(null)
   const [web3, setWeb3] = useState(null)
   const [isAuthenticated, setAuthenticated] = useState(false)
   const [appLoading, setAppLoading] = useState(false)
   const [error, setError] = useState()
   const [redirectUrl, setRedirectUrl] = useState('/community/walletchat')

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
            setEmail(null)
            setNotifyDM(null)
            setNotify24(null)
            getName(accounts[0])
            getSettings(accounts[0])
            storage.set('current-address', {
               address: getNormalizeAddress(accounts),
            })
            console.log('[account changes]: ', getNormalizeAddress(accounts))
            if (!isChromeExtension()) {
            // TODO: how can we refresh data loaded without manual refresh?
            window.location.reload();  
            }
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
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
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
   const getSettings = (_account) => {
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      if (!_account) {
         console.log('No account connected')
         return
      }
      setIsFetchingName(true)
      fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/get_settings/${_account}`, {
         method: 'GET',
         credentials: "include",
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
         },
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[GET][Settings]:', data)
            if (data[0]?.email) {
               console.log('-[Email]:', data[0].email)
               setEmail(data[0].email)
            }
            if (data[0]?.notifydm) {
               console.log('-[notifydm]:', data[0].notifydm)
               setNotifyDM(data[0].notifydm)
            }
            if (data[0]?.notify24) {
               console.log('-[notify24]:', data[0].notify24)
               setNotify24(data[0].notify24)
            }
         })
         .catch((error) => {
            console.error('🚨[GET][Setting]:', error)
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

   const connectWallet = async () => {
      console.log('connectWallet')
      try {
         let _provider, _account, _nonce, _signer
         let _signedIn = false
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

            // check if JWT exists or is timed out:
            fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/welcome`, {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('jwt')}`,
               },
            })
            .then((response) => response.json())
            .then(async (data) => {
               console.log('✅[POST][Welcome]:', data.msg)
               //console.log('msg log: ', data.msg.toString().includes(_account.toLocaleLowerCase()), _account.toString())
               if (!data.msg.includes(_account.toLocaleLowerCase())) {
                  //GET JWT
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
                     //const signature = await _signer.signMessage("Sign to Log in to WalletChat: " + _nonce)

                     //SIWE and setup LIT authSig struct
                     const domain = "walletchat.fun";
                     const origin = "https://walletchat.fun";
                     const statement =
                       "You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.";
                     
                     const siweMessage = new SiweMessage({
                       domain,
                       address: _account,
                       statement,
                       uri: origin,
                       version: "1",
                       chainId: network.chainId,
                       nonce: _nonce,
                     });
                     
                     const messageToSign = siweMessage.prepareMessage();
                     const signature = await _signer.signMessage(messageToSign); 
                     console.log("signature", signature);                  
                     const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
                     
                     const authSig = {
                       sig: signature,
                       derivedVia: "web3.eth.personal.sign",
                       signedMessage: messageToSign,
                       address: recoveredAddress.toLocaleLowerCase(),
                     };
                     //end SIWE and authSig

                     //const signature = await _signer.signMessage(_nonce)
                     console.log('✅[INFO][AuthSig]:', authSig)

                     fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                        body: JSON.stringify({ "address": _account, "nonce": _nonce, "msg": messageToSign, "sig": signature }),
                        headers: {
                        'Content-Type': 'application/json'
                        },
                        method: 'POST'
                     })
                     .then((response) => response.json())
                     .then(async (data) => {
                        localStorage.setItem('jwt', data.access);
                        //Used for LIT encryption authSign parameter
                        //localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                        //localStorage.setItem('lit-web3-provider', _provider.connection.url);
                        console.log('✅[INFO][JWT]:', data.access)
                     })
                  })
                  .catch((error) => {
                     console.error('🚨[GET][Nonce]:', error)
                  })
                  //END JWT AUTH sequence

             //below part of /welcome check for existing token     
             }
            })
            .catch((error) => {
               console.error('🚨[POST][Welcome]:', error)
               //GET JWT
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
                  //const signature = await _signer.signMessage("Sign to Log in to WalletChat: " + _nonce)

                  //SIWE and setup LIT authSig struct
                  const domain = "walletchat.fun";
                     const origin = "https://walletchat.fun";
                     const statement =
                       "You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.";
                     
                     const _siweMessage = new SiweMessage({
                       domain,
                       address: _account,
                       statement,
                       uri: origin,
                       version: "1",
                       chainId: network.chainId,
                       nonce: _nonce,
                     });
                     
                     const messageToSign = _siweMessage.prepareMessage();
                     const signature = await _signer.signMessage(messageToSign); 
                     //console.log("signature", signature);                  
                     //const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
                     
                     const authSig = {
                       sig: signature,
                       derivedVia: "web3.eth.personal.sign",
                       signedMessage: messageToSign,
                       address: _account.toLocaleLowerCase(),
                     };
                     //end SIWE and authSig
                  //const signature = await _signer.signMessage(_nonce)
                  console.log('✅[INFO][Signature]:', signature)

                  fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                     body: JSON.stringify({ "address": _account, "nonce": _nonce, "msg": messageToSign, "sig": signature }),
                     headers: {
                     'Content-Type': 'application/json'
                     },
                     method: 'POST'
                  })
                  .then((response) => response.json())
                  .then(async (data) => {
                     localStorage.setItem('jwt', data.access);
                     //Used for LIT encryption authSign parameter
                     // localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                     // localStorage.setItem('lit-web3-provider', _provider.connection.url);
                     console.log('✅[INFO][JWT]:', data.access)
                  })
                  .catch((error) => {
                     console.error('🚨[GET][Sign-In Failed]:', error)
                  })
               })
               .catch((error) => {
                  console.error('🚨[GET][Nonce]:', error)
               })
               //END JWT AUTH sequence
            })

            // if (network.chainId !== '1') {
               // check if the chain to connect to is installed
            //    await _provider.provider.request({
            //       method: 'wallet_switchEthereumChain',
            //       params: [{ chainId: _web3.utils.toHex(1) }], // chainId must be in hexadecimal numbers
            //    }).then(() => {
            //       setChainId(1)
            //    })
            // }
         }

         setProvider(_provider)

         if (_account) {
            setAppLoading(true)
            setAccount(_account)
            // setChainId(chainId)
            setAuthenticated(true)
            getName(_account)
            getSettings(_account)
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

   const walletRequestPermissions = async () => {
      const instance = await web3Modal.connect()
            setWeb3ModalProvider(instance)
            let _provider = new ethers.providers.Web3Provider(instance)
            let _account = await _provider.getSigner().getAddress()

         await _provider.provider.request({
            method: 'wallet_requestPermissions',
            params: [
               {
                  eth_accounts: {},
               },
            ],
         })
   }

   const connectWalletTezos = async () => {
      console.log('connectWallet Tezos')
      try {
         let _provider, _account, _accountPubKey, _nonce, _signer
         let _signedIn = false
         const dAppClient = new DAppClient({ name: 'WalletChat' })

         // request wallet permissions with Beacon dAppClient
         // Check if we are connected. If not, do a permission request first.
         const activeAccount = await dAppClient.getActiveAccount();
         if (!activeAccount) {
            const permissions = await dAppClient.requestPermissions();
            console.log("New Tezos Connection:", permissions.address.publicKey, permissions.network);
            _accountPubKey = permissions.accountInfo.publicKey;
            _account = permissions.address;
            setChainId(permissions.network)
            setProvider(permissions)
         } else {
            _accountPubKey = activeAccount.publicKey;
            _account= activeAccount.address;
            setChainId(activeAccount.network)
            setProvider(activeAccount)
            console.log("Tezos Connection:", _accountPubKey, activeAccount.network);
         }
         console.log('Tezos Wallet Address: ', _account)
         console.log('Tezos Wallet Public Key: ', _accountPubKey)

         // check if JWT exists or is timed out:
         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/welcome`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
         })
         .then((response) => response.json())
         .then(async (data) => {
            console.log('✅[POST][Welcome]:', data.msg)
            //console.log('msg log: ', data.msg.toString().includes(_account.toLocaleLowerCase()), _account.toString())
            if (!data.msg.includes(_account)) {
               //GET JWT
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

                  // create the message to be signed
                  const messagePayload = siwt.createMessagePayload({
                     dappUrl: 'https://walletchat.fun',
                     nonce: _nonce,
                     pkh: _account,
                  })
                  // request the signature
                  const signedPayload = await dAppClient.requestSignPayload(messagePayload)

                  fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                     body: JSON.stringify({ "address": _accountPubKey, "nonce": _nonce, "msg": messagePayload.payload, "sig": signedPayload.signature }),
                     headers: {
                     'Content-Type': 'application/json'
                     },
                     method: 'POST'
                  })
                  .then((response) => response.json())
                  .then(async (data) => {
                     localStorage.setItem('jwt', data.access);
                     //Used for LIT encryption authSign parameter
                     //localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                     //localStorage.setItem('lit-web3-provider', _provider.connection.url);
                     console.log('✅[INFO][JWT]:', data.access)
                  })
               })
               .catch((error) => {
                  console.error('🚨[GET][Nonce]:', error)
               })
               //END JWT AUTH sequence

            //below part of /welcome check for existing token     
            }
         })
         .catch((error) => {
            console.error('🚨[POST][Welcome]:', error)
            //GET JWT
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
               //const signature = await _signer.signMessage("Sign to Log in to WalletChat: " + _nonce)

               // create the message to be signed
               const messagePayload = siwt.createMessagePayload({
                  dappUrl: 'walletchat.fun',
                  nonce: _nonce,
                  pkh: _account,
               })
               const signedPayload = await dAppClient.requestSignPayload(messagePayload)

               fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                  body: JSON.stringify({ "address": _accountPubKey, "nonce": _nonce, "msg": messagePayload.payload, "sig": signedPayload.signature }),
                  headers: {
                     'Content-Type': 'application/json'
                  },
                  method: 'POST'
               })
               .then((response) => response.json())
               .then(async (data) => {
                  localStorage.setItem('jwt', data.access);
                  //Used for LIT encryption authSign parameter
                  // localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                  // localStorage.setItem('lit-web3-provider', _provider.connection.url);
                  console.log('✅[INFO][JWT]:', data.access)
               })
               .catch((error) => {
                  console.error('🚨[GET][Sign-In Failed]:', error)
               })
            })
            .catch((error) => {
               console.error('🚨[GET][Nonce]:', error)
            })
            //END JWT AUTH sequence
         })

         if (_account) {
            setAppLoading(true)
            setAccount(_account)
            setChainId(chainId)
            setAuthenticated(true)
            getName(_account)
            getSettings(_account)
            //setWeb3(_web3)
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
      console.log('** disconnectWallet **')
      try {
         if (isChromeExtension()) {
            console.log('Disconnect Wallet Chrome Extension True')
            storage.set('metamask-connected', { connected: false })
         } else {
            if (web3 != null) {
               console.log(web3ModalProvider.close)
               if (web3ModalProvider.close) {
                  await web3ModalProvider.close()
                  await web3Modal.clearCachedProvider()
                  setProvider(null)
               }
            }
            console.log('Deleting Login LocalStorage Items')
            localStorage.removeItem('jwt')
            localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
            localStorage.removeItem('metamask-connected')
            // localStorage.removeItem('lit-auth-signature')
            // localStorage.removeItem('lit-web3-provider')
            localStorage.removeItem('current-address')
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
            email,
            notifyDM,
            notify24,
            setName,
            setEmail,
            setNotifyDM,
            setNotify24,
            isFetchingName,
            account,
            accounts,
            walletRequestPermissions,
            disconnectWallet,
            connectWallet,
            connectWalletTezos,
            isAuthenticated,
            appLoading,
            web3,
            provider,
            error,
            redirectUrl,
            setRedirectUrl
         }}
      >
         {children}
      </WalletContext.Provider>
   )
})

export default WalletProvider
