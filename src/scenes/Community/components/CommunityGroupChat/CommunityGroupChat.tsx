import {
   Box,
   Button,
   Divider,
   Flex,
   FormControl,
   Link,
   Spinner,
   Tag,
   Text,
} from '@chakra-ui/react'
import { IconSend } from '@tabler/icons'
import { useEffect, useState, KeyboardEvent, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import styled from 'styled-components'
import { getFormattedDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'

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
   community,
   chatData
}: {
   account: string | undefined
   community: string
   chatData: GroupMessageType[]
}) => {

   const [firstLoad, setFirstLoad] = useState(true)
   const [msgInput, setMsgInput] = useState<string>('')
   const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false)
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
               type: chatData[i].type,
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               timestamp: chatData[i].timestamp,
               position: 'right',
               isFetching: false,
            })
         } else {
            toAddToUI.push({
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
         fromaddr: account.toLocaleLowerCase(),
         timestamp,
      }

      addMessageToUI(
         "message",
         msgInputCopy,
         account,
         timestamp.toString(),
         'right',
         false
      )

      data.message = msgInputCopy

      console.log(data, `${process.env.REACT_APP_REST_API}/community/${community}`)

      fetch(`${process.env.REACT_APP_REST_API}/community/${community}`, {
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
   }

   const addMessageToUI = (
      type: string,
      message: string,
      fromaddr: string,
      timestamp: string,
      position: string,
      isFetching: boolean,
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
                  {isFetchingMessages ? <Spinner /> : <Box fontSize="md">
                     Be the first to post something here 😉
                  </Box>}
               </Flex>
            )}
            {loadedMsgs.map((msg, i) => {
               if (msg.type && msg.type === 'day') {
                  return (
                     <Box position="relative" my={6} key={msg.timestamp}>
                        <Tag color="darkgray.300" mb={1} position="absolute" right="var(--chakra-space-4)" top="50%" transform="translateY(-50%)">{getFormattedDate(msg.timestamp.toString())}</Tag>
                        <Divider />
                     </Box>
                  )
                } else if (msg.type && msg.type === 'welcome') {
                  return (
                     <Box textAlign="center">
                        <Text fontSize="sm" color="darkgray.200">A warm welcome to <Link href={`https://etherscan.io/address/${msg.fromAddr}`} target="_blank">{truncateAddress(msg.fromAddr)}</Link></Text>
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
            <Box float="left" style={{ clear: 'both' }} ref={scrollToBottomRef}></Box>
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
               >
                  <IconSend size="20" />
               </Button>
            </Flex>
         </Flex>
      </Flex>
   )
}

export default NFTGroupChat
