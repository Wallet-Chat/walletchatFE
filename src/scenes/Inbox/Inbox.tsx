import {
   Box,
   Button,
   Heading,
   Flex,
   Stack,
   SkeletonCircle,
   SkeletonText,
} from '@chakra-ui/react'
import styled from 'styled-components'
import MessageType from '../../types/Message'
import ConversationItem from './components/ConversationItem'

const Inbox = ({
   chatData,
   isFetchingChatData,
}: {
   chatData: MessageType[]
   isFetchingChatData: boolean
}) => {
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

   if (isFetchingChatData) {
      return (
         <Box background="white" height="100vh">
            <Box py={8} px={3} height="100vh">
            {[...Array(5)].map((e, i) => 
               <Stack key={i}>
                  <Flex
                     py={6}
                     px={3}
                     bg="white"
                     borderBottom="1px solid var(--chakra-colors-lightgray-300)"
                  >
                     <SkeletonCircle
                        size="10"
                        startColor="lightgray.200"
                        endColor="lightgray.400"
                        flexShrink={0}
                        mr={4}
                     />
                     <SkeletonText
                        noOfLines={2}
                        spacing="4"
                        startColor="lightgray.200"
                        endColor="lightgray.400"
                        width="100%"
                     />
                  </Flex>
               </Stack>
            )}
            </Box>
         </Box>
      )
   }

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
         {chatData.length === 0 && (
            <Box>
               You have no messages.
               <br />
               <Button variant="black">Start a conversation</Button>
            </Box>
         )}
      </Box>
   )
}

export default Inbox
