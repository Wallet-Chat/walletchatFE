import {
   Box,
   FormControl,
   Button,
   Flex,
   Text,
   Link as CLink,
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
   background: linear-gradient(90deg, var(--chakra-colors-lightGray-200) 14px, transparent 1%) center,
      linear-gradient(var(--chakra-colors-lightGray-200) 14px, transparent 1%) center, #9dadc3 !important;
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

const Chat = ({ account, web3 }: { account: string; web3: Web3 }) => {
   let { address: toAddr = '' } = useParams()
   const [ens, setEns] = useState<string>('')
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([]
      // [...testloadingmsgs]
   )
   const [msgInput, setMsgInput] = useState<string>('')
   const [copiedAddr, setCopiedAddr] = useState<boolean>(false)

   useEffect(() => {
      getChatData()
   }, [])

   useEffect(() => {
      const getENS = async () => {
         const ensValue = await reverseENSLookup(toAddr, web3)
         if (ensValue) {
            setEns(ensValue)
         }
      }
      getENS()
   }, [toAddr])

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

      const tempId = loadedMsgs.length

      addMessageToUI(
         msgInput,
         account,
         account,
         toAddr,
         timestamp,
         false,
         tempId,
         'right',
         true
      )

      setMsgInput('') // clear message upon sending it

      fetch(` ${process.env.REACT_APP_REST_API}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json()) //Then with the data from the response in JSON...
         .then((data) => {
            console.log('✅ POST/Send Message:', data)
            if (data.id) {
               let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
               newLoadedMsgs[data.id]["isFetching"] = false
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
      fromName: string,
      fromAddr: string,
      toAddr: string,
      timestamp: Date,
      read: boolean,
      id: number,
      position: string,
      isFetching: boolean
   ) => {
         console.log(`Add message of id ${id} to UI: ${streamID}`)

         const newMsg: MessageUIType = {
            streamID,
            fromName,
            fromAddr,
            toAddr,
            timestamp,
            read,
            id,
            position,
            isFetching,
         }
         let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
         newLoadedMsgs[id] = newMsg
         setLoadedMsgs(newLoadedMsgs)
      }

   function getChatData() {
      // GET request to get off-chain data for RX user
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      fetch(` ${process.env.REACT_APP_REST_API}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
         .then((response) => response.json())
         .then((data: MessageType[]) => {
            console.log('✅ GET:', data)

            const toAddToUI = []

            for (let i = 0; i < data.length; i++) {
               //console.log("processing id: ", data[i].id)
               const streamToDecrypt = data[i].streamID

               if (data[i].toAddr.toLowerCase() === account.toLowerCase()) {
                  toAddToUI.push({
                     streamID: data[i].streamID,
                     fromName: data[i].fromName,
                     fromAddr: data[i].fromAddr,
                     toAddr: data[i].toAddr,
                     timestamp: data[i].timestamp,
                     read: data[i].read,
                     id: data[i].id - 1,
                     position: 'left',
                     isFetching: false
                  })
               } else if (
                  data[i].fromAddr.toLowerCase() === account.toLowerCase()
               ) {
                  toAddToUI.push({
                     streamID: data[i].streamID,
                     fromName: data[i].fromName,
                     fromAddr: data[i].fromAddr,
                     toAddr: data[i].toAddr,
                     timestamp: data[i].timestamp,
                     read: data[i].read,
                     id: data[i].id - 1,
                     position: 'right',
                     isFetching: false
                  })
               }
            }
            setLoadedMsgs(toAddToUI)
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [GET]:', error)
         })
   }

   console.log(loadedMsgs)

   return (
      <Flex background="white" height="100vh" flexDirection="column">
         <Box
            p={5}
            pb={3}
            borderBottom="1px solid var(--chakra-colors-lightGray-400)"
         >
            <Box mb={4}>
               <Link to="/chat" style={{ textDecoration: 'none' }}>
                  <Button
                     colorScheme="gray"
                     background="lightGray.300"
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
                     <Text ml={2} fontWeight="bold" color="darkGray.800">
                        {truncateAddress(toAddr)}
                     </Text>
                     {ens && (
                        <Text fontWeight="bold" color="darkGray.800">
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
                              color="var(--chakra-colors-darkGray-800)"
                              stroke="1.5"
                           />
                        ) : (
                           <IconCopy
                              size={20}
                              color="var(--chakra-colors-darkGray-500)"
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
                        color="var(--chakra-colors-darkGray-500)"
                        stroke="1.5"
                     />
                  </Button>
               </Flex>
            )}
         </Box>

         <DottedBackground>
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
                     background: 'var(--chakra-colors-lightGray-400)',
                     borderRadius: '0.3rem',
                     marginBottom: '-6px'
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
