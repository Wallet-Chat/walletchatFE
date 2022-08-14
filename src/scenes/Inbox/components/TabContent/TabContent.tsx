import { Box, Text } from '@chakra-ui/react'
import Web3 from 'web3'
import StartConversationWithAddress from '../../../../components/StartConversationWithAddress'
import { InboxItemType } from '../../../../types/InboxItem'
import ConversationItem from '../ConversationItem'
import NFTInboxItem from '../NFTInboxItem'

export default function TabAll({
   data,
   account,
   web3,
}: {
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
            } else if (conversation.context_type === 'nft') {
               return (
                  <NFTInboxItem
                     key={`${conversation.timestamp.toString()}${i}`}
                     data={conversation}
                  />
               )
            }
         })}
         {data?.length === 0 && (
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
