import {
   Box,
   Heading,
   Flex,
   Stack,
   SkeletonCircle,
   SkeletonText,
   Text,
   Spinner,
   Button,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Web3 from 'web3'
import equal from 'fast-deep-equal/es6'

import StartConversationWithAddress from '../../components/StartConversationWithAddress'
// import { getIpfsData } from '../../services/ipfs'
import { MessageType } from '../../types/Message'
import { InboxItemType } from '../../types/InboxItem'
// import { EncryptedMsgBlock } from '../../types/Message'
import ConversationItem from './components/ConversationItem'
import NFTInboxItem from './components/NFTInboxItem'

const Divider = styled.div`
   display: block;
   width: 100%;
   height: 1px;
   margin-bottom: var(--chakra-space-4);
   &::before {
      content: '';
      display: block;
      margin-left: var(--chakra-space-5);
      width: 40px;
      height: 1px;
      border-bottom: 1px solid #cbcbcb;
   }
`

const localStorageInbox = localStorage.getItem('inbox')

const Inbox = ({
   account,
   web3,
   isAuthenticated,
}: {
   account: string
   web3: Web3
   isAuthenticated: boolean
}) => {
   const [inboxData, setInboxData] = useState<InboxItemType[]>(
      localStorageInbox
         ? JSON.parse(localStorageInbox)
         : new Array<InboxItemType>()
   )
   const [isFetchingInboxData, setIsFetchingInboxData] =
      useState<boolean>(false)

   useEffect(() => {
      const interval = setInterval(() => {
         getInboxData()
      }, 5000) // every 5s

      return () => clearInterval(interval)
   }, [inboxData])

   useEffect(() => {
      getInboxData()
   }, [isAuthenticated, account])

   const getInboxData = () => {
      // GET request to get off-chain data for RX user
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      if (!account) {
         console.log('No account connected')
         return
      }
      if (!isAuthenticated) {
         console.log('Not authenticated')
         return
      }
      setIsFetchingInboxData(true)
      fetch(` ${process.env.REACT_APP_REST_API}/get_inbox/${account}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
         .then((response) => response.json())
         .then((data: InboxItemType[]) => {
            if (data === null) {
               setInboxData([])
               localStorage.setItem('inbox', JSON.stringify([]))
            } else if (equal(inboxData, data) === false) {
               console.log('✅[GET][Inbox]:', data)
               setInboxData(data)
               localStorage.setItem('inbox', JSON.stringify(data))
            }
            setIsFetchingInboxData(false)
         })
         .catch((error) => {
            console.error('🚨[GET][Inbox]:', error)
            setIsFetchingInboxData(false)
         })
   }

   if (isFetchingInboxData && inboxData.length === 0) {
      return (
         <Box background="white" height="100vh" width="100%">
            <Box py={8} px={3} height="100vh">
               {[...Array(5)].map((e, i) => (
                  <Stack key={i}>
                     <Flex
                        py={6}
                        px={3}
                        bg="white"
                        borderBottom="1px solid var(--chakra-colors-lightgray-300)"
                     >
                        <SkeletonCircle
                           size="10"
                           startColor="lightgray.200"
                           endColor="lightgray.400"
                           flexShrink={0}
                           mr={4}
                        />
                        <SkeletonText
                           noOfLines={2}
                           spacing="4"
                           startColor="lightgray.200"
                           endColor="lightgray.400"
                           width="100%"
                        />
                     </Flex>
                  </Stack>
               ))}
            </Box>
         </Box>
      )
   }

   return (
      <Box
         background="white"
         height={isMobile ? 'unset' : '100vh'}
         borderRight="1px solid var(--chakra-colors-lightgray-400)"
         minWidth="300px"
         width={isMobile ? '100%' : 'auto'}
         overflowY="auto"
         className="custom-scrollbar"
      >
         <Flex p={5} justifyContent="space-between">
            <Heading size="lg">
               Inbox
            </Heading>
            <Button
               as={Link}
               to="/new"
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
         <Divider />

         <Box overflowY="auto">
            {inboxData.map((conversation, i) => {
               if (
                  conversation.context_type === 'dm' ||
                  conversation.context_type === 'community'
               ) {
                  return (
                     <ConversationItem
                        key={`${conversation.timestamp.toString()}${i}`}
                        data={conversation}
                        account={account}
                     />
                  )
               } else if (conversation.context_type === 'nft') {
                  return (
                     <NFTInboxItem
                        key={`${conversation.timestamp.toString()}${i}`}
                        data={conversation}
                     />
                  )
               }
            })}
            {inboxData.length === 0 && (
               <Box p={5}>
                  <Text mb={4} fontSize="md">
                     You have no messages.
                  </Text>
                  <StartConversationWithAddress web3={web3} />
               </Box>
            )}
         </Box>
      </Box>
   )
}

export default Inbox
