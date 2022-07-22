import { Button, Flex, FormControl } from '@chakra-ui/react'
import { IconSend } from '@tabler/icons'
import { useState, KeyboardEvent } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

const MessageInput = ({
   account,
   community,
   addMessageToUI,
}: {
   account: string | undefined
   community: string
   addMessageToUI: any
}) => {
   const [msgInput, setMsgInput] = useState<string>('')
   const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false)

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

      let data = {
         type: 'message',
         message: msgInputCopy,
         nftaddr: community,
         fromaddr: account.toLocaleLowerCase(),
         timestamp: new Date(),
      }

      addMessageToUI({
         ...data,
         position: 'right',
         isFetching: false,
      })

      setIsSendingMessage(true)

      fetch(`${process.env.REACT_APP_REST_API}/community`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[POST][Community][Message]:', data)
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

   return (
      <Flex>
         <FormControl style={{ flexGrow: 1 }}>
            <ReactTextareaAutosize
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
   )
}

export default MessageInput
