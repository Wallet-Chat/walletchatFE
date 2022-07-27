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
// import EthCrypto, { Encrypted } from 'eth-crypto'

import StartConversationWithAddress from '../../components/StartConversationWithAddress'
// import { getIpfsData } from '../../services/ipfs'
import { MessageType, MessageUIType } from '../../types/Message'
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
   const [inboxData, setInboxData] = useState<MessageType[]>(
      localStorageInbox
         ? JSON.parse(localStorageInbox)
         : new Array<MessageType>()
   )
   const [isFetchingInboxData, setIsFetchingInboxData] =
      useState<boolean>(false)
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
   const [beenHereFor3Secs, setBeenHereFor3Secs] = useState(false)

   useEffect(() => {
      const interval = setInterval(() => {
         getInboxData()
      }, 5000) // every 5s

      setTimeout(() => setBeenHereFor3Secs(true), 3000)

      return () => clearInterval(interval)
   }, [])

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
         .then((data: MessageType[]) => {
            console.log('✅ GET [Inbox]:', data)
            if (data === null) {
               setInboxData([])
               localStorage.setItem('inbox', JSON.stringify([]))
            } else {
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

   useEffect(() => {
      const populateUI = async () => {
         const toAddToUI = [] as MessageUIType[]
         for (let i = 0; i < inboxData.length; i++) {
            if (
               inboxData[i]?.context_type === 'nft' ||
               inboxData[i]?.context_type === 'community' ||
               (account &&
                  inboxData[i]?.toaddr &&
                  inboxData[i]?.toaddr.toLowerCase() === account.toLowerCase())
            ) {
               toAddToUI.push({
                  ...inboxData[i],
                  message: inboxData[i].message, //await getIpfsData(inboxData[i].message),
                  fromAddr: inboxData[i].fromaddr,
                  toAddr: inboxData[i].toaddr,
                  position: 'left',
                  isFetching: false,
                  nftAddr: inboxData[i].nftaddr,
                  nftId: inboxData[i].nftid,
               })
            } else if (
               account &&
               inboxData[i]?.toaddr &&
               inboxData[i]?.fromaddr.toLowerCase() === account.toLowerCase()
            ) {
               toAddToUI.push({
                  ...inboxData[i],
                  message: inboxData[i].message, //await getIpfsData(inboxData[i].message),
                  fromAddr: inboxData[i].fromaddr,
                  toAddr: inboxData[i].toaddr,
                  position: 'right',
                  isFetching: false,
                  nftAddr: inboxData[i].nftaddr,
                  nftId: inboxData[i].nftid,
               })
            }
         }
         toAddToUI.sort((a, b) => (a.timestamp as any) - (b.timestamp as any))
         setLoadedMsgs(toAddToUI)
      }
      populateUI()
   }, [inboxData, account])

   if (isFetchingInboxData && inboxData.length === 0) {
      return (
         <Box background="white" height="100vh">
            <Box py={8} px={3} height="100vh">
               {[...Array(5)].map((e, i) => (
                  <Stack key={i}>
                     <Flex
                        py={6}
                        px={3}
                        bg="white"
                        borderBottom="1px solid var(--chakra-colors-red-300)"
                     >
                        <SkeletonCircle
                           size="10"
                           startColor="yellow.200"
                           endColor="yellow.400"
                           flexShrink={0}
                           mr={4}
                        />
                        <SkeletonText
                           noOfLines={2}
                           spacing="4"
                           startColor="yellow.200"
                           endColor="yellow.400"
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
         borderRight="1px solid var(--chakra-colors-red-400)"
         minWidth="300px"
         width={isMobile ? '100%' : 'auto'}
         overflowY="auto"
         className="custom-scrollbar"
      >
         <Flex p={5} justifyContent="space-between">
            <Heading size="xl">
               Inbox {isFetchingInboxData && <Spinner />}
            </Heading>
            <Button
               as={Link}
               to="/new"
               size="sm"
               variant="outline"
               _hover={{
                  textDecoration: 'none',
                  backgroundColor: 'var(--chakra-colors-red-300)',
               }}
            >
               + New
            </Button>
         </Flex>
         <Divider />

         <Box overflowY="auto">
            {loadedMsgs.map((conversation, i) => {
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
            {loadedMsgs.length === 0 && (
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
