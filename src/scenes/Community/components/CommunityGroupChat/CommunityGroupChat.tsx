import {
   Box,
   Button,
   Divider,
   Flex,
   FormControl,
   Spinner,
   Tag,
   Text,
} from '@chakra-ui/react'
import { IconSend } from '@tabler/icons'
import { useEffect, useState, KeyboardEvent, useRef } from 'react'
import { Link as RLink } from 'react-router-dom'
import TextareaAutosize from 'react-textarea-autosize'
import { getFormattedDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'
import { DottedBackground } from '../../../../styled/DottedBackground'

import { GroupMessageType, MessageUIType } from '../../../../types/Message'
import generateItems from '../../helpers/generateGroupedByDays'
import Message from './components/Message'
import { getIpfsData, postIpfsData } from '../../../../services/ipfs'

const CommunityGroupChat = ({
   account,
   community,
   chatData,
   isFetchingCommunityDataFirstTime,
}: {
   account: string | undefined
   community: string
   chatData: GroupMessageType[]
   isFetchingCommunityDataFirstTime: boolean
}) => {
   const [firstLoad, setFirstLoad] = useState(true)
   const [msgInput, setMsgInput] = useState<string>('')
   const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false)
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])

   const scrollToBottomRef = useRef<HTMLDivElement>(null)

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
               type: chatData[i].type,
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               timestamp: chatData[i].timestamp,
               position: 'right',
               isFetching: false,
            })
         } else {
            toAddToUI.push({
               sender_name: chatData[i].sender_name,
               type: chatData[i].type,
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               timestamp: chatData[i].timestamp,
               position: 'left',
               isFetching: false,
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
         type: 'message',
         message: msgInputCopy,
         nftaddr: community,
         fromaddr: account.toLocaleLowerCase(),
         timestamp,
      }

      addMessageToUI(
         'message',
         msgInputCopy,
         account,
         timestamp.toString(),
         'right',
         false
      )

      const cid = await postIpfsData(msgInputCopy)
      data.message = cid

      setIsSendingMessage(true)

      fetch(`${process.env.REACT_APP_REST_API_IPFS}/community`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[POST][Community][Message]:', data, latestLoadedMsgs)
         })
         .catch((error) => {
            console.error(
               '🚨[POST][Community][Message]:',
               error,
               JSON.stringify(data)
            )
         })
         .finally(() => {
            setIsSendingMessage(false)
         })
   }

   const addMessageToUI = (
      type: string,
      message: string,
      fromaddr: string,
      timestamp: string,
      position: string,
      isFetching: boolean
   ) => {
      console.log(`Add message to UI: ${message}`)

      const newMsg: MessageUIType = {
         type,
         message,
         fromAddr: fromaddr,
         timestamp,
         position,
         isFetching,
      }
      let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
      newLoadedMsgs.push(newMsg)
      setLoadedMsgs(newLoadedMsgs)
   }

   return (
      <Flex flexDirection="column" height="100%">
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
                     {isFetchingCommunityDataFirstTime ? (
                        <Spinner />
                     ) : (
                        'Be the first to post something here 😉'
                     )}
                  </Box>
               </Flex>
            )}
            {loadedMsgs.map((msg, i) => {
               if (msg.type && msg.type === 'day') {
                  return (
                     <Box position="relative" my={6} key={msg.timestamp}>
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
               } else if (msg.type && msg.type === 'welcome') {
                  return (
                     <Box textAlign="center">
                        <Text fontSize="sm" color="darkgray.200">
                           A warm welcome to{' '}
                           <RLink to={`/chat/${msg.fromAddr}`}>
                              {msg.sender_name
                                 ? msg.sender_name
                                 : truncateAddress(msg.fromAddr)}
                           </RLink>
                        </Text>
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

export default CommunityGroupChat
