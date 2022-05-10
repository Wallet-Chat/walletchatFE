import { Box, FormControl, Heading } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

import MessageType from '../../types/Message'
import { MessageUIType } from '../../types/MessageUI'
import Message from './components/Message'

const Chat = () => {
   const [selectedWalletAddress, setSelectedWalletAddress] = useState('none')
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
   const [msgInput, setMsgInput] = useState<string>('')
   const textareaRef = useRef<HTMLTextAreaElement | null>(null)

   useEffect(() => {
      updateChatData()
   }, [])

   useEffect(() => {
      if (textareaRef && textareaRef.current) {
        textareaRef.current.style.height = "0px";
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = scrollHeight + "px";
      }
    }, [msgInput]);

   const fetchPost = (data: MessageType[]) => {
      fetch(` ${process.env.REACT_APP_REST_API}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json()) //Then with the data from the response in JSON...
         .then((data) => {
            console.log('✅ POST:', data)
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [POST]:', error)
         })
   }

   const fetchPut = (data: MessageType, id: number) => {
      fetch(` ${process.env.REACT_APP_REST_API}/${id}`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅ PUT:', data)
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [PUT]:', error)
         })
   }

   const updateStreamID = (streamID: string) => {
      console.log('Message sending to REST API: ', streamID)
      setSelectedWalletAddress('0xtestdude') //window.ethereum.selectedAddress; //Obj of data to send in future like a dummyDb

      const sendToAddress = '0xextensiontest' //msgerSendTo.value;
      const commonName = 'chromeExt' //msgerMyName.value;
      const data: MessageType = {
         streamID: `${streamID}`,
         fromName: `${commonName}`,
         fromAddr: `${selectedWalletAddress}`,
         toAddr: `${sendToAddress}`,
         read: false,
         id: -1,
      } //POST request with body equal on data in JSON format

      fetchPost([data])
   }

   const addMessage = (
      streamID: string,
      fromName: string,
      fromAddr: string,
      read: boolean,
      restApiMsgId: number,
      position: string
   ) => {
      if (!loadedMsgs[restApiMsgId]) {
         console.log('adding message receiver:', streamID)

         const newMsg: MessageUIType = {
            streamID: `${streamID}`,
            fromName: `${fromName}`,
            fromAddr: `${fromAddr}`,
            toAddr: '',
            read,
            id: restApiMsgId,
            position: `${position}`,
         }
         let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
         newLoadedMsgs[restApiMsgId] = newMsg
         setLoadedMsgs(newLoadedMsgs)
      }
   }

   function updateChatData() {
      //GET request to get off-chain data for RX user
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

            for (let i = 0; i < data.length; i++) {
               //console.log("processing id: ", data[i].id)
               const streamToDecrypt = data[i].streamID

               if (
                  data[i].toAddr.toLowerCase() ===
                  selectedWalletAddress.toLowerCase()
               ) {
                  console.log('add message receiver', data[i].streamID)
                  addMessage(
                     data[i].streamID,
                     data[i].fromName,
                     data[i].fromAddr,
                     data[i].read,
                     data[i].id,
                     'left'
                  )
               } else if (
                  data[i].fromAddr.toLowerCase() ===
                  selectedWalletAddress.toLowerCase()
               ) {
                  console.log('add message sender', data[i].streamID)
                  addMessage(
                     data[i].streamID,
                     data[i].fromName,
                     data[i].fromAddr,
                     data[i].read,
                     data[i].id,
                     'right'
                  )
               }
            }
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [GET]:', error)
         })
   }

   return (
      <Box p={5} background="white" minHeight="100vh">
         {console.log(loadedMsgs)}
         {loadedMsgs.map((msg: MessageUIType, i) => (
            <Message key={msg.streamID} msg={msg} />
         ))}
         <Heading size="xl">Inbox</Heading>
         <FormControl>
            <textarea
               placeholder="Message"
               ref={textareaRef}
               value={msgInput}
               onChange={(e) => setMsgInput(e.target.value)}
               style={{ resize: "none", padding: '.5rem', width: '100%'}}
               rows={1}
            />
         </FormControl>
      </Box>
   )
}

export default Chat
