import { Box, Heading } from '@chakra-ui/react'
import Web3 from 'web3'

const Inbox = ({ web3 }: { web3: Web3 }) => {

   return (
      <Box p={5} background="white" minHeight="100vh">
         <Heading size="xl">Inbox</Heading>
         
      </Box>
   )
}

export default Inbox
