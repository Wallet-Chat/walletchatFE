import { Box, Text } from '@chakra-ui/react'
import Web3 from 'web3'
import StartConversationWithAddress from '../../../../components/StartConversationWithAddress'
import { InboxItemType } from '../../../../types/InboxItem'
import ConversationItem from '../ConversationItem'

export default function TabAll({
   context,
   data,
   account,
   web3,
}: {
   context: string
   data: InboxItemType[] | undefined
   account: string
   web3: Web3
}) {
   return (
      <Box>
         {data?.map((conversation, i) => {
            if (
               conversation.context_type === 'dm' ||
               conversation.context_type === 'community'
            ) {
               return (
                  <ConversationItem
                     key={`${conversation.timestamp.toString()}${i}`}
                     data={conversation}
                     account={account}
                  />
               )
            } return <Box></Box>
         })}
         {data?.length === 0 && (context === "dms" || context === "all") && (
            <Box p={5}>
               <Text mb={4} fontSize="md">
                  You have no messages.
               </Text>
               <StartConversationWithAddress web3={web3} />
            </Box>
         )}
      </Box>
   )
}
