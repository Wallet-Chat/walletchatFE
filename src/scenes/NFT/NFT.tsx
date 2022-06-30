import {
   Badge,
   Box,
   Flex,
   Heading,
   Image,
   Tab,
   TabList,
   TabPanel,
   TabPanels,
   Tabs,
   Text,
} from '@chakra-ui/react'
import { IconExternalLink, IconShieldLock } from '@tabler/icons'
import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import NFTGroupChat from './scenes/NFTGroupChat'
import NFTChat from './scenes/NFTChat'
import NFTComments from './scenes/NFTComments'
import NFTTweets from './scenes/NFTTweets'
import { truncateAddress } from '../../helpers/truncateString'
import NFTMetadataType from '../../types/NFTMetadata'
import NFTStatistics from '../../types/NFTFloorPrice'
import NFTOwnerAddressType from '../../types/NFTOwnerAddressType'

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
   const [nftFloorPrice, setNftFloorPrice] = useState<number>()
   const [ethereumPrice, setEthereumPrice] = useState<number>()
   const [ownerAddr, setOwnerAddr] = useState<string>()
   const recipientAddr =
      searchParams.get('recipient') === null
         ? ownerAddr
         : searchParams.get('recipient')
   const [imageUrl, setImageUrl] = useState<string>()

   const [unreadCount, setUnreadCount] = useState<number>(0)
   const [unreadCommentsCount, setUnreadCommentsCount] = useState<number>(0)
   const [tweetCount, setTweetCount] = useState<number>(0)

   const { metadata } = nftData || {}

   useEffect(() => {
      getNftMetadata()
      getOwnerAddress()
      getNftFloorPrice()
      getEthereumPrice()

      const interval = setInterval(() => {
         getNftFloorPrice()
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
               console.log('✅ [GET][NFT][No. of unread comments]:', count)
               setUnreadCommentsCount(count)
            })
            .catch((error) => {
               console.error('🚨🚨REST API Error [GET]:', error)
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
               console.log('✅ [GET][NFT][No. of tweets]:', count)
               setTweetCount(count)
            })
            .catch((error) => {
               console.error('🚨🚨REST API Error [GET]:', error)
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
               console.log('✅ [GET][NFT][No. of unread msgs]:', count)
               setUnreadCount(count)
            })
            .catch((error) => {
               console.error('🚨🚨REST API Error [GET]:', error)
            })
      }
   }

   const getNftMetadata = () => {
      const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}/getNFTMetadata`
      const fetchURL = `${baseURL}?contractAddress=${nftContractAddr}&tokenId=${nftId}&tokenType=${tokenType}`

      fetch(fetchURL, {
         method: 'GET',
      })
         .then((response) => response.json())
         .then((result: NFTMetadataType) => {
            console.log('✅[GET][NFT data]:', result)
            // console.log(JSON.stringify(result, null, 2))
            setNftData(result)

            let url = result.metadata && result.metadata.image
            if (url?.includes('ipfs://')) {
               let parts = url.split('ipfs://')
               let cid = parts[parts.length - 1]
               url = `https://ipfs.io/ipfs/${cid}`
               setImageUrl(url)
            } else {
               setImageUrl(url)
            }
         })
         .catch((error) => console.log('error', error))
   }

   const getNftFloorPrice = () => {
      if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
         console.log('NFTPORT API KEY is missing')
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
         .then((result: NFTStatistics) => {
            console.log('✅[GET][NFT Statistics]:', result)
            // console.log(JSON.stringify(result, null, 2))
            if (result && result.statistics && result.statistics.floor_price) {
               setNftFloorPrice(result.statistics.floor_price)
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
         <Flex alignItems="center" mb={2} p={5}>
            {imageUrl && (
               <Image
                  src={imageUrl}
                  alt=""
                  height="60px"
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
               {nftFloorPrice && (
                  <Text fontSize="sm" color="lightgray.800">
                     <Badge fontSize="sm">Floor: {nftFloorPrice} Ξ</Badge>{' '}
                     {ethereumPrice &&
                        `(~ $${(ethereumPrice * nftFloorPrice).toFixed(2)})`}
                  </Text>
               )}
            </Box>
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
                  Chat{' '}
                  {unreadCount && unreadCount !== 0 ? (
                     <Badge variant="black" ml={1}>
                        {unreadCount}
                     </Badge>
                  ) : (
                     <></>
                  )}
               </Tab>
               <Tab>
                  Comments{' '}
                  {unreadCommentsCount && unreadCommentsCount !== 0 ? (
                     <Badge variant="black" ml={1}>
                        {unreadCommentsCount}
                     </Badge>
                  ) : (
                     <></>
                  )}
               </Tab>
               {tweetCount && tweetCount !== 0 ? (
                  <Tab>
                     Tweets{' '}
                     <Badge variant="black" ml={1}>
                        {tweetCount}
                     </Badge>
                  </Tab>
               ) : (
                  <></>
               )}
            </TabList>

            <TabPanels
               overflowY="auto"
               className="custom-scrollbar"
               height="100%"
            >
               <Tabs
                  display="flex"
                  flexDirection="column"
                  overflowY="auto"
                  flexGrow={1}
                  variant="soft-rounded"
                  size="sm"
                  isFitted
                  height="100%"
                  isLazy
               >
                  <TabList py={3} px={5}>
                     <Tab>Group Chat</Tab>
                     <Tab>
                        <IconShieldLock stroke={1.5} size={18} />
                        <Text ml={1}>DM Owner</Text>{' '}
                        {unreadCount && unreadCount !== 0 ? (
                           <Badge variant="black" ml={1}>
                              {unreadCount}
                           </Badge>
                        ) : (
                           <></>
                        )}
                     </Tab>
                  </TabList>
                  <TabPanels
                     overflowY="auto"
                     className="custom-scrollbar"
                     height="100%"
                  >
                     <TabPanel px="0" height="100%" padding="0">
                        <NFTGroupChat
                           ownerAddr={ownerAddr}
                           account={account}
                           nftContractAddr={nftContractAddr}
                        />
                     </TabPanel>
                     <TabPanel px="0" height="100%" padding="0">
                        <NFTChat
                           recipientAddr={recipientAddr}
                           ownerAddr={ownerAddr}
                           account={account}
                           nftContractAddr={nftContractAddr}
                           nftId={nftId}
                           publicKey={publicKey}
                           privateKey={privateKey}
                        />
                     </TabPanel>
                  </TabPanels>
               </Tabs>
               <TabPanel p={5}>
                  <NFTComments
                     account={account}
                     ownerAddr={ownerAddr}
                     nftContractAddr={nftContractAddr}
                     nftId={nftId}
                  />
               </TabPanel>
               <TabPanel p={5}>
                  <NFTTweets
                     account={account}
                     ownerAddr={ownerAddr}
                     nftContractAddr={nftContractAddr}
                  />
               </TabPanel>
            </TabPanels>
         </Tabs>
      </Flex>
   )
}

export default NFT
