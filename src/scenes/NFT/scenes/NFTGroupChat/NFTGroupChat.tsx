import {
   Box,
   Button,
   Flex,
   FormControl,
} from '@chakra-ui/react'
import { IconSend } from '@tabler/icons'
import { useEffect, useState, KeyboardEvent } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import styled from 'styled-components'

import { GroupMessageType, MessageUIType } from '../../../../types/Message'
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
   ownerAddr,
   nftContractAddr,
}: {
   account: string | undefined
   ownerAddr: string | undefined
   nftContractAddr: string
}) => {
   const [msgInput, setMsgInput] = useState<string>('')
   const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false)
   const [chatData, setChatData] = useState<GroupMessageType[]>([])
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])

   useEffect(() => {
      getChatData()

      const interval = setInterval(() => {
         getChatData()
      }, 5000) // every 5s

      return () => {
         clearInterval(interval)
      }
   }, [account, ownerAddr])

   const getChatData = () => {
      if (!account) {
         console.log('No account connected')
         return
      }

      setIsFetchingMessages(true)

      fetch(
         ` ${process.env.REACT_APP_REST_API}/get_groupchatitems/${nftContractAddr}`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
         .then((response) => response.json())
         .then(async (data: GroupMessageType[]) => {
            console.log('✅[GET][NFT][Group Chat Messages]:', data)
            setChatData(data)
         })
         .catch((error) => {
            console.error('🚨[GET][NFT][Messages]:', error)
         })
         .finally(() => setIsFetchingMessages(false))
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
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               timestamp: chatData[i].timestamp,
               position: 'right',
               isFetching: false,
               nftAddr: chatData[i].nftaddr,
            })
         } else {
            toAddToUI.push({
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               timestamp: chatData[i].timestamp,
               position: 'left',
               isFetching: false,
               nftAddr: chatData[i].nftaddr,
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
         timestamp,
         'right',
         false,
         nftContractAddr
      )

      data.message = msgInputCopy

      fetch(` ${process.env.REACT_APP_REST_API}/create_groupchatitem `, {
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
      fromaddr: string,
      timestamp: Date,
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

         <DottedBackground className="custom-scrollbar">
            {loadedMsgs.length === 0 && (
               <Flex justifyContent="center" alignItems="center" borderRadius="lg" background="white" p={4}>
                  <Box fontSize="md">Be the first to post something here 😉</Box>
               </Flex>
            )}
            {loadedMsgs.map((msg: MessageUIType, i) => {
               if (msg && msg.message) {
                  return (
                     <Message
                        key={`${msg.message}${msg.timestamp}`}
                        msg={msg}
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
               >
                  <IconSend size="20" />
               </Button>
            </Flex>
         </Flex>
      </Flex>
   )
}

export default NFTGroupChat
