import {
   Box,
   FormControl,
   Button,
   Flex,
   Text,
   Link as CLink,
   Spinner,
} from '@chakra-ui/react'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Web3 from 'web3'
import styled from 'styled-components'
import {
   IconArrowLeft,
   IconCheck,
   IconCopy,
   IconExternalLink,
   IconSend,
} from '@tabler/icons'
import Blockies from 'react-blockies'
import TextareaAutosize from 'react-textarea-autosize'

   import SettingsType from '../../types/Message'
import MessageType from '../../types/Message'
import MessageUIType from '../../types/MessageUI'
import Message from './components/Message'
// import { reverseENSLookup } from '../../helpers/ens'
import { truncateAddress } from '../../helpers/truncateString'
import { getIpfsData, postIpfsData } from '../../services/ipfs'

import EthCrypto, { Encrypted } from 'eth-crypto'
import sigUtil from 'eth-sig-util'

const BlockieWrapper = styled.div`
   border-radius: 0.3rem;
   overflow: hidden;
`
const DottedBackground = styled.div`
   flex-grow: 1;
   width: 100%;
   height: auto;
   background: linear-gradient(
            90deg,
            var(--chakra-colors-lightgray-200) 14px,
            transparent 1%
         )
         center,
      linear-gradient(var(--chakra-colors-lightgray-200) 14px, transparent 1%)
         center,
      #9dadc3 !important;
   background-size: 15px 15px !important;
   background-position: top left !important;
   padding: var(--chakra-space-1);
   overflow-y: scroll;
`

const Chat = ({
   publicKey,
   privateKey,
   account,
   web3,
   isAuthenticated,
}: {
   publicKey: string
   privateKey: string 
   account: string
   web3: Web3
   isAuthenticated: boolean
}) => {
   let { address: toAddr = '' } = useParams()
   // const [ens, setEns] = useState<string>('')
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
   const [msgInput, setMsgInput] = useState<string>('')
   const [copiedAddr, setCopiedAddr] = useState<boolean>(false)
   const [chatData, setChatData] = useState<MessageType[]>(
      new Array<MessageType>()
   )
   const [isFetchingChatData, setIsFetchingChatData] = useState<boolean>(false)

   let timer: ReturnType<typeof setTimeout>

   useEffect(() => {
      const interval = setInterval(() => {
         getChatData()
         }, 30000) // every 30s
      
         return () => clearInterval(interval)
   }, [])

   // useEffect(() => {
   //    const getENS = async () => {
   //       const ensValue = await reverseENSLookup(toAddr, web3)
   //       if (ensValue) {
   //          setEns(ensValue)
   //       }
   //    }
   //    getENS()
   // }, [toAddr])

   useEffect(() => {
      getChatData()
   }, [isAuthenticated, account])

   function getChatData() {
      // GET request to get off-chain data for RX user
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      if (!account) {
         console.log('No account connected')
         return
      }
      if (!isAuthenticated) {
         console.log('Not authenticated')
         return
      }
      setIsFetchingChatData(true)
      fetch(` ${process.env.REACT_APP_REST_API}/getall_chatitems/${account}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
         .then((response) => response.json())
         .then(async (data: MessageType[]) => {
            console.log('✅ GET [Chat items]:', data)

            const replica = JSON.parse(JSON.stringify(data));

            // Get data from IPFS and replace the message with the fetched text
            for (let i = 0; i < replica.length; i++) {
               const rawmsg = await getIpfsData(replica[i].message)
               //console.log("raw message decoded", rawmsg)

               let encdata: Encrypted = JSON.parse(rawmsg);
               const decrypted = await EthCrypto.decryptWithPrivateKey(
                  privateKey,
                  encdata
              );

               replica[i].message = decrypted
            }

            setChatData(replica)

            // TODO: DECRYPT MESSAGES HERE / https://github.com/cryptoKevinL/extensionAccessMM/blob/main/sample-extension/index.js
            setIsFetchingChatData(false)
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [GET]:', error)
            setIsFetchingChatData(false)
         })
   }

   useEffect(() => {
      const toAddToUI = [] as MessageUIType[]

      for (let i = 0; i < chatData.length; i++) {
         if (
            chatData[i] &&
            chatData[i].toaddr &&
            chatData[i].toaddr.toLowerCase() === account.toLowerCase()
         ) {
            toAddToUI.push({
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               toAddr: chatData[i].toaddr,
               timestamp: chatData[i].timestamp,
               read: chatData[i].read,
               id: chatData[i].id,
               position: 'left',
               isFetching: false,
            })
         } else if (
            chatData[i] &&
            chatData[i].toaddr &&
            chatData[i].fromaddr.toLowerCase() === account.toLowerCase()
         ) {
            toAddToUI.push({
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               toAddr: chatData[i].toaddr,
               timestamp: chatData[i].timestamp,
               read: chatData[i].read,
               id: chatData[i].id,
               position: 'right',
               isFetching: false,
            })
         }
      }
      setLoadedMsgs(toAddToUI)
   }, [chatData, account])

   const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         sendMessage()
      }
   }

   const copyToClipboard = () => {
      if (toAddr) {
         console.log('Copy to clipboard', toAddr)
         let textField = document.createElement('textarea')
         textField.innerText = toAddr
         document.body.appendChild(textField)
         textField.select()
         document.execCommand('copy')
         textField.focus()
         textField.remove()
         setCopiedAddr(true)

         window.clearTimeout(timer)
         timer = setTimeout(() => {
            setCopiedAddr(false)
         }, 3000)
      }
   }

   // async function encrypt (msg: string, toAddrPublicKey: string) {
   //    const encrypted = await EthCrypto.encryptWithPublicKey(
   //       toAddrPublicKey, 
   //       msg
   //   )

   //   return encrypted;
   //  }

   //  async function decrypt (msg: Encrypted) {
   //    const decrypted = await EthCrypto.decryptWithPrivateKey(
   //       privateKey,
   //       msg
   //   );

   //   return decrypted;
   //  }

   //  async function encrypt (msg: string) {
   //    //get TO address public key from setting API

   //    const buf = Buffer.from(
   //      JSON.stringify(
   //        sigUtil.encrypt(
   //          publicKey, //this needs to be TO address public key
   //          { data: msg },
   //          'x25519-xsalsa20-poly1305'
   //        )
   //      ),
   //      'utf8'
   //    )
    
   //    return '0x' + buf.toString('hex')
   //  }

   //  async function decrypt (msgbuf: string) {
   //    //convert msgbuf string to correct data type

   //    const buf = Buffer.from(
   //      JSON.stringify(
   //        sigUtil.decrypt(
   //           { data: msg },
   //           privateKey,
   //        )
   //      ),
   //      'utf8'
   //    )
    
   //    return '0x' + buf.toString('hex')
   //  }

   //TODO: only get this TO address public key once per conversation (was't sure where this would go yet)
   const getPublicKeyFromSettings = async () => {
      let toAddrPublicKey = ""
      await fetch(` ${process.env.REACT_APP_REST_API}/get_settings/${toAddr}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
      .then((response) => response.json())
      .then(async (settings: SettingsType[]) => {
         console.log('✅ GET [Public Key]:', settings)
         toAddrPublicKey = settings[0].publickey
      })

      return await toAddrPublicKey
   }
   //end get public key that should only need to be done once per conversation

   const sendMessage = async () => {
      if (msgInput.length <= 0) return

      // Make a copy and clear input field
      const msgInputCopy = (' ' + msgInput).slice(1)
      setMsgInput('')

      const timestamp = new Date()

      const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs));

      let data = {
         message: msgInputCopy,
         fromAddr: account.toLocaleLowerCase(),
         toAddr: toAddr.toLocaleLowerCase(),
         timestamp,
         read: false,
      }

      addMessageToUI(msgInputCopy, account, toAddr, timestamp, false, 'right', true)

      // TODO: ENCRYPT MESSAGES HERE / https://github.com/cryptoKevinL/extensionAccessMM/blob/main/sample-extension/index.js
      let toAddrPublicKey = await getPublicKeyFromSettings()  //TODO: should only need to do this once per convo (@manapixels help move it)
 
      console.log("encrypt with public key: ", toAddrPublicKey)
      const encrypted = await EthCrypto.encryptWithPublicKey(
         toAddrPublicKey, 
         msgInputCopy
     )
       
      //lets try and use IPFS instead of any actual data stored on our server
      const cid = await postIpfsData(JSON.stringify(encrypted))
      data.message = cid

      fetch(` ${process.env.REACT_APP_REST_API}/create_chatitem`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅ POST/Send Message:', data, latestLoadedMsgs)
            getChatData()

            // let indexOfMsg = -1

            // for (let i = latestLoadedMsgs.length - 1; i > 0; i--) {
            //    console.log(latestLoadedMsgs[i], data)
            //    if (
            //       latestLoadedMsgs[i].message === data.message &&
            //       latestLoadedMsgs[i].timestamp.getTime() === data.timestamp.getTime()
            //    ) {
            //       indexOfMsg = i
            //       break
            //    }
            // }
            // if (indexOfMsg !== -1) {
            //    let newLoadedMsgs: MessageUIType[] = [...latestLoadedMsgs] // copy the old array
            //    newLoadedMsgs[indexOfMsg]['isFetching'] = false
            //    setLoadedMsgs(newLoadedMsgs)
            // } else {
            //    let newLoadedMsgs: MessageUIType[] = [...latestLoadedMsgs] // copy the old array
            //    newLoadedMsgs.push({
            //       ...data,
            //       isFetching: false
            //    })
            // }
         })
         .catch((error) => {
            console.error(
               '🚨🚨REST API Error [POST]:',
               error,
               JSON.stringify(data)
            )
         })
   }

   const addMessageToUI = (
      message: string,
      fromAddr: string,
      toAddr: string,
      timestamp: Date,
      read: boolean,
      position: string,
      isFetching: boolean
   ) => {
      console.log(`Add message to UI: ${message}`)

      const newMsg: MessageUIType = {
         message,
         fromAddr,
         toAddr,
         timestamp,
         read,
         position,
         isFetching,
      }
      let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
      newLoadedMsgs.push(newMsg)
      setLoadedMsgs(newLoadedMsgs)
   }

   const updateRead = (data: MessageUIType) => {
      let indexOfMsg = -1
      let newLoadedMsgs = [...loadedMsgs]
      for (let i = newLoadedMsgs.length - 1; i > 0; i--) {
         if (newLoadedMsgs[i].timestamp === data.timestamp) {
            indexOfMsg = i
            break
         }
      }
      if (indexOfMsg !== -1) {
         newLoadedMsgs[indexOfMsg] = {
            ...newLoadedMsgs[indexOfMsg],
            read: true
         }
         setLoadedMsgs(newLoadedMsgs)
      }
      
   }

   return (
      <Flex background="white" height="100vh" flexDirection="column">
         <Box
            p={5}
            pb={3}
            borderBottom="1px solid var(--chakra-colors-lightgray-400)"
         >
            <Box mb={4}>
               <Link to="/chat" style={{ textDecoration: 'none' }}>
                  <Button
                     colorScheme="gray"
                     background="lightgray.300"
                     size="sm"
                  >
                     <Flex alignItems="center">
                        <IconArrowLeft size={18} />
                        <Text ml="1">Back to Inbox</Text>
                     </Flex>
                  </Button>
               </Link>
            </Box>

            {toAddr && (
               <Flex alignItems="center" justifyContent="space-between">
                  <Flex alignItems="center">
                     <BlockieWrapper>
                        <Blockies seed={toAddr.toLocaleLowerCase()} scale={4} />
                     </BlockieWrapper>
                     <Box>
                        <Text ml={2} fontWeight="bold" color="darkgray.800">
                           {truncateAddress(toAddr)}
                        </Text>
                        {/* {ens && (
                           <Text fontWeight="bold" color="darkgray.800">
                              {ens}
                           </Text>
                        )} */}
                     </Box>
                  </Flex>
                  <Box>
                     {document.queryCommandSupported('copy') && (
                        <Button
                           onClick={() => copyToClipboard()}
                           size="xs"
                           disabled={copiedAddr}
                           ml={3}
                        >
                           {copiedAddr ? (
                              <IconCheck
                                 size={20}
                                 color="var(--chakra-colors-darkgray-500)"
                                 stroke="1.5"
                              />
                           ) : (
                              <IconCopy
                                 size={20}
                                 color="var(--chakra-colors-lightgray-900)"
                                 stroke="1.5"
                              />
                           )}
                        </Button>
                     )}
                     <Button
                        href={`https://etherscan.io/address/${toAddr}`}
                        target="_blank"
                        as={CLink}
                        size="xs"
                        ml={2}
                     >
                        <IconExternalLink
                           size={20}
                           color="var(--chakra-colors-lightgray-900)"
                           stroke="1.5"
                        />
                     </Button>
                  </Box>
               </Flex>
            )}
         </Box>

         <DottedBackground className="custom-scrollbar">
            {isFetchingChatData && loadedMsgs.length === 0 && (
               <Flex justifyContent="center" alignItems="center" height="100%">
                  <Spinner />
               </Flex>
            )}
            {loadedMsgs.map((msg: MessageUIType, i) => {
               if (msg && msg.message) {
                  return <Message key={`${msg.message}${msg.timestamp}`} account={account} msg={msg} updateRead={updateRead} />
               }
               return null
            })}
         </DottedBackground>

         <Flex>
            <FormControl style={{ flexGrow: 1 }}>
               <TextareaAutosize
                  placeholder="Write a message..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e)}
                  className="custom-scrollbar"
                  style={{
                     resize: 'none',
                     padding: '.5rem 1rem',
                     width: '100%',
                     fontSize: '90%',
                     background: 'var(--chakra-colors-lightgray-400)',
                     borderRadius: '0.3rem',
                     marginBottom: '-6px',
                  }}
                  maxRows={8}
               />
            </FormControl>
            <Flex alignItems="flex-end">
               <Button
                  variant="black"
                  height="100%"
                  onClick={() => sendMessage()}
               >
                  <IconSend size="20" />
               </Button>
            </Flex>
         </Flex>
      </Flex>
   )
}

export default Chat
