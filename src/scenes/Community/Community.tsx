import {
   Box,
   Heading,
   Flex,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Web3 from 'web3'
import equal from 'fast-deep-equal/es6'

import { InboxItemType } from '../../types/InboxItem'
import { useUnreadCount } from '../../context/UnreadCountProvider'
import InboxList from '../../components/Inbox/InboxList'
import InboxListLoadingSkeleton from '../../components/Inbox/InboxListLoadingSkeleton'
import { get } from '../../services/api'
// import InboxSearchInput from './components/InboxSearchInput'

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
      localStorageInbox ? JSON.parse(localStorageInbox) : []
   )
   const [isFetchingInboxData, setIsFetchingInboxData] = useState(false)
   const [communities, setCommunities] = useState<InboxItemType[]>()
   const { unreadCount } = useUnreadCount()

   useEffect(() => {
      const interval = setInterval(() => {
         getInboxData()
      }, 5000) // every 5s

      return () => clearInterval(interval)
   }, [isAuthenticated, account, inboxData])

   useEffect(() => {
      setCommunities(inboxData.filter((d) => d.context_type === 'community'))
   }, [inboxData])

   useEffect(() => {
      getInboxData()
   }, [isAuthenticated, account])

   const getInboxData = () => {
      // GET request to get off-chain data for RX user
      // if (!process.env.REACT_APP_REST_API) {
      //    console.log('REST API url not in .env', process.env)
      //    return
      // }
      if (!account) {
         console.log('No account connected')
         return
      }
      if (!isAuthenticated) {
         console.log('Not authenticated')
         return
      }
      setIsFetchingInboxData(true)
      get(`/get_inbox/${account}`)
         .then((data: InboxItemType[]) => {
            console.log(`/get_inbox/${account}`)
            console.log(data)
            if (data === null) {
               setInboxData([])
               localStorage.setItem('inbox', JSON.stringify([]))
            } else if (equal(inboxData, data) !== true) {
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
      return <InboxListLoadingSkeleton />
   }

   return (
      <Box
         background="white"
         height={isMobile ? 'unset' : '100vh'}
         borderRight="1px solid var(--chakra-colors-lightgray-400)"
         width="360px"
         maxW="100%"
         overflowY="scroll"
         className="custom-scrollbar"
      >
         <Box
            px={5}
            pt={5}
            pb={3}
            pos="sticky"
            top="0"
            background="white"
            zIndex="sticky"
         >
            <Flex justifyContent="space-between" mb={2}>
               <Heading size="lg">Communities</Heading>
            </Flex>
            {/* <InboxSearchInput /> */}
         </Box>

         <InboxList context="communities" data={communities} web3={web3} account={account} />
      </Box>
   )
}

export default Inbox
