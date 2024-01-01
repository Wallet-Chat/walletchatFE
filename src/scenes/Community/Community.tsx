import { Box, Heading, Flex } from '@chakra-ui/react'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import InboxList from '../../components/Inbox/InboxList'

const Inbox = () => {
  const isSmallLayout = useIsSmallLayout()

  return (
    <Flex
      direction='column'
      background='white'
      height={isSmallLayout ? 'unset' : '100vh'}
      borderRight='1px solid var(--chakra-colors-lightgray-400)'
      width={isSmallLayout ? '100vw' : '400px'}
      maxW='100%'
      pl={[0, 0, 50, 0]}
    >
      <Box px={5} pt={5} pb={3} pos='sticky' top='0' background='white'>
        <Flex justifyContent='space-between' mb={2}>
          <Heading size='lg'>Communities</Heading>
        </Flex>
        {/* <InboxSearchInput /> */}
      </Box>

      <InboxList context='community' />
    </Flex>
  )
}

export default Inbox
