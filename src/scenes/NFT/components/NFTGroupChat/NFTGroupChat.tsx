import {
   Box,
   Button,
   Divider,
   Flex,
   FormControl,
   Tag,
} from '@chakra-ui/react'
import { IconSend } from '@tabler/icons'
import { useEffect, useState, KeyboardEvent, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import styled from 'styled-components'
import equal from 'fast-deep-equal/es6'

import { getFormattedDate } from '../../../../helpers/date'
import { GroupMessageType, MessageUIType } from '../../../../types/Message'
import generateItems from '../../helpers/generateGroupedByDays'
import Message from './components/Message'


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

const NFTGroupChat = ({
   account,
   nftContractAddr,
}: {
   account: string | undefined
   nftContractAddr: string
}) => {
   const [firstLoad, setFirstLoad] = useState(true)
   const [msgInput, setMsgInput] = useState<string>('')
   const [isSendingMessage, setIsSendingMessage] = useState(false)
   // const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false)
   const [chatData, setChatData] = useState<GroupMessageType[]>([])
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])

   const scrollToBottomRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      getChatData()
   }, [account, nftContractAddr])

   useEffect(() => {
      // Interval needs to reset else getChatData will use old state
      const interval = setInterval(() => {
         getChatData()
      }, 5000) // every 5s

      return () => {
         clearInterval(interval)
      }
   }, [chatData, account, nftContractAddr])

   const getChatData = async () => {
      if (!account) {
         console.log('No account connected')
         return
      }

      // setIsFetchingMessages(true)

      fetch(
         ` ${process.env.REACT_APP_REST_API}/get_groupchatitems/${nftContractAddr}/${account}`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
         .then((response) => response.json())
         .then((data: GroupMessageType[]) => {
            if (equal(data, chatData) === false) {
               console.log('✅[GET][NFT][Group Chat Messages By Addr]:', data)
               setChatData(data)
            }
         })
         .catch((error) => {
            console.error('🚨[GET][NFT][Group Chat Messages By Addr]:', error)
         })
         // .finally(() => setIsFetchingMessages(false))
   }

   useEffect(() => {
      const toAddToUI = [] as MessageUIType[]

      for (let i = 0; i < chatData.length; i++) {
         if (
            account &&
            chatData[i] &&
            chatData[i].fromaddr &&
            chatData[i].fromaddr.toLowerCase() === account.toLowerCase()
         ) {
            toAddToUI.push({
               sender_name: chatData[i].sender_name,
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               timestamp: chatData[i].timestamp,
               position: 'right',
               isFetching: false,
               nftAddr: chatData[i].nftaddr,
            })
         } else {
            toAddToUI.push({
               sender_name: chatData[i].sender_name,
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               timestamp: chatData[i].timestamp,
               position: 'left',
               isFetching: false,
               nftAddr: chatData[i].nftaddr,
            })
         }
      }
      const items = generateItems(toAddToUI)
      setLoadedMsgs(items)
   }, [chatData, account])

   useEffect(() => {
      // Scroll to bottom of chat once all messages are loaded
      if (scrollToBottomRef?.current && firstLoad) {
         scrollToBottomRef.current.scrollIntoView()

         setTimeout(() => {
            setFirstLoad(false)
         }, 5000)
      }
   }, [loadedMsgs])

   const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         sendMessage()
      }
   }

   const sendMessage = async () => {
      if (msgInput.length <= 0) return
      if (!account) {
         console.log('No account connected')
         return
      }

      // Make a copy and clear input field
      const msgInputCopy = (' ' + msgInput).slice(1)
      setMsgInput('')

      const timestamp = new Date()

      const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs))

      let data = {
         message: msgInputCopy,
         fromaddr: account.toLocaleLowerCase(),
         nftaddr: nftContractAddr.toLocaleLowerCase(),
         timestamp,
      }

      addMessageToUI(
         msgInputCopy,
         account,
         timestamp.toString(),
         'right',
         false,
         nftContractAddr
      )

      data.message = msgInputCopy

      setIsSendingMessage(true)
      fetch(` ${process.env.REACT_APP_REST_API}/create_groupchatitem`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[POST][Message]:', data, latestLoadedMsgs)
            getChatData()
         })
         .catch((error) => {
            console.error('🚨[POST][Message]:', error, JSON.stringify(data))
         })
         .finally(() => {
            setIsSendingMessage(false)
         })
   }

   const addMessageToUI = (
      message: string,
      fromaddr: string,
      timestamp: string,
      position: string,
      isFetching: boolean,
      nftaddr: string | null
   ) => {
      console.log(`Add message to UI: ${message}`)

      const newMsg: MessageUIType = {
         message,
         fromAddr: fromaddr,
         timestamp,
         position,
         isFetching,
         nftAddr: nftaddr,
      }
      let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
      newLoadedMsgs.push(newMsg)
      setLoadedMsgs(newLoadedMsgs)
   }

   return (
      <Flex flexDirection="column" height="100%">
         {/* <Box py={2} px={6}>
            <Stack spacing={5} direction="row">
               <Checkbox defaultChecked size="sm">Project</Checkbox>
               <Checkbox defaultChecked size="sm">Users</Checkbox>
               <Checkbox defaultChecked size="sm">Holders</Checkbox>
            </Stack>
         </Box> */}

         <DottedBackground className="custom-scrollbar">
            {loadedMsgs.length === 0 && (
               <Flex
                  justifyContent="center"
                  alignItems="center"
                  borderRadius="lg"
                  background="white"
                  p={4}
               >
                  <Box fontSize="md">
                     Be the first to post something here 😉
                  </Box>
               </Flex>
            )}
            {loadedMsgs.map((msg, i) => {
               if (msg.type && msg.type === 'day') {
                  return (
                     <Box
                        position="relative"
                        my={6}
                        key={`${msg.timestamp}${i}`}
                     >
                        <Tag
                           color="lightgray.800"
                           background="lightgray.200"
                           fontSize="xs"
                           fontWeight="bold"
                           mb={1}
                           position="absolute"
                           right="var(--chakra-space-4)"
                           top="50%"
                           transform="translateY(-50%)"
                        >
                           {getFormattedDate(msg.timestamp.toString())}
                        </Tag>
                        <Divider />
                     </Box>
                  )
               } else if (msg.message) {
                  return (
                     <Message
                        key={`${msg.message}${msg.timestamp}${i}`}
                        msg={msg}
                     />
                  )
               }
               return null
            })}
            <Box
               float="left"
               style={{ clear: 'both' }}
               ref={scrollToBottomRef}
            ></Box>
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

export default NFTGroupChat
