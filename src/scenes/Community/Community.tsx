import { Box, Heading, Flex } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import Web3 from 'web3'
import InboxList from '../../components/Inbox/InboxList'
import InboxListLoadingSkeleton from '../../components/Inbox/InboxListLoadingSkeleton'
import { POLLING_QUERY_OPTS } from '@/constants'
// import InboxSearchInput from './components/InboxSearchInput'
import { getInboxDmDataForAccount, useGetInboxQuery } from '@/redux/reducers/dm'

const Inbox = ({ account, web3 }: { account: string; web3: Web3 }) => {
  const { currentData: fetchedData, isFetching: isFetchingInboxData } =
    useGetInboxQuery(account, POLLING_QUERY_OPTS)
  const storedData = getInboxDmDataForAccount(account)
  const inboxData = fetchedData ? JSON.parse(fetchedData) : storedData
  const communities = Object.values(inboxData.community)

  if (isFetchingInboxData && inboxData.length === 0) {
    return <InboxListLoadingSkeleton />
  }

  return (
    <Box
      background='white'
      height={isMobile ? 'unset' : '100vh'}
      borderRight='1px solid var(--chakra-colors-lightgray-400)'
      width='360px'
      maxW='100%'
      overflowY='scroll'
      className='custom-scrollbar'
    >
      <Box px={5} pt={5} pb={3} pos='sticky' top='0' background='white'>
        <Flex justifyContent='space-between' mb={2}>
          <Heading size='lg'>Communities</Heading>
        </Flex>
        {/* <InboxSearchInput /> */}
      </Box>

      <InboxList context='community' web3={web3} account={account} />
    </Box>
  )
}

export default Inbox
