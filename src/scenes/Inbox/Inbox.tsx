import {
   Box,
   Heading,
   Flex,
   Button,
   Tabs,
   TabList,
   TabPanels,
   Tab,
   TabPanel,
   Image,
   Badge,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'
import Web3 from 'web3'
import equal from 'fast-deep-equal/es6'

import { InboxItemType } from '../../types/InboxItem'
import TabContent from './components/TabContent'
import InboxSkeleton from './components/InboxSkeleton'
import { chains } from '../../constants'
import { useUnreadCount } from '../../context/UnreadCountProvider'

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
   const [dms, setDms] = useState<InboxItemType[]>()
   const [communities, setCommunities] = useState<InboxItemType[]>()
   const [nfts, setNfts] = useState<InboxItemType[]>()
   const [chainsFilter, setChainsFilter] = useState([''])
   const { unreadCount, totalUnreadCount } = useUnreadCount()

   useEffect(() => {
      const interval = setInterval(() => {
         getInboxData()
      }, 5000) // every 5s

      return () => clearInterval(interval)
   }, [isAuthenticated, account, inboxData])

   useEffect(() => {
      setNfts(inboxData.filter((d) => d.context_type === 'nft'))
      setDms(inboxData.filter((d) => d.context_type === 'dm'))
      setCommunities(inboxData.filter((d) => d.context_type === 'community'))
   }, [inboxData])

   useEffect(() => {
      console.log('chainsFilter', chainsFilter)
      if (chainsFilter.length === 0) {
         setNfts([])
      } else if (
         chainsFilter.includes('') ||
         chainsFilter.length === Object.keys(chains).length
      ) {
         const _new = inboxData.filter((d) => d.context_type === 'nft')
         if (!equal(_new, inboxData)) setNfts(_new)
      } else if (chainsFilter.length > 1) {
         const _allowedChains = Object.keys(chains).map((c) => chains[c]?.name)
         const _new = inboxData.filter(
            (d) =>
               d.context_type === 'nft' &&
               d?.chain &&
               _allowedChains.includes(d.chain)
         )
         setNfts(_new)
         if (!equal(_new, inboxData)) setNfts(_new)
      } else {
         setNfts([])
      }
   }, [chainsFilter, inboxData])

   useEffect(() => {
      getInboxData()
   }, [isAuthenticated, account])

   const getInboxData = () => {
      // GET request to get off-chain data for RX user
      if (!process.env.REACT_APP_REST_API_IPFS) {
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
      fetch(` ${process.env.REACT_APP_REST_API_IPFS}/get_inbox/${account}`, {
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
            } else if (equal(inboxData, data) !== true) {
               console.log('✅[GET][Inbox]:', data)

               const _filtered = data.filter(
                  (d) => !(d.context_type === 'nft' && d.chain === 'none')
               )
               setInboxData(_filtered)
               localStorage.setItem('inbox', JSON.stringify(data))
            }
            setIsFetchingInboxData(false)
         })
         .catch((error) => {
            console.error('🚨[GET][Inbox]:', error)
            setIsFetchingInboxData(false)
         })
   }

   const toggleChain = (chain: string) => {
      if (chain === '') {
         if (chainsFilter.length > 1) setChainsFilter([''])
         else if (chainsFilter.length === 1 && chainsFilter !== [''])
            setChainsFilter([''])
      } else {
         const index = chainsFilter.indexOf(chain)
         if (index > -1) {
            // item found
            let newChainsFilter = chainsFilter
            newChainsFilter.splice(index, 1)
            setChainsFilter(newChainsFilter)
         } else {
            if (chainsFilter[0] === '') {
               setChainsFilter([chain])
               // setChainsFilter(Object.keys(chains)
               //    .filter(c => c !== chain))
            } else {
               setChainsFilter([...chainsFilter, chain])
            }
         }
      }
   }

   if (isFetchingInboxData && inboxData.length === 0) {
      return <InboxSkeleton />
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
               <Heading size="lg">Inbox</Heading>
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
            {/* <InboxSearchInput /> */}
         </Box>

         <Tabs isLazy>
            <TabList
               overflowX="auto"
               overflowY="visible"
               className="custom-scrollbar"
            >
               <Tab marginBottom="0">
                  All{' '}
                  {totalUnreadCount !== 0 && (
                     <Badge ml={1} variant="midgray">
                        {totalUnreadCount}
                     </Badge>
                  )}
               </Tab>
               <Tab marginBottom="0">
                  DM{' '}
                  {unreadCount?.dm !== 0 && (
                     <Badge ml={1} variant="midgray">
                        {unreadCount.dm}
                     </Badge>
                  )}
               </Tab>
               <Tab marginBottom="0">
                  NFT{' '}
                  {unreadCount?.nft !== 0 && (
                     <Badge ml={1} variant="midgray">
                        {unreadCount.nft}
                     </Badge>
                  )}
               </Tab>
               <Tab marginBottom="0">
                  Community{' '}
                  {unreadCount?.community !== 0 && (
                     <Badge ml={1} variant="midgray">
                        {unreadCount.community}
                     </Badge>
                  )}
               </Tab>
            </TabList>

            <TabPanels>
               <TabPanel p={0}>
                  <TabContent
                     context="all"
                     data={inboxData}
                     web3={web3}
                     account={account}
                  />
               </TabPanel>
               <TabPanel p={0}>
                  <TabContent
                     context="dms"
                     data={dms}
                     web3={web3}
                     account={account}
                  />
               </TabPanel>
               <TabPanel p={0}>
                  <Box px={5} my={2}>
                     <Button
                        size="sm"
                        height="auto"
                        py={1}
                        px={3}
                        onClick={() => toggleChain('')}
                        variant={chainsFilter[0] === '' ? 'lightgray' : 'white'}
                        opacity={chainsFilter[0] === '' ? '1' : '0.7'}
                        mr={2}
                     >
                        All
                     </Button>
                     {Object.keys(chains).map((chain) => {
                        const _selected =
                           chainsFilter.includes(chain) ||
                           chainsFilter[0] === ''
                        return (
                           <Button
                              key={chain}
                              size="sm"
                              height="auto"
                              py={1}
                              px={3}
                              onClick={() => toggleChain(chain)}
                              variant={_selected ? 'lightgray' : 'white'}
                              opacity={_selected ? '1' : '0.9'}
                              mr={2}
                           >
                              {chains[chain]?.logo && (
                                 <Image
                                    src={`data:image/svg+xml;base64,${chains[chain]?.logo}`}
                                    alt=""
                                    width="15px"
                                    height="15px"
                                    d="inline-block"
                                    verticalAlign="middle"
                                    mr={1}
                                    filter={
                                       _selected ? 'none' : 'grayscale(100%)'
                                    }
                                 />
                              )}
                              {chains[chain]?.name}
                           </Button>
                        )
                     })}
                  </Box>
                  <TabContent
                     context="nfts"
                     data={nfts}
                     web3={web3}
                     account={account}
                  />
               </TabPanel>
               <TabPanel p={0}>
                  <TabContent
                     context="communities"
                     data={communities}
                     web3={web3}
                     account={account}
                  />
               </TabPanel>
            </TabPanels>
         </Tabs>
      </Box>
   )
}

export default Inbox
