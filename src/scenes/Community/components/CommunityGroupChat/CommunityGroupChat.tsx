import { Box, Flex } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import styled from 'styled-components'

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
   overflow-y: auto;
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
   const virtuosoRef = useRef(null)

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
      if (virtuosoRef?.current && firstLoad) {
         //@ts-ignore
         virtuosoRef.current.scrollToIndex({
            index: 0,
            align: "end",
            behavior: "auto"
          });

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
         <DottedBackground>
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
            <Virtuoso
            ref={virtuosoRef}
               style={{ height: '100%' }}
               data={loadedMsgs}
               totalCount={loadedMsgs.length}
               itemContent={(index: number, msg: MessageUIType) => (
                  <Message msg={msg} />
               )}
               />
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
