import { Flex } from '@chakra-ui/react'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import StartConversationWithAddress from '../../components/StartConversationWithAddress'

const NewConversation = () => {
  const isSmallLayout = useIsSmallLayout()

  return (
    <Flex
      px={5}
      py={10}
      background='white'
      minHeight={isSmallLayout ? 'unset' : '100vh'}
      justifyContent='center'
      alignItems='center'
      width={isSmallLayout ? '100vw' : '360px'}
    >
      <StartConversationWithAddress />
    </Flex>
  )
}

export default NewConversation
