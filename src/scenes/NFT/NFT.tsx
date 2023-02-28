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
import { isMobile } from 'react-device-detect'
import Web3 from 'web3'
import equal from 'fast-deep-equal/es6'
import * as ENV from '@/constants/env'
import { InboxItemType } from '../../types/InboxItem'
import { chains } from '../../constants'
import { useUnreadCount } from '../../context/UnreadCountProvider'
import ChainFilters from '../../components/ChainFilters'
import MyNFTs from './components/MyNFTs'
import NFTInboxSearchInput from './components/NFTInboxSearchInput'
import InboxList from '../../components/Inbox/InboxList'
import InboxListLoadingSkeleton from '../../components/Inbox/InboxListLoadingSkeleton'
import lit from '../../utils/lit'

const NFTInbox = ({
  account,
  web3,
  isAuthenticated,
}: {
  account: string
  web3: Web3
  isAuthenticated: boolean
}) => {
  const localStorageInbox = localStorage['inbox_' + account]
    ? JSON.parse(localStorage['inbox_' + account])
    : []
  const [inboxData, setInboxData] = useState<InboxItemType[]>(localStorageInbox)
  const [isFetchingInboxData, setIsFetchingInboxData] = useState(false)
  const [nfts, setNfts] = useState<InboxItemType[]>()
  const [chainFilters, setChainFilters] = useState([''])
  const [tabIndex, setTabIndex] = useState(0)
  const { unreadCount } = useUnreadCount()

  let semaphore = false
  useEffect(() => {
    const interval = setInterval(() => {
      getInboxData()
    }, 5000) // every 5s

    return () => clearInterval(interval)
  }, [isAuthenticated, account, inboxData])

  useEffect(() => {
    const filtered = inboxData.filter(
      (d) => d.context_type === 'nft' && !(d.chain === 'none')
    )
    if (filtered.length === 0) {
      // Show "My NFTs" if Inbox is blank
      setTabIndex(1)
    }
    setNfts(
      inboxData.filter((d) => d.context_type === 'nft' && !(d.chain === 'none'))
    )
  }, [inboxData])

  useEffect(() => {
    // console.log('chainFilters', chainFilters)
    if (chainFilters.length === 0) {
      setNfts([])
    } else if (
      chainFilters.includes('') ||
      chainFilters.length === Object.keys(chains).length
    ) {
      const _new = inboxData.filter((d) => d.context_type === 'nft')
      if (!equal(_new, inboxData)) setNfts(_new)
    } else if (chainFilters.length > 0) {
      const _allowedChainNames = chainFilters.map((c) => chains[c]?.slug)

      const _new = inboxData.filter(
        (d) =>
          d.context_type === 'nft' &&
          d?.chain &&
          _allowedChainNames.includes(d.chain)
      )

      setNfts(_new)
      if (!equal(_new, inboxData)) setNfts(_new)
    } else {
      setNfts([])
    }
  }, [chainFilters, inboxData])

  useEffect(() => {
    getInboxData()
  }, [isAuthenticated, account])

  const getInboxData = () => {
    // GET request to get off-chain data for RX user
    if (!ENV.REACT_APP_REST_API) {
      console.log('REST API url not in .env', ENV)
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
    if (semaphore) {
      //console.log('Don't perform re-entrant call')
      return
    }
    setIsFetchingInboxData(true)
    semaphore = true
    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_inbox/${account}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      }
    )
      .then((response) => response.json())
      .then(async (data: InboxItemType[]) => {
        if (data === null) {
          setInboxData([])
          localStorage['inbox_' + account] = JSON.stringify([])
        } else if (
          !localStorage['inboxEnc_' + account] ||
          equal(JSON.parse(localStorage['inboxEnc_' + account]), data) !== true
        ) {
          console.log('✅[GET][Inbox]:', data)
          //setEncChatData(data)
          localStorage['inboxEnc_' + account] = JSON.stringify(data)

          const replica = JSON.parse(JSON.stringify(data))
          // Get data from LIT and replace the message with the decrypted text
          for (let i = 0; i < replica.length; i++) {
            if (replica[i].encrypted_sym_lit_key) {
              //only needed for mixed DB with plain and encrypted data
              const _accessControlConditions = JSON.parse(
                replica[i].lit_access_conditions
              )

              console.log(
                '✅[POST][Decrypt GetInbox Message]:',
                replica[i],
                replica[i].encrypted_sym_lit_key,
                _accessControlConditions
              )
              const blob = lit.b64toBlob(replica[i].message)
              //after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
              //this is done to support legacy messages (new databases wouldn't need this)
              if (
                String(replica[i].lit_access_conditions).includes('evmBasic')
              ) {
                const rawmsg = await lit.decryptString(
                  blob,
                  replica[i].encrypted_sym_lit_key,
                  _accessControlConditions
                )
                replica[i].message = rawmsg.decryptedFile.toString()
              } else {
                const rawmsg = await lit.decryptStringOrig(
                  blob,
                  replica[i].encrypted_sym_lit_key,
                  _accessControlConditions
                )
                replica[i].message = rawmsg.decryptedFile.toString()
              }
            }
          }
          setInboxData(replica)
          //setInboxData(data)
          localStorage['inbox_' + account] = JSON.stringify(replica)
        }
        setIsFetchingInboxData(false)
        semaphore = false
      })
      .catch((error) => {
        console.error('🚨[GET][Inbox]:', error)
        setIsFetchingInboxData(false)
        semaphore = false
      })
  }

  const handleTabsChange = (index: number) => {
    setTabIndex(index)
  }

  if (isFetchingInboxData && inboxData.length === 0) {
    return <InboxListLoadingSkeleton />
  }

  return (
    <Box
      background='white'
      height={isMobile ? 'unset' : '100vh'}
      borderRight='1px solid var(--chakra-colors-lightgray-400)'
      width='360px'
      maxW='100%'
      overflowY='scroll'
      className='custom-scrollbar'
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
  )
}

export default NFTInbox
