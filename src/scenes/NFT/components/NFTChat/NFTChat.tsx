import { useEffect, useState, KeyboardEvent } from 'react'
import {
   Box,
   Button,
   Flex,
   FormControl,
   Link as CLink,
   Text,
} from '@chakra-ui/react'
import Blockies from 'react-blockies'
import TextareaAutosize from 'react-textarea-autosize'
import { IconCheck, IconCopy, IconExternalLink, IconSend } from '@tabler/icons'
import equal from 'fast-deep-equal/es6'
// import EthCrypto, { Encrypted } from 'eth-crypto'
// import { parseIsolatedEntityName } from 'typescript'

import { MessageType, MessageUIType, SettingsType } from '../../../../types/Message'
// import EncryptedMsgBlock from '../../../../types/Message'
import { truncateAddress } from '../../../../helpers/truncateString'
import { DottedBackground } from '../../../../styled/DottedBackground'
import { BlockieWrapper } from '../../../../styled/BlockieWrapper'
import ChatMessage from '../../../../components/Chat/ChatMessage'
// import { getIpfsData, postIpfsData } from '../../../../services/ipfs'


const NFTChat = ({
   recipientAddr,
   account,
   nftContractAddr,
   nftId,
}: {
   recipientAddr: string | undefined | null
   account: string
   nftContractAddr: string
   nftId: string
}) => {
   const [copiedAddr, setCopiedAddr] = useState<boolean>(false)
   const [msgInput, setMsgInput] = useState<string>('')
   const [isSendingMessage, setIsSendingMessage] = useState(false)
   const [chatData, setChatData] = useState<MessageType[]>(
      new Array<MessageType>()
   )
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])

   // const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false)

   let timer: ReturnType<typeof setTimeout>

   useEffect(() => {
      getChatData()
   }, [account])

   useEffect(() => {
      // Interval needs to reset else getChatData will use old state
      const interval = setInterval(() => {
         getChatData()
      }, 5000) // every 5s

      return () => {
         clearInterval(interval)
      }
   }, [chatData, account])

   const getChatData = () => {
      // GET request to get off-chain data for RX user
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      if (!account || !recipientAddr) {
         console.log('No account connected')
         return
      }
      // setIsFetchingMessages(true)
      fetch(
         ` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/getnft_chatitems/${account}/${recipientAddr}/${nftContractAddr}/${nftId}`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               //Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
            },
         }
      )
         .then((response) => response.json())
         .then(async (data: MessageType[]) => {
            if (equal(data, chatData) === false) {
               console.log('✅[GET][NFT][Messages]:', data)
               setChatData(data)
            }
         })
         .catch((error) => {
            console.error('🚨[GET][NFT][Messages]:', error)
         })
         // .finally(() => {
         //    setIsFetchingMessages(false)
         // })
   }

   const handleMessageKeyPress = (
      event: KeyboardEvent<HTMLTextAreaElement>
   ) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         sendMessage()
      }
   }

   const sendMessage = async () => {
      if (msgInput.length <= 0) return

      // Make a copy and clear input field
      const msgInputCopy = (' ' + msgInput).slice(1)
      setMsgInput('')

      const timestamp = new Date()

      const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs))

      console.log('nft id from sendMessage: ', nftId)

      let data = {
         message: msgInputCopy,
         fromAddr: account.toLocaleLowerCase(),
         toAddr: recipientAddr ? recipientAddr.toLocaleLowerCase() : '',
         timestamp,
         nftaddr: nftContractAddr,
         nftid: nftId,
         read: false,
      }

      addMessageToUI(
         msgInputCopy,
         account,
         recipientAddr ? recipientAddr.toLocaleLowerCase() : '',
         timestamp.toString(),
         false,
         'right',
         true,
         '',
         null
      )

      // TODO: ENCRYPT MESSAGES HERE / https://github.com/cryptoKevinL/extensionAccessMM/blob/main/sample-extension/index.js

      // let toAddrPublicKey = await getPublicKeyFromSettings() //TODO: should only need to do this once per convo (@manapixels help move it)

      // console.log('encrypt with public key: ', toAddrPublicKey)
      // const encryptedTo = await EthCrypto.encryptWithPublicKey(
      //    toAddrPublicKey,
      //    msgInputCopy
      // )

      // //we have to encrypt the sender side with its own public key, if we want to refresh data from server
      // const encryptedFrom = await EthCrypto.encryptWithPublicKey(
      //    publicKey,
      //    msgInputCopy
      // )

      // //lets try and use IPFS instead of any actual data stored on our server
      // const cid = await postIpfsData(
      //    JSON.stringify({ to: encryptedTo, from: encryptedFrom })
      // )

      //const cid = await postIpfsData(msgInputCopy)
      data.message = msgInputCopy //await cid

      setIsSendingMessage(true)
      fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/create_chatitem`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            //Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[POST][NFT][Send message]:', data, latestLoadedMsgs)
            getChatData()
         })
         .catch((error) => {
            console.error(
               '🚨[POST][NFT][Send message]:',
               error,
               JSON.stringify(data)
            )
         })
         .finally(() => {
            setIsSendingMessage(false)
         })
   }

   const addMessageToUI = (
      message: string,
      fromAddr: string,
      toAddr: string,
      timestamp: string,
      read: boolean,
      position: string,
      isFetching: boolean,
      nftAddr: string | null,
      nftId: string | null
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
         nftAddr,
         nftId,
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
            read: true,
         }
         setLoadedMsgs(newLoadedMsgs)
      }
   }

   const copyToClipboard = () => {
      if (recipientAddr) {
         console.log('Copy to clipboard', recipientAddr)
         let textField = document.createElement('textarea')
         textField.innerText = recipientAddr
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

   useEffect(() => {
      const toAddToUI = [] as MessageUIType[]

      for (let i = 0; i < chatData.length; i++) {
         if (
            chatData[i] &&
            chatData[i].toaddr &&
            chatData[i].toaddr.toLowerCase() === account.toLowerCase()
         ) {
            toAddToUI.push({
               sender_name: chatData[i].sender_name,
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               toAddr: chatData[i].toaddr,
               timestamp: chatData[i].timestamp,
               read: chatData[i].read,
               id: chatData[i].id,
               position: 'left',
               isFetching: false,
               nftAddr: chatData[i].nftaddr,
               nftId: chatData[i].nftid,
            })
         } else if (
            chatData[i] &&
            chatData[i].toaddr &&
            chatData[i].fromaddr.toLowerCase() === account.toLowerCase()
         ) {
            toAddToUI.push({
               sender_name: chatData[i].sender_name,
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               toAddr: chatData[i].toaddr,
               timestamp: chatData[i].timestamp,
               read: chatData[i].read,
               id: chatData[i].id,
               position: 'right',
               isFetching: false,
               nftAddr: chatData[i].nftaddr,
               nftId: chatData[i].nftid,
            })
         }
      }
      setLoadedMsgs(toAddToUI)
   }, [chatData, account])

   return (
      <Flex flexDirection="column" height="100%">
         {recipientAddr && (
            <Flex
               alignItems="center"
               justifyContent="space-between"
               padding="var(--chakra-space-4) var(--chakra-space-5)"
            >
               <Flex alignItems="center">
                  <BlockieWrapper>
                     <Blockies
                        seed={recipientAddr.toLocaleLowerCase()}
                        scale={4}
                     />
                  </BlockieWrapper>
                  <Box>
                     <Text
                        ml={2}
                        fontSize="md"
                        fontWeight="bold"
                        color="darkgray.800"
                     >
                        {truncateAddress(recipientAddr)}
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
                     href={`https://etherscan.io/address/${recipientAddr}`}
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
         <DottedBackground className="custom-scrollbar">
            {loadedMsgs.map((msg: MessageUIType, i) => {
               if (msg && msg.message) {
                  return (
                     <ChatMessage
                        key={`${msg.message}${msg.timestamp}`}
                        account={account}
                        msg={msg}
                        updateRead={updateRead}
                        context="nfts"
                     />
                  )
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
                  onKeyPress={(e) => handleMessageKeyPress(e)}
                  className="custom-scrollbar"
                  style={{
                     resize: 'none',
                     padding: '.5rem 1rem',
                     width: '100%',
                     fontSize: 'var(--chakra-fontSizes-md)',
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
                  isLoading={isSendingMessage}
               >
                  <IconSend size="20" />
               </Button>
            </Flex>
         </Flex>
      </Flex>
   )
}

export default NFTChat
