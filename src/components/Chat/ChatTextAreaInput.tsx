import { Button, Flex, FormControl } from '@chakra-ui/react'
import { IconSend } from '@tabler/icons'
import React, { KeyboardEvent, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

const ChatTextAreaInput = ({
   isSendingMessage,
   sendMessage,
}: {
   isSendingMessage: boolean
   sendMessage: (msg: string) => void
}) => {
   const [msgInput, setMsgInput] = useState<string>('')

   const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         handleSendMessage()
      }
   }

   const handleSendMessage = () => {
      sendMessage && sendMessage(msgInput)
      setMsgInput('')
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
               onClick={() => handleSendMessage()}
               isLoading={isSendingMessage}
            >
               <IconSend size="20" />
            </Button>
         </Flex>
      </Flex>
   )
}

export default React.memo(ChatTextAreaInput)
