import { Flex } from '@chakra-ui/react'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import StartConversationWithAddress from '../../components/StartConversationWithAddress'

const NewConversation = ({ web3 }: { web3: any }) => {
  const isSmallLayout = useIsSmallLayout()

   return (
      <Flex
         px={5}
         py={10}
         background="white"
         minHeight={isSmallLayout ? 'unset' : '100vh'}
         justifyContent="center"
         alignItems="center"
         width={isSmallLayout ? '100vh' : '360px'}
      >
         <StartConversationWithAddress web3={web3} />
      </Flex>
   )
}

export default NewConversation
