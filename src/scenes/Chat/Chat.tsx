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

import MessageType from '../../types/Message'
import { MessageUIType } from '../../types/MessageUI'
import Message from './components/Message'
import { reverseENSLookup } from '../../helpers/ens'
import { truncateAddress } from '../../helpers/truncateString'

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
`

// const testloadingmsgs = [{
//    streamID: 'Message 2 test. Mauris tempor lacus vel mollis viverra. Donec rutrum quis ex ut cursus. Nunc tincidunt odio non maximus vulputate. Nunc hendrerit dictum maximus.',
//    fromName: 'Steven',
//    fromAddr: '0x4A8a9147ab0DF5A8949f964bDBA22dc4583280E2',
//    toAddr: '0xd07310e7427744BE216CD4b3068b99632aB6f83a',
//    read: false,
//    timestamp: new Date(),
//    id: 2,
//    position: 'left',
// }, {
//    streamID: 'Hello there',
//    fromName: 'Steven',
//    fromAddr: '0x4A8a9147ab0DF5A8949f964bDBA22dc4583280E2',
//    toAddr: '0xd07310e7427744BE216CD4b3068b99632aB6f83a',
//    read: true,
//    timestamp: new Date(),
//    id: 1,
//    position: 'left',
// }, {
//    streamID: ' Pellentesque augue elit, gravida nec sapien a, lobortis bibendum purus.',
//    fromName: '',
//    fromAddr: '0xd07310e7427744BE216CD4b3068b99632aB6f83a',
//    toAddr: '0x4A8a9147ab0DF5A8949f964bDBA22dc4583280E2',
//    read: true,
//    timestamp: new Date(),
//    id: 0,
//    position: 'right',
// }]

const Chat = ({
   account,
   web3,
   isAuthenticated,
}: {
   account: string
   web3: Web3
   isAuthenticated: boolean
}) => {
   let { address: toAddr = '' } = useParams()
   const [ens, setEns] = useState<string>('')
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>(
      []
      // [...testloadingmsgs]
   )
   const [msgInput, setMsgInput] = useState<string>('')
   const [copiedAddr, setCopiedAddr] = useState<boolean>(false)
   const [chatData, setChatData] = useState<MessageType[]>(
      new Array<MessageType>()
   )
   const [isFetchingChatData, setIsFetchingChatData] = useState<boolean>(false)

   useEffect(() => {
      const getENS = async () => {
         const ensValue = await reverseENSLookup(toAddr, web3)
         if (ensValue) {
            setEns(ensValue)
         }
      }
      getENS()
   }, [toAddr])

   useEffect(() => {
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
         setIsFetchingChatData(true)
         fetch(
            ` ${process.env.REACT_APP_REST_API}/getall_chatitems/${account}`,
            {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
               },
            }
         )
            .then((response) => response.json())
            .then((data: MessageType[]) => {
               console.log('✅ GET:', data)
               setChatData(data)
               // TODO: DECRYPT MESSAGES HERE / https://github.com/cryptoKevinL/extensionAccessMM/blob/main/sample-extension/index.js
               setIsFetchingChatData(false)
            })
            .catch((error) => {
               console.error('🚨🚨REST API Error [GET]:', error)
               setIsFetchingChatData(false)
            })
      }
      if (isAuthenticated && account) {
         getChatData()
      }
   }, [isAuthenticated, account])

   useEffect(() => {
      const toAddToUI = []

      for (let i = 0; i < chatData.length; i++) {
         if (chatData[i].toAddr.toLowerCase() === account.toLowerCase()) {
            toAddToUI.push({
               streamID: chatData[i].streamID,
               fromAddr: chatData[i].fromAddr,
               toAddr: chatData[i].toAddr,
               timestamp: chatData[i].timestamp,
               read: chatData[i].read,
               id: chatData[i].id,
               position: 'left',
               isFetching: false,
            })
         } else if (
            chatData[i].fromAddr.toLowerCase() === account.toLowerCase()
         ) {
            toAddToUI.push({
               streamID: chatData[i].streamID,
               fromAddr: chatData[i].fromAddr,
               toAddr: chatData[i].toAddr,
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
         sendMessage()
      }
   }

   const copyToClipboard = () => {
      if (toAddr) {
         let textField = document.createElement('textarea')
         textField.innerText = toAddr
         document.body.appendChild(textField)
         textField.select()
         document.execCommand('copy')
         textField.focus()
         textField.remove()
         setCopiedAddr(true)

         setTimeout(() => {
            setCopiedAddr(false)
         }, 3000)
      }
   }

   const sendMessage = () => {
      if (msgInput.length <= 0) return

      const timestamp = new Date()

      const data = {
         streamID: msgInput,
         fromName: account,
         fromAddr: account,
         toAddr: toAddr,
         timestamp,
         read: false,
      }

      addMessageToUI(msgInput, account, toAddr, timestamp, false, 'right', true)

      // TODO: ENCRYPT MESSAGES HERE / https://github.com/cryptoKevinL/extensionAccessMM/blob/main/sample-extension/index.js

      setMsgInput('') // clear message upon sending it

      fetch(` ${process.env.REACT_APP_REST_API}/create_chatitem`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json()) //Then with the data from the response in JSON...
         .then((data) => {
            console.log('✅ POST/Send Message:', data)
            if (data.id - 1) {
               let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
               newLoadedMsgs[data.id - 1]['isFetching'] = false
               setLoadedMsgs(newLoadedMsgs)
            }
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [POST]:', error)
         })
   }

   const editMessage = (data: MessageType, id: number) => {
      fetch(` ${process.env.REACT_APP_REST_API}/${id}`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅ PUT/Edit Message:', data)
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [PUT]:', error)
         })
   }

   const addMessageToUI = (
      streamID: string,
      fromAddr: string,
      toAddr: string,
      timestamp: Date,
      read: boolean,
      position: string,
      isFetching: boolean
   ) => {
      console.log(`Add message to UI: ${streamID}`)

      const newMsg: MessageUIType = {
         streamID,
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
               <Flex alignItems="center">
                  <BlockieWrapper>
                     <Blockies seed={toAddr.toLocaleLowerCase()} scale={4} />
                  </BlockieWrapper>
                  <Box>
                     <Text ml={2} fontWeight="bold" color="darkgray.800">
                        {truncateAddress(toAddr)}
                     </Text>
                     {ens && (
                        <Text fontWeight="bold" color="darkgray.800">
                           {ens}
                        </Text>
                     )}
                  </Box>
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
                              color="var(--chakra-colors-darkgray-800)"
                              stroke="1.5"
                           />
                        ) : (
                           <IconCopy
                              size={20}
                              color="var(--chakra-colors-darkgray-500)"
                              stroke="1.5"
                           />
                        )}
                     </Button>
                  )}
                  <Button
                     href={`https://etherscan.io/address/${toAddr}`}
                     as={CLink}
                     size="xs"
                     ml={2}
                  >
                     <IconExternalLink
                        size={20}
                        color="var(--chakra-colors-darkgray-500)"
                        stroke="1.5"
                     />
                  </Button>
               </Flex>
            )}
         </Box>

         <DottedBackground>
            {isFetchingChatData && (
               <Flex justifyContent="center" alignItems="center" height="100%">
                  <Spinner />
               </Flex>
            )}
            {loadedMsgs.map((msg: MessageUIType, i) => {
               if (msg && msg.streamID) {
                  return <Message key={msg.streamID} msg={msg} />
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
