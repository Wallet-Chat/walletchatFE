import { Box, Heading, Flex, Button } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'
import Web3 from 'web3'
import InboxSearchInput from './components/InboxSearchInput'
import InboxList from '../../components/Inbox/InboxList'
// import InboxListLoadingSkeleton from '../../components/Inbox/InboxListLoadingSkeleton'
import { getInboxDmDataForAccount, useGetInboxQuery } from '@/redux/reducers/dm'

const QUERY_OPTS = {
  pollingInterval: 5000, // 5 sec
  refetchOnMountOrArgChange: true,
}

// TODO -- on submit new message, also update here
const Inbox = ({ account, web3 }: { account: string; web3: Web3 }) => {
  const { currentData: fetchedData } = useGetInboxQuery(account, QUERY_OPTS)
  const storedData = getInboxDmDataForAccount(account)
  const inboxData = fetchedData ? JSON.parse(fetchedData) : storedData
  const dms = Object.values(inboxData.dm)

  // const communities = React.useMemo(() => inboxData.filter((d) => d.context_type === 'community' && !(d.chain === 'none')), [inboxData])

  // const [encryptedChatData, setEncChatData] = useState<InboxItemType[]>(
  //   localStorage[localStorageKey] ? JSON.parse(localStorage[localStorageKey]) : []
  // )
  // const { unreadCount } = useUnreadCount()

  // if (isFetchingInboxData && inboxData.length === 0) {
  //    return <InboxListLoadingSkeleton />
  // }

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
      <Box
        px={5}
        pt={5}
        pb={3}
        pos='sticky'
        top='0'
        background='white'
        zIndex='sticky'
      >
        <Flex justifyContent='space-between' mb={2}>
          <Heading size='lg'>Wallet-to-wallet chat</Heading>
          <Button
            as={Link}
            to='/dm/new'
            size='sm'
            variant='outline'
            _hover={{
              textDecoration: 'none',
              backgroundColor: 'var(--chakra-colors-lightgray-300)',
            }}
          >
            + New
          </Button>
        </Flex>
        <InboxSearchInput />
      </Box>

      <InboxList context='dms' data={dms} web3={web3} account={account} />
    </Box>
  )
}

export default Inbox
