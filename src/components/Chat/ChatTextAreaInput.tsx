import { 
   Button, 
   Flex, 
   Icon, 
   InputRightElement, 
   InputGroup, 
   Popover, 
   PopoverTrigger, 
   PopoverContent, 
   Textarea
} from '@chakra-ui/react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BsEmojiSmile } from "react-icons/bs"
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

   const addEmoji = (e: any) => {
      const sym = e.unified.split("_");
      const codeArray: any[] = [];
      sym.forEach((el: string) => codeArray.push("0x" + el));
      let emoji = String.fromCodePoint(...codeArray)
      setMsgInput(msgInput + emoji);
    }

   return (
      <Flex>
        <InputGroup resize="none" w="100%" fontSize="md" background="lightgray.400" borderRadius="xl">
          <Textarea
            placeholder="Write a message..."
            onChange={(e) => setMsgInput(e.target.value)}
            value={msgInput}
            onKeyPress={handleKeyPress}
            minH="full"
            resize="none"
          />
          <Popover placement="top-start" isLazy>
            <PopoverTrigger>
              <InputRightElement top="10px" right="10px">
                <Icon as={BsEmojiSmile} color="black" h={5} w={5} />
              </InputRightElement>
            </PopoverTrigger>
            <PopoverContent w="283px">
              <Picker
                data={data}
                emojiSize={20}
                emojiButtonSize={28}
                onEmojiSelect={addEmoji}
                maxFrequentRows={4}
              />
            </PopoverContent>
          </Popover>
        </InputGroup>
        <Flex alignItems="flex-end">
          <Button variant="black" height="100%" onClick={sendMessage} isLoading={isSendingMessage}>
            <IconSend size="20" />
          </Button>
        </Flex>
      </Flex>
   )
}

export default React.memo(ChatTextAreaInput)
