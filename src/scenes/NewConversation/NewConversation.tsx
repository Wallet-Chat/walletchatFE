import { Flex } from '@chakra-ui/react'
import StartConversationWithAddress from '../../components/StartConversationWithAddress'

const NewConversation = ({ web3 }: { web3: any }) => {
   return (
      <Flex
         px={5}
         py={10}
         background="white"
         minHeight="100vh"
         justifyContent="center"
         alignItems="center"
      >
         <StartConversationWithAddress web3={web3} />
      </Flex>
   )
}

export default NewConversation
