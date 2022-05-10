import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { IconArrowLeft } from '@tabler/icons'
import Blockies from 'react-blockies'
import { truncateAddress } from '../../helpers/truncateString'
import styled from 'styled-components'
// import { useENS } from '../../context/ENSProvider'

const BlockieWrapper = styled.div`
   border-radius: 0.3rem;
   overflow: hidden;
`

const Chat = ({ web3 }: { web3: any }) => {
   let { address: toAddr = '' } = useParams()
   const [ens, setEns] = useState<string>('')
//    const { getENSFromAddress } = useENS()

//    useEffect(() => {
//       const getENS = async () => {
//          const domain = getENSFromAddress(toAddr)
//          setEns(domain)
//       }
//       getENS()
//    }, [toAddr])

   return (
      <Box p={5} background="white" minHeight="100vh">
         <Box mb={4}>
            <Button colorScheme="gray">
               <Flex alignItems="center">
                  <IconArrowLeft size={18} />
                  <Text ml="1">Back to Inbox</Text>
               </Flex>
            </Button>
         </Box>
         {toAddr && (
            <Flex alignItems="center">
               <BlockieWrapper>
                  <Blockies seed={toAddr.toLocaleLowerCase()} scale={4} />
               </BlockieWrapper>
               <Box>
               <Text ml={2} fontWeight="bold" color="darkGray.800">
                  {truncateAddress(toAddr)}
               </Text>
               {ens && (
                  <Text fontWeight="bold" color="darkGray.800">
                     {ens}
                  </Text>
               )}
               </Box>
            </Flex>
         )}
      </Box>
   )
}

export default Chat
