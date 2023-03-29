import { Box, Heading, Flex } from '@chakra-ui/react'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import Web3 from 'web3'
import InboxList from '../../components/Inbox/InboxList'

const Inbox = ({ account, web3 }: { account: string; web3: Web3 }) => {
  const isSmallLayout = useIsSmallLayout()

  return (
    <Flex
      direction='column'
      background='white'
      height={isSmallLayout ? 'unset' : '100vh'}
      borderRight='1px solid var(--chakra-colors-lightgray-400)'
      width={isSmallLayout ? '100vw' : '360px'}
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
    </Flex>
  )
}

export default Inbox
