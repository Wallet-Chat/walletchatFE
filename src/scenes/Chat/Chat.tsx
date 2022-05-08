import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import MessageType from '../../types/Message'
import { MessageUIType } from '../../types/MessageUI'
import Message from './components/Message'

const Chat = () => {
   const [selectedWalletAddress, setSelectedWalletAddress] = useState('none')
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
   const [msgInput, setMsgInput] = useState('')

   useEffect(() => {
       updateChatData()
   }, [])

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
            console.log('$$$kl - Post to REST API:', data)
         })
         .catch((error) => {
            console.error('Post to REST API error!!!!!!!!!!!!:', error)
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
            console.log('$$$kl - PUT to REST API:', data)
         })
         .catch((error) => {
            console.error('PUT to REST API error!!!!!!!!!!!!:', error)
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
      fetch(` ${process.env.REACT_APP_REST_API}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
         .then((response) => response.json()) //Then with the data from the response in JSON...
         .then((data: MessageType[]) => {
            console.log('$$$kl - GET to REST API:', data);
            
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
               }
               else if (
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
         }) //Then with the error genereted...
         .catch((error) => {
            console.error('GET to REST API error!!!!!!!!!!!!:', error)
         })
   } //end LitChat copied functions

   return (
      <Box>
         {console.log(loadedMsgs)}
         {loadedMsgs.map((msg: MessageUIType, i) => (
            <Message key={msg.streamID} msg={msg} />
         ))}
      </Box>
   )
}

export default Chat
