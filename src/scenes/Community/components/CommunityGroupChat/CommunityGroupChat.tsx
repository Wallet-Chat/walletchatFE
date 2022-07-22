import { Box, Divider, Flex, Tag, Text } from '@chakra-ui/react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Link as RLink } from 'react-router-dom'
import { FixedSizeList as List } from 'react-window'
import styled from 'styled-components'

import { getFormattedDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'
import { GroupMessageType, MessageUIType } from '../../../../types/Message'
import generateItems from '../../helpers/generateGroupedByDays'
import Message from './components/Message'
import MessageInput from './components/MessageInput'

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
   chatData,
}: {
   account: string | undefined
   community: string
   chatData: GroupMessageType[]
}) => {
   const [firstLoad, setFirstLoad] = useState(true)
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])

   const scrollToBottomRef = useRef<HTMLDivElement>(null)

   const listRef = useRef()
   const sizeMap = useRef({})
   const setSize = useCallback((index, size) => {
      sizeMap.current = { ...sizeMap.current, [index]: size };
      listRef.current.resetAfterIndex(index);
   }, []);
   const getSize = index => sizeMap.current[index] || 50;
  

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

   const addMessageToUI = ({
      type,
      message,
      fromaddr,
      position,
      timestamp,
      isFetching,
   }: {
      type: string
      message: string
      fromaddr: string
      position: string
      timestamp: string
      isFetching: boolean
   }) => {
      const newMsg: MessageUIType = {
         type,
         message,
         fromAddr: fromaddr,
         position,
         timestamp,
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
                     Be the first to post something here 😉
                  </Box>
               </Flex>
            )}
            <List ref={listRef} height="500px" width="100%" itemCount={loadedMsgs.length} itemSize={getSize} itemData={loadedMsgs}>
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
            </List>
            <Box
               float="left"
               style={{ clear: 'both' }}
               ref={scrollToBottomRef}
            ></Box>
         </DottedBackground>

         <MessageInput
            account={account}
            community={community}
            addMessageToUI={addMessageToUI}
         />
      </Flex>
   )
}

export default NFTGroupChat
