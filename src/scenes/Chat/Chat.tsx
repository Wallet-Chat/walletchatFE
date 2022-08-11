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

import { MessageType, MessageUIType } from '../../types/Message'
import Message from './components/Message'
// import { reverseENSLookup } from '../../helpers/ens'
import { truncateAddress } from '../../helpers/truncateString'
import { isMobile } from 'react-device-detect'
import equal from 'fast-deep-equal/es6'
// import { getIpfsData, postIpfsData } from '../../services/ipfs'

// import EthCrypto, { Encrypted } from 'eth-crypto'
//import sigUtil from 'eth-sig-util'

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
   account,
   web3,
   isAuthenticated,
}: {
   account: string
   web3: Web3
   isAuthenticated: boolean
}) => {
   let { address: toAddr = '' } = useParams()
   // const [ens, setEns] = useState<string>('')
   const [name, setName] = useState()
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
   const [msgInput, setMsgInput] = useState<string>('')
   const [isSendingMessage, setIsSendingMessage] = useState(false)
   const [copiedAddr, setCopiedAddr] = useState<boolean>(false)
   const [chatData, setChatData] = useState<MessageType[]>(
      new Array<MessageType>()
   )
   const [isFetchingChatData, setIsFetchingChatData] = useState<boolean>(false)

   let timer: ReturnType<typeof setTimeout>

   useEffect(() => {
      getChatData()
      const interval = setInterval(() => {
         getChatData()
      }, 5000) // every 5s

      return () => clearInterval(interval)
   }, [isAuthenticated, account, toAddr])

   useEffect(() => {
      if (toAddr) {
         fetch(` ${process.env.REACT_APP_REST_API}/name/${toAddr}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         })
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[GET][Name]:', response)
               if (response[0]?.name) setName(response[0].name)
            })
            .catch((error) => {
               console.error('🚨[GET][Name]:', error)
            })
      }
   }, [toAddr])

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
      if (!toAddr) {
         console.log('Recipient address is not available')
         return
      }
      setIsFetchingChatData(true)
      //console.log(`getall_chatitems/${account}/${toAddr}`)
      fetch(
         ` ${process.env.REACT_APP_REST_API}/getall_chatitems/${account}/${toAddr}`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
         .then((response) => response.json())
         .then(async (data: MessageType[]) => {
            if (equal(data, chatData) === false) {
               console.log('✅[GET][Chat items]:', data)
               setChatData(data)
            }
         })
         .catch((error) => {
            console.error('🚨[GET][Chat items]:', error)
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

   const sendMessage = async () => {
      if (msgInput.length <= 0) return

      // Make a copy and clear input field
      const msgInputCopy = (' ' + msgInput).slice(1)
      setMsgInput('')

      const timestamp = new Date()

      const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs))

      let data = {
         message: msgInputCopy,
         fromAddr: account.toLocaleLowerCase(),
         toAddr: toAddr.toLocaleLowerCase(),
         timestamp,
         read: false,
      }

      addMessageToUI(
         msgInputCopy,
         account,
         toAddr,
         timestamp.toString(),
         false,
         'right',
         true,
         null,
         null
      )

      data.message = msgInputCopy

      setIsSendingMessage(true)
      fetch(` ${process.env.REACT_APP_REST_API}/create_chatitem`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[POST][Send Message]:', data, latestLoadedMsgs)
            getChatData()
         })
         .catch((error) => {
            console.error(
               '🚨[POST][Send message]:',
               error,
               JSON.stringify(data)
            )
         })
         .finally(() => {
            setIsSendingMessage(false)
         })

      if (toAddr === '0x17FA0A61bf1719D12C08c61F211A063a58267A19') {
         if (!process.env.REACT_APP_SLEEKPLAN_API_KEY) {
            console.log('Missing REACT_APP_SLEEKPLAN_API_KEY')
         } else {
            fetch(
               `https://api.sleekplan.com/v1/post`,
               {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${process.env.REACT_APP_SLEEKPLAN_API_KEY}`,
                  },
                  body: JSON.stringify({
                     title: account,
                     type: 'feedback',
                     description: msgInputCopy,
                     user: 347112,
                  }),
               }
            )
               .then((response) => response.json())
               .then((data) => {
                  console.log('✅[POST][Feedback]:', data)
               })
               .catch((error) => {
                  console.error(
                     '🚨[POST][Feedback]:',
                     error,
                     JSON.stringify(data)
                  )
               })
         }
      }
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

   return (
      <Flex background="white" height="100vh" flexDirection="column" flex="1">
         <Box
            p={5}
            pb={3}
            borderBottom="1px solid var(--chakra-colors-lightgray-400)"
         >
            {isMobile && (
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
            )}

            {toAddr && (
               <Flex alignItems="center" justifyContent="space-between">
                  <Flex alignItems="center">
                     <BlockieWrapper>
                        <Blockies seed={toAddr.toLocaleLowerCase()} scale={4} />
                     </BlockieWrapper>
                     <Box ml={2}>
                        {name ? (
                           <Box>
                              <Text
                                 fontWeight="bold"
                                 color="darkgray.800"
                                 fontSize="md"
                              >
                                 {name}
                              </Text>
                              <Text fontSize="sm" color="darkgray.500">
                                 {truncateAddress(toAddr)}
                              </Text>
                           </Box>
                        ) : (
                           <Text
                              fontWeight="bold"
                              color="darkgray.800"
                              fontSize="md"
                           >
                              {truncateAddress(toAddr)}
                           </Text>
                        )}
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
            {/* {isFetchingChatData && loadedMsgs.length === 0 && (
               <Flex justifyContent="center" alignItems="center" height="100%">
                  <Spinner />
               </Flex>
            )} */}
            {toAddr === '0x17FA0A61bf1719D12C08c61F211A063a58267A19' && (
               <Flex
                  justifyContent="center"
                  alignItems="center"
                  borderRadius="lg"
                  background="green.200"
                  p={4}
               >
                  <Box fontSize="md">
                     We welcome all feedback and bug reports. Thank you! 😊
                  </Box>
               </Flex>
            )}
            {loadedMsgs.map((msg: MessageUIType, i) => {
               if (msg && msg.message) {
                  return (
                     <Message
                        key={`${msg.message}${msg.timestamp}`}
                        account={account}
                        msg={msg}
                        updateRead={updateRead}
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
                  onKeyPress={(e) => handleKeyPress(e)}
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

export default Chat
