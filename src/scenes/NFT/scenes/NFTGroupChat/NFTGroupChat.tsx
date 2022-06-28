import {
   Box,
   Button,
   Flex,
   FormControl,
   Link as CLink,
   Spinner,
   Text,
} from '@chakra-ui/react'
import { IconCheck, IconCopy, IconExternalLink, IconSend } from '@tabler/icons'
import { useEffect, useState, KeyboardEvent } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import styled from 'styled-components'
import Blockies from 'react-blockies'

import { GroupMessageType, MessageUIType } from '../../../../types/Message'
import Message from './components/Message'
import { truncateAddress } from '../../../../helpers/truncateString'

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

const NFTGroupChat = ({
   account,
   ownerAddr,
   nftContractAddr,
}: {
   account: string | undefined
   ownerAddr: string | undefined
   nftContractAddr: string
}) => {
   const [copiedAddr, setCopiedAddr] = useState<boolean>(false)
   const [msgInput, setMsgInput] = useState<string>('')
   const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false)
   const [chatData, setChatData] = useState<GroupMessageType[]>([])
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])

   let timer: ReturnType<typeof setTimeout>

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

   const copyToClipboard = () => {
      if (nftContractAddr) {
         console.log('Copy to clipboard', nftContractAddr)
         let textField = document.createElement('textarea')
         textField.innerText = nftContractAddr
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

   return (
    <Flex flexDirection="column" height="100%">

         <DottedBackground className="custom-scrollbar">
            {isFetchingMessages && loadedMsgs.length === 0 && (
               <Flex justifyContent="center" alignItems="center" height="100%">
                  <Spinner />
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
