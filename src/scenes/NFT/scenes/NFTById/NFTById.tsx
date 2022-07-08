import {
   Badge,
   Box,
   Button,
   Divider,
   Flex,
   Heading,
   HStack,
   Image,
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
   IconCurrencyEthereum,
   IconExternalLink,
   IconShieldLock,
   IconStar,
} from '@tabler/icons'
import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import NFTGroupChat from '../../components/NFTGroupChat'
import NFTChat from '../../components/NFTChat'
// import NFTComments from './scenes/NFTComments'
import NFTTweets from '../../components/NFTTweets'
import { truncateAddress } from '../../../../helpers/truncateString'
import NFTMetadataType from '../../../../types/NFTMetadata'
import NFTStatisticsType from '../../../../types/NFTStatistics'
import NFTOwnerAddressType from '../../../../types/NFTOwnerAddressType'

const tokenType = 'erc721'

const NFT = ({
   account,
   publicKey,
   privateKey,
}: {
   account: string
   publicKey: string
   privateKey: string
}) => {
   let { nftContractAddr = '', nftId = 0 } = useParams()
   let [searchParams] = useSearchParams()

   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [nftStatistics, setNftStatistics] = useState<NFTStatisticsType>()
   const [ethereumPrice, setEthereumPrice] = useState<number>()
   const [isBookmarked, setIsBookmarked] = useState<boolean|null>(null)
   const [ownerAddr, setOwnerAddr] = useState<string>()
   const recipientAddr =
      searchParams.get('recipient') === null
         ? ownerAddr
         : searchParams.get('recipient')
   const [imageUrl, setImageUrl] = useState<string>()

   const [unreadCount, setUnreadCount] = useState<number>(0)
   const [unreadCommentsCount, setUnreadCommentsCount] = useState<number>(0)
   const [tweetCount, setTweetCount] = useState<number>(0)

   const { metadata } = nftData?.nft || {}

   useEffect(() => {
      getNftMetadata()
      getOwnerAddress()
      getNftStatistics()
      getEthereumPrice()
      getBookmarkStatus()

      const interval = setInterval(() => {
         getNftStatistics()
         getEthereumPrice()
      }, 60000) // every 1 min

      return () => {
         clearInterval(interval)
      }
   }, [])

   useEffect(() => {
      getUnreadDMCount()
      getUnreadCommentCount()
      getTweetCount()

      const interval = setInterval(() => {
         getUnreadDMCount()
         getUnreadCommentCount()
         getTweetCount()
      }, 5000) // every 5s

      return () => {
         clearInterval(interval)
      }
   }, [account, ownerAddr])

   const getBookmarkStatus = () => {
      
      fetch(
         ` ${process.env.REACT_APP_REST_API}/get_bookmarks/${account}/${nftContractAddr}`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
         .then((response) => response.json())
         .then((isBookmarked: boolean) => {
            console.log('✅ [GET][NFT][Bookmarked?]')
            setIsBookmarked(isBookmarked)
         })
         .catch((error) => {
            console.error('🚨 [POST][NFT][Bookmarked?]:', error)
         })
   }

   const createBookmark = () => {

         fetch(
            ` ${process.env.REACT_APP_REST_API}/create_bookmark`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  walletaddr: account,
                  nftaddr: nftContractAddr
               }),
            }
         )
            .then((response) => response.json())
            .then((count: number) => {
               console.log('✅ [POST][NFT][Bookmark]')
               setIsBookmarked(true)
            })
            .catch((error) => {
               console.error('🚨 [POST][NFT][Bookmark]:', error)
            })

   }

   const deleteBookmark = () => {

      fetch(
         ` ${process.env.REACT_APP_REST_API}/delete_bookmark`,
         {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               walletaddr: account,
               nftaddr: nftContractAddr
            }),
         }
      )
         .then((response) => response.json())
         .then((count: number) => {
            console.log('✅ [POST][NFT][ Delete Bookmark]')
            setIsBookmarked(false)
         })
         .catch((error) => {
            console.error('🚨 [POST][NFT][Delete Bookmark]:', error)
         })

}

   const getUnreadCommentCount = () => {
      if (account) {
         fetch(
            ` ${process.env.REACT_APP_REST_API}/get_comments_cnt/${nftContractAddr}/${nftId}`,
            {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
               },
            }
         )
            .then((response) => response.json())
            .then((count: number) => {
               console.log('✅[GET][NFT][No. of unread comments]:', count)
               setUnreadCommentsCount(count)
            })
            .catch((error) => {
               console.error('🚨[GET][NFT][No. of unread comments]:', error)
            })
      }
   }
   const getTweetCount = () => {
      if (account) {
         fetch(
            ` ${process.env.REACT_APP_REST_API}/get_twitter_cnt/${nftContractAddr}`,
            {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
               },
            }
         )
            .then((response) => response.json())
            .then((count: number) => {
               console.log('✅[GET][NFT][No. of tweets]:', count)
               setTweetCount(count)
            })
            .catch((error) => {
               console.error('🚨[GET][NFT][No. of tweets]:', error)
            })
      }
   }
   const getUnreadDMCount = () => {
      if (account) {
         fetch(
            ` ${process.env.REACT_APP_REST_API}/get_unread_cnt/${account}/${nftContractAddr}/${nftId}`,
            {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
               },
            }
         )
            .then((response) => response.json())
            .then((count: number) => {
               console.log('✅[GET][NFT][No. of unread msgs]:', count)
               setUnreadCount(count)
            })
            .catch((error) => {
               console.error('🚨[GET][NFT][No. of unread msgs]:', error)
            })
      }
   }

   const getNftMetadata = () => {
      if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
         console.log('Missing NFT Port API Key')
         return
      }
      fetch(
         `https://api.nftport.xyz/v0/nfts/${nftContractAddr}/${nftId}?chain=ethereum`,
         {
            method: 'GET',
            headers: {
               Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
            },
         }
      )
         .then((response) => response.json())
         .then((result: NFTMetadataType) => {
            console.log('✅[GET][NFT Metadata]:', result)

            setNftData(result)

            let url = result.nft?.cached_file_url
            if (url?.includes('ipfs://')) {
               let parts = url.split('ipfs://')
               let cid = parts[parts.length - 1]
               url = `https://ipfs.io/ipfs/${cid}`
               setImageUrl(url)
            } else if (url !== null) {
               setImageUrl(url)
            }
         })
         .catch((error) => console.log('error', error))
   }

   const getNftStatistics = () => {
      if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
         console.log('Missing NFT Port API Key')
         return
      }
      fetch(
         `https://api.nftport.xyz/v0/transactions/stats/${nftContractAddr}?chain=ethereum`,
         {
            method: 'GET',
            headers: {
               Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
            },
         }
      )
         .then((response) => response.json())
         .then((result) => {
            console.log('✅[GET][NFT Statistics]:', result)
            // console.log(JSON.stringify(result, null, 2))
            if (result && result.statistics) {
               setNftStatistics(result.statistics)
            }
         })
         .catch((error) => console.log('error', error))
   }

   const getEthereumPrice = () => {
      fetch(`https://api.coinstats.app/public/v1/coins/ethereum?currency=USD`, {
         method: 'GET',
      })
         .then((response) => response.json())
         .then((result) => {
            console.log('✅[GET][Ethereum Price]:', result)
            if (result && result.coin && result.coin.id === 'ethereum') {
               setEthereumPrice(result.coin.price)
            }
         })
         .catch((error) => console.log('error', error))
   }

   const getOwnerAddress = () => {
      const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}/getOwnersForToken`

      const fetchURL = `${baseURL}?contractAddress=${nftContractAddr}&tokenId=${nftId}&tokenType=${tokenType}`

      fetch(fetchURL, {
         method: 'GET',
      })
         .then((response) => response.json())
         .then((result: NFTOwnerAddressType) => {
            console.log('✅[GET][NFT Owner Address]:', result)
            console.log(JSON.stringify(result, null, 2))
            setOwnerAddr(result.owners[0])
         })
         .catch((error) => console.log('error', error))
   }

   return (
      <Flex flexDirection="column" background="white" height="100vh">
         <Flex alignItems="center" px={5} pt={4} pb={2}>
            <Flex alignItems="flex-start" p={2} borderRadius="md">
               {imageUrl && (
                  <Image
                     src={imageUrl}
                     alt=""
                     height="70px"
                     borderRadius="var(--chakra-radii-xl)"
                     mr={3}
                  />
               )}
               <Box>
                  {metadata && metadata.name && (
                     <Heading size="md">{metadata.name}</Heading>
                  )}
                  {ownerAddr && (
                     <Box mb="1">
                        <Text fontSize="md" color="lightgray.800">
                           Owned by {truncateAddress(ownerAddr)}{' '}
                           <Link
                              to={`https://etherscan.io/address/${ownerAddr}`}
                              target="_blank"
                              style={{
                                 display: 'inline-block',
                                 verticalAlign: 'middle',
                              }}
                           >
                              <IconExternalLink
                                 size={16}
                                 color="var(--chakra-colors-lightgray-900)"
                                 stroke="1.5"
                              />
                           </Link>
                        </Text>
                     </Box>
                  )}

                  <Box
                     px={4}
                     py={2}
                     border="1px solid var(--chakra-colors-lightgray-300)"
                     borderRadius="md"
                  >
                     {/* <Flex alignItems="center">
               {nftData && (
                  <Flex mr={2} color="darkgray.300" alignItems="center">
                     <Text fontSize="sm">Collection:</Text> {nftData?.contract.name}
                  </Flex>
               )}
            </Flex> */}

                     <HStack>
                        {nftStatistics && (
                           <>
                              {/* <Stat flex="0">
                        <StatNumber fontSize="md" color="darkgray.700">
                           {nftStatistics.total_supply}
                        </StatNumber>
                        <StatHelpText color="darkgray.200">Items</StatHelpText>
                     </Stat>
                     <Divider orientation="vertical" height="15px" /> */}
                              <Stat flex="0">
                                 <StatNumber fontSize="md" color="darkgray.700">
                                    {nftStatistics.num_owners}
                                 </StatNumber>
                                 <StatHelpText color="darkgray.200">
                                    Owners
                                 </StatHelpText>
                              </Stat>
                              <Divider orientation="vertical" height="15px" />
                              <Stat flex="0">
                                 <StatNumber
                                    fontSize="md"
                                    color="darkgray.700"
                                    d="flex"
                                    alignItems="center"
                                 >
                                    {nftStatistics.floor_price}
                                    <IconCurrencyEthereum size="18" />
                                    {/* <Text fontSize="sm">{ethereumPrice &&
                     `(~ $${(ethereumPrice * nftStatistics.floor_price).toFixed(2)})`}</Text> */}
                                 </StatNumber>
                                 <StatHelpText color="darkgray.200">
                                    Floor
                                 </StatHelpText>
                              </Stat>
                              <Divider orientation="vertical" height="15px" />
                           </>
                        )}
                        <Tooltip label="Join">
                           <Button size="xs" onClick={() => {
                              if (isBookmarked === null) return
                              else if (isBookmarked === false) {
                                 createBookmark()
                              }
                              else if (isBookmarked === true) {
                                 deleteBookmark()
                              }}}>
                              <Text ml={1}>+ Join</Text>
                           </Button>
                        </Tooltip>
                     </HStack>
                  </Box>
               </Box>
            </Flex>
         </Flex>
         <Tabs
            display="flex"
            flexDirection="column"
            overflowY="auto"
            flexGrow={1}
            variant="enclosed"
            isLazy
         >
            <TabList padding="0 var(--chakra-space-5)">
               <Tab>
                  Social{' '}
                  {unreadCount && unreadCount !== 0 ? (
                     <Badge variant="black" background="information.400" ml={1}>
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
               <Tab>
                  {/* {imageUrl && (
               <Image
                  src={imageUrl}
                  alt=""
                  height="30px"
                  borderRadius="var(--chakra-radii-md)"
                  mr={2}
               />
            )} */}
                  <Box textAlign="left">
                     <Text>DM Owner</Text>{' '}
                     {unreadCount && unreadCount !== 0 ? (
                        <Badge variant="black" ml={1}>
                           {unreadCount}
                        </Badge>
                     ) : (
                        <></>
                     )}
                     <Text fontSize="xs" color="darkgray.100" d="flex">
                        <IconShieldLock size="15" />
                        <Box ml={1}>Private Chat</Box>
                     </Text>
                  </Box>
               </Tab>
               {/* <Tab>
                  Comments{' '}
                  {unreadCommentsCount && unreadCommentsCount !== 0 ? (
                     <Badge variant="black" ml={1}>
                        {unreadCommentsCount}
                     </Badge>
                  ) : (
                     <></>
                  )}
               </Tab> */}
            </TabList>

            <TabPanels
               overflowY="auto"
               className="custom-scrollbar"
               height="100%"
            >
               <TabPanel px="0" height="100%" padding="0">
                  <NFTGroupChat
                     account={account}
                     nftContractAddr={nftContractAddr}
                  />
               </TabPanel>
               <TabPanel p={5}>
                  <NFTTweets
                     account={account}
                     nftContractAddr={nftContractAddr}
                  />
               </TabPanel>
               <TabPanel px="0" height="100%" padding="0">
                  <NFTChat
                     recipientAddr={recipientAddr}
                     account={account}
                     nftContractAddr={nftContractAddr}
                     nftId={nftId}
                     publicKey={publicKey}
                     privateKey={privateKey}
                  />
               </TabPanel>
               {/* <TabPanel p={5}>
                  <NFTComments
                     account={account}
                     nftContractAddr={nftContractAddr}
                     nftId={nftId}
                  />
               </TabPanel> */}
            </TabPanels>
         </Tabs>
      </Flex>
   )
}

export default NFT
