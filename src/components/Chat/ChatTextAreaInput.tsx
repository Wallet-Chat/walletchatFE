import { 
   Button, 
   Flex, 
   Icon, 
   InputRightElement, 
   InputGroup, 
   Popover, 
   PopoverTrigger, 
   PopoverContent, 
   Textarea,
   Container
} from '@chakra-ui/react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BsEmojiSmile } from "react-icons/bs"
import { IconSend } from '@tabler/icons'
import React, { KeyboardEvent, useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

const ChatTextAreaInput = ({
   isSendingMessage,
   sendMessage,
}: {
   isSendingMessage: boolean
   sendMessage: (msg: string) => void
}) => {
   const [msgInput, setMsgInput] = useState<string>('')

   useEffect(() => {
      setMsgInput('');
   }, [isSendingMessage === false])

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
    <Flex p='4' alignItems='center' justifyContent='center' gap='4'>
      <Popover placement='top-start' isLazy>
        <PopoverTrigger>
          <Container 
            w={0}
            children={<Icon as={BsEmojiSmile} color="black.500" h={5} w={5} />}
          />
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

      <Textarea 
        placeholder='Write a message...'
        onChange={(e) => setMsgInput(e.target.value)}
        value={msgInput}
        onKeyPress={handleKeyPress}
        backgroundColor='lightgray.400'
        minH='full'
        pt={3.5}
        resize='none'
      />
      
      <Flex alignItems='flex-end'>
        <Button
          variant='black'
          onClick={() => sendMessage(msgInput)}
          borderRadius='full'
          minH='full'
          px='0'
          py='0'
          w='12'
          h='12'
        >
          <IconSend size='22' />
        </Button>
      </Flex>
    </Flex>
   )
}

export default React.memo(ChatTextAreaInput)