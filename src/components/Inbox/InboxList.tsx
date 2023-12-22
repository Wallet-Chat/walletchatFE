import { Box, Text } from '@chakra-ui/react'
import { memo } from 'react'
import NFTInboxItem from './NFT/NFTInboxListItem'
import { InboxItemType } from '../../types/InboxItem'
import CommunityInboxItem from './Community/CommunityInboxListItem'
import StartConversationWithAddress from '../StartConversationWithAddress'
import DMInboxItem from './DM/DMInboxListItem'
import { POLLING_QUERY_OPTS, CHAT_CONTEXT_TYPES } from '@/constants'
import { getInboxDmDataForAccount, useGetInboxQuery } from '@/redux/reducers/dm'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'

const InboxList = ({
  context,
}: {
  context: (typeof CHAT_CONTEXT_TYPES)[number]
}) => {
  const account = useAppSelector((state) => selectAccount(state))
  const storedData = getInboxDmDataForAccount(account)
  const { currentData: fetchedData } = useGetInboxQuery(
    account,
    POLLING_QUERY_OPTS
  )
  const inboxData: { [type: string]: InboxItemType } = fetchedData
    ? JSON.parse(fetchedData)
    : storedData
  const inboxList = Object.values(inboxData[context])

  // TODO: use unread counts from unread count provider instead
  return (
    <Box className='custom-scrollbar' ml={[0, 0, 5, 0]} flex='1 1 0px' overflowY='scroll'>
      {inboxList?.map((conversation, i) => {
        if (conversation.context_type === 'nft') {
          return (
            <NFTInboxItem
              key={`${conversation.timestamp.toString()}${i}`}
              data={conversation}
              account={account}
            />
          )
        }
        if (conversation.context_type === 'community') {
          return (
            <CommunityInboxItem
              key={`${conversation.timestamp.toString()}${i}`}
              data={conversation}
              account={account}
            />
          )
        }
        if (
          conversation.context_type === 'dm' ||
          conversation.context_type === 'community'
        ) {
          return (
            <DMInboxItem
              key={`${conversation.timestamp.toString()}${i}`}
              data={conversation}
              account={account}
            />
          )
        }
        return <Box></Box>
      })}
      {inboxList?.length === 0 && context === 'dm' && (
        <Box p={5}>
          <Text mb={4} fontSize='md'>
            You have no messages.
          </Text>
          <StartConversationWithAddress />
        </Box>
      )}
      {inboxList?.length === 0 && !(context === 'dm') && (
        <Box p={5} textAlign='center' d='block'>
          <Text mb={4} fontSize='md' color='darkgray.100'>
            You have not joined any group
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default memo(InboxList)
