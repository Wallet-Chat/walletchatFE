import { Box, Heading, Flex, Button } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import InboxSearchInput from './components/InboxSearchInput'
import InboxList from '../../components/Inbox/InboxList'
import ExtensionCloseButton from '@/components/ExtensionCloseButton'
// import InboxListLoadingSkeleton from '../../components/Inbox/InboxListLoadingSkeleton'

// TODO -- on submit new message, also update here
const Inbox = () => {
  const isSmallLayout = useIsSmallLayout()

  return (
    <Flex
      direction='column'
      background='white'
      height={isSmallLayout ? 'unset' : '100vh'}
      borderRight='1px solid var(--chakra-colors-lightgray-400)'
      width={isSmallLayout ? '100vw' : '360px'}
      maxW='100%'
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

      <InboxList context='dm' />
    </Flex>
  )
}

export default Inbox
