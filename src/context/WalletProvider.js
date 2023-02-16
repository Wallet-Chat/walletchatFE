/*global chrome*/
import React, { useEffect, useState } from 'react'
import createMetaMaskProvider from 'metamask-extension-provider'
import Web3 from 'web3'
//import Web3Modal from 'web3modal'
import Web3Modal from '@0xsequence/web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
//import { IFrameEthereumProvider } from '@ledgerhq/iframe-provider';
import { sequence } from '0xsequence'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import { getNormalizeAddress } from '.'

import { EthereumEvents } from '../utils/events'
import storage from '../utils/storage'
import { ethers } from 'ethers'
import { isChromeExtension } from '../helpers/chrome'
import { SiweMessage } from 'siwe'
import Lit from '../utils/lit'

import { DAppClient } from '@airgap/beacon-sdk'
import * as siwt from '@stakenow/siwt'
import { useNavigate } from 'react-router-dom'
//NEAR wallet helpers
import { keyStores } from 'near-api-js';
// wallet selector UI
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import LedgerIconUrl from '@near-wallet-selector/ledger/assets/ledger-icon.png';
import MyNearIconUrl from '@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png';
import NearIconUrl from '@near-wallet-selector/near-wallet/assets/near-wallet-icon.png';
import WalletConnectIconUrl from "@near-wallet-selector/wallet-connect/assets/wallet-connect-icon.png";
import SenderIconUrl from "@near-wallet-selector/sender/assets/sender-icon.png";
import {
   AppConfig,
   UserSession,
   AuthDetails,
   showConnect,
 } from "@stacks/connect";
 import { openSignatureRequestPopup } from "@stacks/connect";
 import { StacksTestnet, StacksMainnet } from "@stacks/network";
 import { getAddressFromPublicKey, TransactionVersion } from "@stacks/transactions";

// near wallet selector options
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupLedger } from '@near-wallet-selector/ledger';
///import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { setupWalletConnect } from '@near-wallet-selector/wallet-connect';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

//end NEAR wallet imports/declarations

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

function toHexString(byteArray) {
   return Array.from(byteArray, function(byte) {
     return ('0' + (byte & 0xFF).toString(16)).slice(-2);
   }).join('')
 }

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
   const [btnClicks, setBtnClicks] = useState(0)
   const [email, setEmail] = useState(null)
   const [notifyDM, setNotifyDM] = useState('true')
   const [notify24, setNotify24] = useState('true')
   const [isFetchingName, setIsFetchingName] = useState(true)
   const [account, setAccount] = useState(null)
   const [accounts, setAccounts] = useState(null)
   const [web3, setWeb3] = useState(null)
   const [isAuthenticated, setAuthenticated] = useState(false)
   const [appLoading, setAppLoading] = useState(false)
   const [error, setError] = useState()
   const [redirectUrl, setRedirectUrl] = useState('/community/walletchat')
   let navigate = useNavigate()

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
            setBtnClicks(null)
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
            Authorization: `Bearer ${localStorage.getItem('jwt_' + _account)}`,
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
            Authorization: `Bearer ${localStorage.getItem('jwt_' + _account)}`,
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

   function parseJwt (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      return JSON.parse(jsonPayload);
   }

   const connectWallet = async () => {
      console.log('connectWallet')
      try {
         let _provider, _account, _nonce, _signer, _instance
         let _signedIn = false
         let _web3 = new Web3(provider)

         if (isChromeExtension()) {
            _provider = createMetaMaskProvider()
            const _accounts = await getAccountsExtension(provider)
            _account = getNormalizeAddress(_accounts)
         } else {
            //if we are within an iframe use the parent provider (Requirement for Ledger Live)
            // if (window !== window.parent) {
            //    _instance = new IFrameEthereumProvider()
            // } else {
               _instance = await web3Modal.connect()
            // }

            setWeb3ModalProvider(_instance)
            _provider = new ethers.providers.Web3Provider(_instance);
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
                  Authorization: `Bearer ${localStorage.getItem('jwt_' + _account)}`,
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
                     
                     //const recoveredAddress = 0x0;
                     //server side checks is anyway, just a double check here with ethers lib
                     // if (signature.length > 100) { //TODO: need a better way to determine EIP-1271
                     //    recoveredAddress = _account
                     // } else {
                     //    recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
                     // }
                     
                     const authSig = {
                       sig: signature,
                       derivedVia: "web3.eth.personal.sign",
                       signedMessage: messageToSign,
                       address: _account.toLocaleLowerCase(),
                     };
                     //end SIWE and authSig

                     //const signature = await _signer.signMessage(_nonce)
                     console.log('✅[INFO][AuthSig]:', authSig)

                     fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                        body: JSON.stringify({ "name": network.chainId.toString(), "address": _account, "nonce": _nonce, "msg": messageToSign, "sig": signature }),
                        headers: {
                        'Content-Type': 'application/json'
                        },
                        method: 'POST'
                     })
                     .then((response) => response.json())
                     .then(async (data) => {             
                        //Used for LIT encryption authSign parameter
                        //localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                        //localStorage.setItem('lit-web3-provider', _provider.connection.url);
                        console.log('✅[INFO][JWT]:', data.access)

                        //if we log in with a full delegate, act as the vault
                        const walletInJWT = parseJwt(data.access).sub
                        if (walletInJWT.toLocaleLowerCase() !== _account.toLocaleLowerCase()) {
                           console.log('✅[Using Full Delegate Wallet]:', walletInJWT, _account)
                           _account = walletInJWT
                           setAccount(_account)
                           getName(_account)
                           getSettings(_account)
                        }
                        localStorage.setItem('jwt_' + _account, data.access);
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
                     body: JSON.stringify({ "name": network.chainId.toString(), "address": _account, "nonce": _nonce, "msg": messageToSign, "sig": signature }),
                     headers: {
                     'Content-Type': 'application/json'
                     },
                     method: 'POST'
                  })
                  .then((response) => response.json())
                  .then(async (data) => {
                     //Used for LIT encryption authSign parameter
                     // localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                     // localStorage.setItem('lit-web3-provider', _provider.connection.url);
                     console.log('✅[INFO][JWT]:', data.access)

                     //if we log in with a full delegate, act as the vault
                     const walletInJWT = parseJwt(data.access).sub
                     if (walletInJWT.toLocaleLowerCase() !== _account.toLocaleLowerCase()) {
                        console.log('✅[Using Full Delegate Wallet]:', walletInJWT, _account)
                        _account = walletInJWT
                        setAccount(_account)
                        getName(_account)
                        getSettings(_account)
                     }
                     localStorage.setItem('jwt_' + _account, data.access);
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
               Authorization: `Bearer ${localStorage.getItem('jwt_' + _account)}`,
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
                     localStorage.setItem('jwt_' + _account, data.access);
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
                  localStorage.setItem('jwt_' + _account, data.access);
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

   const connectWalletNEAR = async () => {
      console.log('connectWallet NEAR')
      try {
         let _provider, _account, _accountPubKey, _nonce, _signer, _localKey, _wallet
         let _signedIn = false
         //let _network = "testnet"
         let _network = "mainnet"
         
         const walletConnect = setupWalletConnect({
            projectId: "91ccd1b54b569a0b3c5a5dd005da0708",
            metadata: {
              name: "NEAR Wallet Selector",
              description: "Walletchat",
              url: "https://github.com/near/wallet-selector",
              icons: [WalletConnectIconUrl],
            },
            chainId: "near:testnet",
            //iconUrl: "https://yourdomain.com/yourwallet-icon.png",
          });

         const selector = await setupWalletSelector({
            network: _network, //this.network,
            modules: [setupNearWallet({ iconUrl: NearIconUrl }), 
                      //setupMyNearWallet({ iconUrl: MyNearIconUrl }),
                      setupLedger({ iconUrl: LedgerIconUrl }),
                      setupSender({ iconUrl: SenderIconUrl }),
                      walletConnect]
          });
          
          const description = 'Please select a wallet to sign in.';
          //const modal = setupModal(selector, { contractId: "dev-1672109335952-72949654416365", description });
          const modal = setupModal(selector, { contractId: "walletchat.near", description });
         //console.log("NEAR user login: ", currentUser)
         
         _signedIn = selector.isSignedIn()

         _accountPubKey = ""
         if (_signedIn) {
            _wallet = await selector.wallet()
            _account = selector.store.getState().accounts[0].accountId
      
            if (_wallet.type == "browser"){
               //browser based wallet
               const keyStore = new keyStores.BrowserLocalStorageKeyStore()
               _localKey = await keyStore.getKey(_network, _account)
               _accountPubKey = _localKey.getPublicKey()
            } if (_wallet.type == "injected") {
               //injected wallet (like a chrome extension)
               _account = window.near.getAccountId();
               const accountObj = window.near.account()
               _localKey = await accountObj.connection.signer.keyStore.getKey(_network, _account)
               _accountPubKey = await _localKey.getPublicKey()
            } else {
               //Bridge like walletconnect or something 
               console.log("Not supported yet - please ASK for this feature!")
            }
         } else {
            modal.show();
            return
         }

         // check if JWT exists or is timed out:
         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/welcome`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt_' + _account)}`,
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

                  const origin = "https://walletchat.fun";
                  const statement =
                       "You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.";

                  const messageToSign = origin + "\r\n" + statement + "\r\n" + _account + "\r\n" + _network + "\r\n" + _nonce;
                  let signature = ""
                  if (_wallet.type == "browser"){
                     // MyNearWallet                    
                     signature = _localKey.sign(Buffer.from(messageToSign));
                  } if (_wallet.type == "injected") { 
                     signature = _localKey.sign(Buffer.from(messageToSign));
                  } else {
                     console.log("WalletConnect Needs Work!")
                  }
                  console.log("verify NEAR ")
                
                  fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                     body: JSON.stringify({ "name": _account, "address": toHexString(_accountPubKey.data), "nonce": _nonce, "msg": messageToSign, "sig": toHexString(signature.signature) }),
                     headers: {
                     'Content-Type': 'application/json'
                     },
                     method: 'POST'
                  })
                  .then((response) => response.json())
                  .then(async (data) => {
                     localStorage.setItem('jwt_' + _account, data.access);
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

               const origin = "https://walletchat.fun";
               const statement =
                    "You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.";
               // MyNearWallet
               const messageToSign = origin + "\r\n" + statement + "\r\n" + _account + "\r\n" + _network + "\r\n" + _nonce;
               
               let signature = ""
               if (_wallet.type == "browser"){
                  // MyNearWallet                    
                  signature = _localKey.sign(Buffer.from(messageToSign));
               } if (_wallet.type == "injected") { 
                  signature = _localKey.sign(Buffer.from(messageToSign));
               } else {
                  console.log("WalletConnect Needs Work!")
               }
               console.log("verify NEAR ")
             
               fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                  body: JSON.stringify({ "name": _account, "address": toHexString(_accountPubKey.data), "nonce": _nonce, "msg": messageToSign, "sig": toHexString(signature.signature) }),
                  headers: {
                     'Content-Type': 'application/json'
                  },
                  method: 'POST'
               })
               .then((response) => response.json())
               .then(async (data) => {
                  localStorage.setItem('jwt_' + _account, data.access);
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
   //end NEAR wallet sign-in


   const fromHexString = (hexString) =>
      Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

   //STX Wallet (Stacks)
   const [message, setMessage] = useState("");
   const [transactionId, setTransactionId] = useState("");
   const [currentMessage, setCurrentMessage] = useState("");
   const [userData, setUserData] = useState(undefined);
   const appConfig = new AppConfig(["store_write"]);
   const userSession = new UserSession({ appConfig });
   const appDetails = {
      name: "Hello Stacks",
      icon: "https://freesvg.org/img/1541103084.png",
    };  
   useEffect(() => {
      if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn().then((userData) => {
          setUserData(userData);
        });
      } else if (userSession.isUserSignedIn()) {
        setUserData(userSession.loadUserData());
      }
    }, []);
   const connectWalletSTX = async () => {
      console.log('connectWallet STX')
      try {
         let _provider, _account, _accountPubKey, _nonce, _signer
         let _signedIn = false
         let _network = "mainnet"
         
         showConnect({
            appDetails,
            onFinish: async () => 
            {
               let userData = userSession.loadUserData();
               //console.log("yo yo STX user: ", userData.profile.stxAddress.mainnet)
               _account = userData.profile.stxAddress.mainnet

               const message = 'Hello World \r\n kevin';
               // await openSignatureRequestPopup({
               //    message,
               //    network: new StacksMainnet(),
               //    appDetails: {
               //       name: origin,
               //       icon: window.location.origin + "/my-app-logo.svg",
               //    },
               //    onFinish(data) {
               //       console.log("Signature of the message", data.signature)
               //       console.log("Use public key:", data.publicKey)
               //    }
               // });
               
               // check if JWT exists or is timed out:
               fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/welcome`, {
                  method: 'GET',
                  headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${localStorage.getItem('jwt_' + _account)}`,
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

                        const origin = "https://walletchat.fun";
                        const statement =
                           'You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur';

                        const message = origin + "\r\n" + statement + "\r\n" + _account + "\r\n" + _network + "\r\n" + _nonce;
                        let _signatureSTX;
                     await openSignatureRequestPopup({
                        message,
                           network: new StacksMainnet(),
                           appDetails: {
                              name: origin,
                              icon: window.location.origin + "/my-app-logo.svg",
                           },
                           onFinish(data) {
                              console.log("Signature of the message", data.signature)
                              console.log("Use public key:", data.publicKey)
                              _signatureSTX = data.signature
                              _accountPubKey = data.publicKey
                              // _account = getAddressFromPublicKey(fromHexString(data.publicKey), TransactionVersion.MainnetMultiSig)
                              // console.log("STX Addr:", _account)
                              fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                                 body: JSON.stringify({ "name": _account, "address": toHexString(_accountPubKey), "nonce": _nonce, "msg": message, "sig": toHexString(_signatureSTX) }),
                                 headers: {
                                 'Content-Type': 'application/json'
                                 },
                                 method: 'POST'
                              })
                              .then((response) => response.json())
                              .then(async (data) => {
                                 localStorage.setItem('jwt_' + _account, data.access);
                                 //Used for LIT encryption authSign parameter
                                 //localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                                 //localStorage.setItem('lit-web3-provider', _provider.connection.url);
                                 console.log('✅[INFO][JWT]:', data.access)
                              })
                           },
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

                     const origin = "https://walletchat.fun";
                     const statement =
                        'You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur';

                     const message = origin + "\r\n" + statement + "\r\n" + _account + "\r\n" + _network + "\r\n" + _nonce;
                     let _signatureSTX
                     await openSignatureRequestPopup({
                        message,
                        network: new StacksMainnet(),
                        appDetails: {
                           name: origin,
                           icon: window.location.origin + "/my-app-logo.svg",
                        },
                        onFinish(data) {
                           console.log("Signature of the message", data.signature)
                           console.log("Use public key:", data.publicKey)
                           _signatureSTX = data.signature
                           _accountPubKey = data.publicKey
                           // _account = getAddressFromPublicKey(fromHexString(data.publicKey), TransactionVersion.MainnetMultiSig)
                           // console.log("STX Addr:", _account)

                           fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                              body: JSON.stringify({ "name": _account, "address": toHexString(_accountPubKey), "nonce": _nonce, "msg": message, "sig": toHexString(_signatureSTX) }),
                              headers: {
                                 'Content-Type': 'application/json'
                              },
                              method: 'POST'
                           })
                           .then((response) => response.json())
                           .then(async (data) => {
                              localStorage.setItem('jwt_' + _account, data.access);
                              //Used for LIT encryption authSign parameter
                              // localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                              // localStorage.setItem('lit-web3-provider', _provider.connection.url);
                              console.log('✅[INFO][JWT]:', data.access)
                           })
                           .catch((error) => {
                              console.error('🚨[GET][Sign-In Failed]:', error)
                           })
                        },
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
            },             
            userSession,
         });
      } catch (error) {
         console.log('🚨connectWallet', error)
         if (error.message === "User Rejected") {
            setError("Your permission is needed to continue. Please try signing in again.")
         }
      } finally {
         setAppLoading(false)
      }
   }
   //end STX wallet sign-in


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
            localStorage.clear(); //all items 

            // TODO: was trying to leave decrypted chat history here, but got complicated as I was adding new wallets/chains.  Revist when stable
            // localStorage.removeItem('jwt_' + account)
            // localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
            // localStorage.removeItem('metamask-connected')
            // // localStorage.removeItem('lit-auth-signature')
            // // localStorage.removeItem('lit-web3-provider')
            // localStorage.removeItem('current-address')
            // localStorage.removeItem('@sequence.connectedSites')
            // localStorage.removeItem('@sequence.session')
            // localStorage.removeItem('near-wallet-selector:selectedWalletId')
            // localStorage.removeItem('near-wallet-selector:recentlySignedInWallets')
            // localStorage.removeItem('near_app_wallet_auth_key')
            // localStorage.removeItem('near-wallet-selector:contract')
            // //localStorage.removeItem('near-api-js:keystore:'+name+':mainnet')
         }
         storage.set('current-address', { address: null })
         setAccount(null)
         setChainId(null)
         setAuthenticated(false)
         setWeb3(null)
         navigate('/')
         setBtnClicks(0)
         window.location.reload(); 
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
            connectWalletNEAR,
            connectWalletSTX,
            isAuthenticated,
            appLoading,
            web3,
            provider,
            error,
            redirectUrl,
            setRedirectUrl,
            btnClicks,
            setBtnClicks
         }}
      >
         {children}
      </WalletContext.Provider>
   )
})

export default WalletProvider
