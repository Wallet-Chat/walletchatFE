import {
   Box,
   Button,
   Divider,
   Flex,
   Heading,
   Image,
   Link,
   Tab,
   TabList,
   TabPanel,
   TabPanels,
   Tabs,
   Text,
   Tooltip,
} from '@chakra-ui/react'
import {
   IconBrandTwitter,
   IconCircleCheck,
} from '@tabler/icons'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import equal from 'fast-deep-equal/es6'

import CommunityGroupChat from './components/CommunityGroupChat'
import CommunityTweets from './components/CommunityTweets'
import { useHover } from '../../../../helpers/useHover'
import IconDiscord from '../../../../images/icon-products/icon-discord.svg'
import CommunityType from '../../../../types/Community'

const CommunityByName = ({ account }: { account: string }) => {
   let { community = '' } = useParams()

   const [communityData, setCommunityData] = useState<CommunityType>()
   const [isFetchingCommunityDataFirstTime, setIsFetchingCommunityDataFirstTime] = useState(true)
   const [joined, setJoined] = useState<boolean | null>(null)
   const [joinBtnIsHovering, joinBtnHoverProps] = useHover()
   const [isFetchingJoining, setIsFetchingJoining] = useState(false)


   useEffect(() => {
      getCommunityData()
   }, [account])

   useEffect(() => {
      // Interval needs to reset else getChatData will use old state
      const interval = setInterval(() => {
         getCommunityData()
      }, 5000) // every 5s

      return () => {
         clearInterval(interval)
      }
   }, [communityData, account])

   const getCommunityData = () => {
      if (account) {
         if (!account) {
            console.log('No account connected')
            return
         }
         fetch(
            `${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/community/${community}/${account}`,
            {
               method: 'GET',
               credentials: "include",
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('jwt_' + account)}`,
               },
            }
         )
            .then((response) => response.json())
            .then(async (data: CommunityType) => {
               if (!equal(data?.messages, communityData?.messages)) {
                  console.log('✅[GET][Community]:', data)
                  setCommunityData({
                     ...data,
                     twitter: data?.social?.find(i => i.type === 'twitter')?.username,
                     discord: data?.social?.find(i => i.type === 'discord')?.username,
                  })
               }
               if (data?.joined === true && joined !== true) {
                  setJoined(true)
               } else if (data?.joined === false && joined !== false) {
                  setJoined(false)
               }
            })
            .catch((error) => {
               console.error('🚨[GET][Community]:', error)
            })
            .finally(() => {
               if (isFetchingCommunityDataFirstTime) {
                  setIsFetchingCommunityDataFirstTime(false)
               }
            })
      }
   }

   const joinGroup = () => {
      if (!isFetchingJoining) {
         setIsFetchingJoining(true)
         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/create_bookmark`, {
            method: 'POST',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt_' + account)}`,
            },
            body: JSON.stringify({
               walletaddr: account,
               nftaddr: community
            }),
         })
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[POST][Community][Join]', response)
               setJoined(true)
            })
            .catch((error) => {
               console.error('🚨[POST][Community][Join]:', error)
            })
            .then(() => {
               setIsFetchingJoining(false)
            })
      }
   }

   const leaveGroup = () => {
      if (!isFetchingJoining) {
         setIsFetchingJoining(true)
         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/delete_bookmark`, {
            method: 'POST',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt_' + account)}`,
            },
            body: JSON.stringify({
               walletaddr: account,
               nftaddr: community,
            }),
         })
            .then((response) => response.json())
            .then((count: number) => {
               console.log('✅[POST][Community][Leave]')
               setJoined(false)
            })
            .catch((error) => {
               console.error('🚨[POST][Community][Leave]:', error)
            })
            .then(() => {
               setIsFetchingJoining(false)
            })
      }
   }

   return (
      <Flex flexDirection="column" background="white" height="100vh" flex="1">
         <Flex alignItems="center" px={5} pt={4} pb={2}>
            <Flex alignItems="flex-start" p={2} borderRadius="md">
               {communityData?.logo && (
                  <Image
                     src={communityData.logo}
                     alt=""
                     height="60px"
                     borderRadius="var(--chakra-radii-xl)"
                     mr={3}
                  />
               )}
               <Box>
                  {communityData?.name && (
                     <Flex alignItems="center">
                        <Heading size="md" mr="1" maxWidth={[140, 140, 200, 300]} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                           {communityData.name}
                        </Heading>
                        <Tooltip label="OpenSea Verified">
                        <Box><IconCircleCheck stroke="2" color="white" fill="var(--chakra-colors-success-600)" /></Box></Tooltip>
                        <Button
                            ml={2}
                           size="xs"
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
                  <Flex alignItems="center">
                     {communityData?.discord && (
                        <Tooltip label="Discord">
                        <Link
                           href={`https://www.discord.gg/${communityData.discord}`}
                           target="_blank"
                           d="inline-block"
                           verticalAlign="middle"
                           mr={1}
                        >
                           <Image src={IconDiscord} alt="" height="24px" width="24px" />
                        </Link>
                     </Tooltip>
                     )}
                     {communityData?.twitter && (
                        <Tooltip label="Twitter">
                        <Link
                           href={`https://twitter.com/${communityData?.twitter}`}
                           target="_blank"
                           d="inline-block"
                           verticalAlign="middle"
                        >
                           <IconBrandTwitter stroke={1.5} color="white"
                              fill="var(--chakra-colors-lightgray-800)" />
                        </Link>
                     </Tooltip>
                     )}
                     <Divider orientation='vertical' height="12px" mx={2} />
                  
                  {communityData?.members && (
                     <Box>
                        <Text fontSize="md">{communityData.members} members</Text>
                     </Box>
                  )}
                  </Flex>
{/* 
                  <Box mb={2}>
                     {nftData?.collection?.external_url && (
                        <Tooltip label="Visit website">
                           <Link
                              href={nftData.collection.external_url}
                              target="_blank"
                              d="inline-block"
                              verticalAlign="middle"
                              mr={1}
                           >
                              <IconLink stroke={1.5} color="var(--chakra-colors-lightgray-800)" />
                           </Link>
                        </Tooltip>
                     )}
                     {nftData?.collection?.discord_url && (
                        <Tooltip label="Discord">
                           <Link
                              href={nftData.collection.discord_url}
                              target="_blank"
                              d="inline-block"
                              verticalAlign="middle"
                              mr={1}
                           >
                              <Image src={IconDiscord} alt="" height="24px" width="24px" />
                           </Link>
                        </Tooltip>
                     )}
                     {nftData?.collection?.twitter_username && (
                        <Tooltip label="Twitter">
                           <Link
                              href={`https://twitter.com/${nftData.collection.twitter_username}`}
                              target="_blank"
                              d="inline-block"
                              verticalAlign="middle"
                              mr={1}
                           >
                              <IconBrandTwitter stroke={1.5} color="white"
                                 fill="var(--chakra-colors-lightgray-800)" />
                           </Link>
                        </Tooltip>
                     )}
                     {nftData?.address && (
                        <Tooltip label="Etherscan">
                           <Link
                              href={`https://etherscan.io/address/${nftData.address}`}
                              target="_blank"
                              d="inline-block"
                              verticalAlign="middle"
                              mr={1}
                           >
                              <Image src={IconEtherscan} alt="" height="21px" width="21px" padding="2px" />
                           </Link>
                        </Tooltip>
                     )}
                     {nftData?.collection?.medium_username && (
                        <Tooltip label="Medium">
                           <Link
                              href={`https://medium.com/${nftData.collection.medium_username}`}
                              target="_blank"
                              d="inline-block"
                              verticalAlign="middle"
                           >
                              <IconBrandMedium
                                 stroke={1.5}
                                 color="white"
                                 fill="var(--chakra-colors-lightgray-800)"
                              />
                           </Link>
                        </Tooltip>
                     )}
                  </Box> */}
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
                  Chat
               </Tab>
               {communityData?.tweets && communityData.tweets.length > 0 ? (
                  <Tab>
                     Tweets{' '}
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
               <TabPanel px="0" height="100%" padding="0">
                  <CommunityGroupChat
                     account={account}
                     community={community}
                     chatData={communityData?.messages || []}
                     isFetchingCommunityDataFirstTime={isFetchingCommunityDataFirstTime}
                  />
               </TabPanel>
               <TabPanel p={5}>
                  <CommunityTweets
                     tweets={communityData?.tweets || []}
                  />
               </TabPanel>
            </TabPanels>
         </Tabs>
      </Flex>
   )
}

export default CommunityByName