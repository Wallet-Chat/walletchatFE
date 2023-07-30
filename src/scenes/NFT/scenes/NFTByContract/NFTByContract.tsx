import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Stat,
  StatHelpText,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import {
  IconBrandMedium,
  IconBrandTwitter,
  IconCircleCheck,
  IconCurrencyEthereum,
  IconLink,
} from '@tabler/icons'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import NFTGroupChat from '../../components/NFTGroupChat'
import NFTTweets from '../../components/NFTTweets'
import NFTStatisticsType from '../../../../types/NFTPort/NFTStatistics'
import { useHover } from '../../../../helpers/useHover'
import IconEtherscan from '../../../../images/icon-products/icon-etherscan-mono.svg'
import IconDiscord from '../../../../images/icon-products/icon-discord.svg'
import IconPolygon from '../../../../images/icon-chains/icon-polygon.svg'
import IconEthereum from '../../../../images/icon-chains/icon-ethereum.svg'
import { nFormatter } from '../../../../helpers/number'
import { convertIpfsUriToUrl } from '../../../../helpers/ipfs'
import OpenSeaNFTCollection, {
  openseaToGeneralNFTCollectionType,
} from '../../../../types/OpenSea/NFTCollection'
import NFTPortNFTCollection, {
  nftPortToGeneralNFTCollectionType,
} from '../../../../types/NFTPort/NFTCollection'
import NFTCollection from '../../../../types/NFTCollection'
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'
import { log } from '@/helpers/log'

const NFTByContract = () => {
  const account = useAppSelector((state) => selectAccount(state))

  const { nftContractAddr = '', chain = '' } = useParams()

  const [nftData, setNftData] = useState<NFTCollection>()
  const [nftStatistics, setNftStatistics] = useState<NFTStatisticsType>()
  // const [ethereumPrice, setEthereumPrice] = useState<number>()
  const [joined, setJoined] = useState<boolean | null>(null)
  const [joinBtnIsHovering, joinBtnHoverProps] = useHover()
  const [isFetchingJoining, setIsFetchingJoining] = useState(false)

  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [tweetCount, setTweetCount] = useState<number>(0)

  useEffect(() => {
    getNftMetadata()
    getNftStatistics()
    getJoinStatus()
  }, [nftContractAddr])

  useEffect(() => {
    const interval = setInterval(() => {
      getNftStatistics()
    }, 60000 * 10) // every 10 mins

    return () => {
      clearInterval(interval)
    }
  }, [nftContractAddr, nftStatistics])

  useEffect(() => {
    getTweetCount()
  }, [account])

  const getJoinStatus = () => {
    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_bookmarks/${account}/${nftContractAddr}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getJwtForAccount(account)}`,
        },
      }
    )
      .then((response) => response.json())
      .then((isBookmarked: boolean) => {
        log('✅ [GET][NFT][Bookmarked?]', isBookmarked)
        setJoined(isBookmarked)
      })
      .catch((error) => {
        console.error('🚨 [POST][NFT][Bookmarked?]:', error)
      })
  }

  const joinGroup = () => {
    if (!isFetchingJoining) {
      setIsFetchingJoining(true)
      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/create_bookmark`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
          body: JSON.stringify({
            walletaddr: account,
            nftaddr: nftContractAddr,
          }),
        }
      )
        .then((response) => response.json())
        .then((response) => {
          log('✅[POST][NFT][Join Group]', response)
          setJoined(true)
        })
        .catch((error) => {
          console.error('🚨[POST][NFT][Join Group]:', error)
        })
        .then(() => {
          setIsFetchingJoining(false)
        })
    }
  }

  const leaveGroup = () => {
    if (!isFetchingJoining) {
      setIsFetchingJoining(true)
      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/delete_bookmark`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
          body: JSON.stringify({
            walletaddr: account,
            nftaddr: nftContractAddr,
          }),
        }
      )
        .then((response) => response.json())
        .then((count: number) => {
          log('✅[POST][NFT][Leave Group]')
          setJoined(false)
        })
        .catch((error) => {
          console.error('🚨[POST][NFT][Leave Group]:', error)
        })
        .then(() => {
          setIsFetchingJoining(false)
        })
    }
  }

  const getTweetCount = () => {
    if (account) {
      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_twitter_cnt/${nftContractAddr}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
        }
      )
        .then((response) => response.json())
        .then((count: number) => {
          if (count !== tweetCount) {
            log('✅[GET][NFT][No. of tweets]:', count)
            setTweetCount(count)
          }
        })
        .catch((error) => {
          console.error('🚨[GET][NFT][No. of tweets]:', error)
        })
    }
  }

  const getNftMetadata = () => {
    if (!nftContractAddr) {
      log('Missing contract address')
      return
    }
    if (chain === 'ethereum') {
      fetch(`${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/opensea_asset_contract/${nftContractAddr}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${getJwtForAccount(account)}`,
        },
      })
        .then((response) => response.json())
        .then((result: OpenSeaNFTCollection) => {
          if (result?.collection?.name) {
            log(`✅[GET][NFT]:`, result)
            setNftData(openseaToGeneralNFTCollectionType(result))
          }
        })
        .catch((error) => log(`🚨[GET][NFT]:`, error))
    } else if (chain === 'polygon') {
      if (ENV.REACT_APP_NFTPORT_API_KEY === undefined) {
        log('Missing NFT Port API Key')
        return
      }
      fetch(
        `https://api.nftport.xyz/v0/nfts/${nftContractAddr}/1?chain=${chain}&page_size=1&include=all`,
        {
          method: 'GET',
          headers: {
            Authorization: ENV.REACT_APP_NFTPORT_API_KEY,
          },
        }
      )
        .then((response) => response.json())
        .then((result: NFTPortNFTCollection) => {
          log('✅[GET][NFT]:', result)
          const _transformed = nftPortToGeneralNFTCollectionType(result)
          setNftData({
            ..._transformed,
            image_url: _transformed?.image_url?.includes('ipfs://')
              ? convertIpfsUriToUrl(_transformed?.image_url)
              : _transformed?.image_url,
          })
        })
        .catch((error) => log(`🚨[GET][NFT]:`, error))
    }
  }

  const getNftStatistics = () => {
    if (ENV.REACT_APP_NFTPORT_API_KEY === undefined) {
      log('Missing NFT Port API Key')
      return
    }
    if (!nftContractAddr) {
      log('Missing contract address')
      return
    }
    fetch(
      `https://api.nftport.xyz/v0/transactions/stats/${nftContractAddr}?chain=${chain}`,
      {
        method: 'GET',
        headers: {
          Authorization: ENV.REACT_APP_NFTPORT_API_KEY,
        },
      }
    )
      .then((response) => response.json())
      .then((result) => {
        log('✅[GET][NFT Statistics]:', result)
        // log(JSON.stringify(result, null, 2))
        if (result && result.statistics) {
          setNftStatistics(result.statistics)
        }
      })
      .catch((error) => log('error', error))
  }

  return (
    <Flex flexDirection='column' background='white' flex='1'>
      <Flex alignItems='center' px={5} pt={4} pb={2}>
        <Flex alignItems='flex-start' p={2} borderRadius='md'>
          {nftData?.image_url && (
            <Image
              src={nftData.image_url}
              alt=''
              height='60px'
              borderRadius='var(--chakra-radii-xl)'
              mr={3}
            />
          )}
          <Box>
            {nftData?.name && (
              <Flex alignItems='center'>
                <Heading
                  size='md'
                  mr='1'
                  maxWidth={[140, 140, 200, 300]}
                  overflow='hidden'
                  textOverflow='ellipsis'
                  whiteSpace='nowrap'
                >
                  {nftData.name}
                </Heading>
                <Tooltip label='OpenSea Verified'>
                  <Box>
                    <IconCircleCheck
                      stroke='2'
                      color='white'
                      fill='var(--chakra-colors-success-600)'
                    />
                  </Box>
                </Tooltip>
                <Button
                  ml={2}
                  size='xs'
                  variant={joined ? 'black' : 'outline'}
                  isLoading={isFetchingJoining}
                  onClick={() => {
                    if (joined === null) return
                    else if (joined === false) {
                      joinGroup()
                    } else if (joined === true) {
                      leaveGroup()
                    }
                  }}
                  // @ts-ignore
                  {...joinBtnHoverProps}
                >
                  <Text ml={1}>
                    {joinBtnIsHovering
                      ? joined
                        ? 'Leave?'
                        : '+ Join'
                      : joined
                      ? 'Joined'
                      : '+ Join'}
                  </Text>
                </Button>
              </Flex>
            )}

            {nftStatistics && (
              <HStack
                d='inline-block'
                px={4}
                pt={2}
                my={1}
                border='1px solid var(--chakra-colors-lightgray-300)'
                borderRadius='md'
              >
                <Stat d='inline-block' verticalAlign='middle'>
                  <StatNumber fontSize='md' color='darkgray.700'>
                    {nFormatter(nftStatistics.num_owners, 1)}
                  </StatNumber>
                  <StatHelpText color='darkgray.200' whiteSpace='nowrap'>
                    Owners
                  </StatHelpText>
                </Stat>
                <Divider
                  orientation='vertical'
                  height='15px'
                  d='inline-block'
                  verticalAlign='middle'
                />
                <Stat d='inline-block' verticalAlign='middle'>
                  <StatNumber
                    fontSize='md'
                    color='darkgray.700'
                    d='flex'
                    alignItems='center'
                  >
                    {nftStatistics.floor_price < 0.01
                      ? '<0.01'
                      : nftStatistics.floor_price.toFixed(2)}
                    <IconCurrencyEthereum size='18' />
                  </StatNumber>
                  <StatHelpText color='darkgray.200' whiteSpace='nowrap'>
                    Floor
                  </StatHelpText>
                </Stat>
                <Divider
                  orientation='vertical'
                  height='15px'
                  d='inline-block'
                  verticalAlign='middle'
                />
                <Stat d='inline-block' verticalAlign='middle'>
                  <StatNumber
                    fontSize='md'
                    color='darkgray.700'
                    d='flex'
                    alignItems='center'
                  >
                    {nFormatter(nftStatistics.total_volume, 1)}
                    <IconCurrencyEthereum size='18' />
                  </StatNumber>
                  <StatHelpText color='darkgray.200' whiteSpace='nowrap'>
                    Total Vol.
                  </StatHelpText>
                </Stat>
              </HStack>
            )}
            <Box mb={2}>
              {chain === 'ethereum' && (
                <Tooltip label='Ethereum chain'>
                  <Image
                    src={IconEthereum}
                    alt='Ethereum chain'
                    width='24px'
                    height='24px'
                    d='inline-block'
                    verticalAlign='middle'
                    p={0.5}
                  />
                </Tooltip>
              )}
              {chain === 'polygon' && (
                <Tooltip label='Polygon chain'>
                  <Image
                    src={IconPolygon}
                    alt='Polygon chain'
                    width='24px'
                    height='24px'
                    d='inline-block'
                    verticalAlign='middle'
                    p={0.5}
                  />
                </Tooltip>
              )}
              {nftData?.external_url && (
                <Tooltip label='Visit website'>
                  <Link
                    href={nftData.external_url}
                    target='_blank'
                    d='inline-block'
                    verticalAlign='middle'
                    mr={1}
                  >
                    <IconLink
                      stroke={1.5}
                      color='var(--chakra-colors-lightgray-800)'
                    />
                  </Link>
                </Tooltip>
              )}
              {nftData?.discord_url && (
                <Tooltip label='Discord'>
                  <Link
                    href={nftData.discord_url}
                    target='_blank'
                    d='inline-block'
                    verticalAlign='middle'
                    mr={1}
                  >
                    <Image
                      src={IconDiscord}
                      alt=''
                      height='24px'
                      width='24px'
                    />
                  </Link>
                </Tooltip>
              )}
              {nftData?.twitter_username && (
                <Tooltip label='Twitter'>
                  <Link
                    href={`https://twitter.com/${nftData.twitter_username}`}
                    target='_blank'
                    d='inline-block'
                    verticalAlign='middle'
                    mr={1}
                  >
                    <IconBrandTwitter
                      stroke={1.5}
                      color='white'
                      fill='var(--chakra-colors-lightgray-800)'
                    />
                  </Link>
                </Tooltip>
              )}
              {nftData?.contract_address && (
                <Tooltip label='Etherscan'>
                  <Link
                    href={`https://etherscan.io/address/${nftData.contract_address}`}
                    target='_blank'
                    d='inline-block'
                    verticalAlign='middle'
                    mr={1}
                  >
                    <Image
                      src={IconEtherscan}
                      alt=''
                      height='21px'
                      width='21px'
                      padding='2px'
                    />
                  </Link>
                </Tooltip>
              )}
              {nftData?.medium_username && (
                <Tooltip label='Medium'>
                  <Link
                    href={`https://medium.com/${nftData.medium_username}`}
                    target='_blank'
                    d='inline-block'
                    verticalAlign='middle'
                  >
                    <IconBrandMedium
                      stroke={1.5}
                      color='white'
                      fill='var(--chakra-colors-lightgray-800)'
                    />
                  </Link>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Flex>
      </Flex>
      <Tabs
        display='flex'
        flexDirection='column'
        overflowY='auto'
        className='custom-scrollbar'
        flex='10 100px'
        variant='enclosed'
        isLazy
      >
        <TabList padding='0 var(--chakra-space-5)'>
          <Tab>
            Chat{' '}
            {unreadCount && unreadCount !== 0 ? (
              <Badge variant='black' background='information.400' ml={1}>
                {unreadCount}
              </Badge>
            ) : (
              <></>
            )}
          </Tab>
          {tweetCount && tweetCount !== 0 ? (
            <Tab>
              Tweets{' '}
              {/* <Badge variant="black" background="information.400" ml={1}>
                         {tweetCount}
                      </Badge> */}
            </Tab>
          ) : (
            <></>
          )}
        </TabList>

        <TabPanels overflowY='auto' className='custom-scrollbar' height='100%'>
          <TabPanel px='0' height='100%' padding='0'>
            <NFTGroupChat account={account} nftContractAddr={nftContractAddr} />
          </TabPanel>
          <TabPanel p={5}>
            <NFTTweets account={account} nftContractAddr={nftContractAddr} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  )
}

export default NFTByContract
