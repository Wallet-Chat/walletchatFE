import {
  Box,
  Heading,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
import equal from 'fast-deep-equal/es6'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import { InboxItemType } from '../../types/InboxItem'
import { chains } from '../../constants'
import { useUnreadCount } from '../../context/UnreadCountProvider'
import ChainFilters from '../../components/ChainFilters'
import MyNFTs from './components/MyNFTs'
import NFTInboxSearchInput from './components/NFTInboxSearchInput'
import InboxList from '../../components/Inbox/InboxList'
import InboxListLoadingSkeleton from '../../components/Inbox/InboxListLoadingSkeleton'
import { POLLING_QUERY_OPTS } from '@/constants'
import { getInboxDmDataForAccount, useGetInboxQuery } from '@/redux/reducers/dm'

const NFTInbox = ({ account, web3 }: { account: string; web3: Web3 }) => {
  const { currentData: fetchedData, isFetching: isFetchingInboxData } =
    useGetInboxQuery(account, POLLING_QUERY_OPTS)
  const storedData = getInboxDmDataForAccount(account)
  const cachedData = fetchedData ? JSON.parse(fetchedData) : storedData
  const inboxData = Object.values(cachedData.nft)

  const [chainFilters, setChainFilters] = useState([''])
  const [tabIndex, setTabIndex] = useState(0)
  const { unreadCount } = useUnreadCount()

  const isSmallLayout = useIsSmallLayout()

  // useEffect(() => {
  //   const filtered = inboxData.filter(
  //     (d) => d.context_type === 'nft' && !(d.chain === 'none')
  //   )
  //   if (filtered.length === 0) {
  //     // Show "My NFTs" if Inbox is blank
  //     setTabIndex(1)
  //   }
  //
  // }, [inboxData])

  // useEffect(() => {
  //   // console.log('chainFilters', chainFilters)
  //   if (chainFilters.length === 0) {
  //     setNfts([])
  //   } else if (
  //     chainFilters.includes('') ||
  //     chainFilters.length === Object.keys(chains).length
  //   ) {
  //     const _new = inboxData.filter((d) => d.context_type === 'nft')
  //     if (!equal(_new, inboxData)) setNfts(_new)
  //   } else if (chainFilters.length > 0) {
  //     const _allowedChainNames = chainFilters.map((c) => chains[c]?.slug)

  //     const _new = inboxData.filter(
  //       (d) =>
  //         d.context_type === 'nft' &&
  //         d?.chain &&
  //         _allowedChainNames.includes(d.chain)
  //     )

  //     setNfts(_new)
  //     if (!equal(_new, inboxData)) setNfts(_new)
  //   } else {
  //     setNfts([])
  //   }
  // }, [chainFilters, inboxData])

  const handleTabsChange = (index: number) => {
    setTabIndex(index)
  }

  if (isFetchingInboxData && inboxData.length === 0) {
    return <InboxListLoadingSkeleton />
  }

  return (
    <Flex
      direction='column'
      background='white'
      height={isSmallLayout ? 'unset' : '100vh'}
      borderRight='1px solid var(--chakra-colors-lightgray-400)'
      width={isSmallLayout ? '100vw' : '360px'}
      maxW='100%'
    >
      <Box
        px={5}
        pt={5}
        pb={3}
        pos='sticky'
        top='0'
        background='white'
        zIndex='sticky'
      >
        <Flex justifyContent='space-between' mb={2}>
          <Heading size='lg'>NFT</Heading>
        </Flex>
        <NFTInboxSearchInput />
      </Box>

      <Box flex='1 1 0px' overflow='scroll'>
        <Tabs isLazy index={tabIndex} onChange={handleTabsChange}>
          <TabList
            overflowX='auto'
            overflowY='visible'
            className='custom-scrollbar'
          >
            <Tab marginBottom='0'>
              Joined{' '}
              {unreadCount?.nft !== 0 && (
                <Badge ml={1} variant='midgray'>
                  {unreadCount.nft}
                </Badge>
              )}
            </Tab>
            <Tab marginBottom='0'>Your NFTs</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <Box px={4} pt={2}>
                <ChainFilters
                  chainFilters={chainFilters}
                  setChainFilters={setChainFilters}
                />
              </Box>
              <InboxList context='nft' web3={web3} account={account} />
            </TabPanel>
            <TabPanel p={0}>
              <MyNFTs account={account} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  )
}

export default NFTInbox
