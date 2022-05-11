import { Box, Heading } from '@chakra-ui/react'
import styled from 'styled-components'
import MessageType from '../../types/Message'
import ConversationItem from './components/ConversationItem'

const Inbox = ({ chatData }: { chatData: MessageType[] }) => {
   const Divider = styled.div`
      display: block;
      width: 100%;
      height: 1px;
      margin-bottom: var(--chakra-space-4);
      &::before {
         content: '';
         display: block;
         margin-left: var(--chakra-space-5);
         width: 40px;
         height: 1px;
         border-bottom: 1px solid #cbcbcb;
      }
   `

   return (
      <Box background="white" minHeight="100vh">
         <Box p={5}>
            <Heading size="xl" mt={2}>
               Inbox
            </Heading>
         </Box>
         <Divider />

         {chatData.map((conversation, i) => (
            <ConversationItem key={conversation.id} data={conversation} />
         ))}
      </Box>
   )
}

export default Inbox
