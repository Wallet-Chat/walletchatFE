import { Box, Heading, Flex, Button } from '@chakra-ui/react'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
//import CreateNewCommunity from './scenes/CreateNewCommunity'
import InboxList from '../../components/Inbox/InboxList'
import { Link } from 'react-router-dom'

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
      <Box px={5} pt={5} pb={3} pos='sticky' top='0' background='white'>
		{!isSmallLayout && (
			<Flex
				background='lightgray.200'
				flex='1'
				alignItems='center'
				justifyContent='center'
			></Flex>
		)}
        <Flex justifyContent='space-between' mb={2}>
          <Heading size='lg'>Communities</Heading>
               <Button
                  as={Link}
                  to="/community/new"
                  size="sm"
                  variant="outline"
                  _hover={{
                     textDecoration: 'none',
                     backgroundColor: 'var(--chakra-colors-lightgray-300)',
                  }}
               >
                  + New
               </Button>
        </Flex>
        {/* <InboxSearchInput /> */}
      </Box>

      <InboxList context='community' />
    </Flex>
  )
}

export default Inbox
