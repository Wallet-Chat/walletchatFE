import {
   Box,
   Button,
   Flex,
   Heading,
   Link as CLink,
   Image,
   Tab,
   TabList,
   TabPanel,
   TabPanels,
   Tabs,
   Text,
   Stack,
   SkeletonCircle,
   Skeleton,
   Tag,
} from '@chakra-ui/react'
import { IconCalendarEvent, IconExternalLink, IconMapPin } from '@tabler/icons'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import NFTGroupChat from '../../components/NFTGroupChat'
import POAPEvent from '../../../../types/POAP/POAPEvent'
import { useHover } from '../../../../helpers/useHover'
import { get, post } from '../../../../services/api'

const POAPById = ({ account }: { account: string }) => {
   let { poapId = '' } = useParams()

   const [poapEvent, setPoapEvent] = useState<POAPEvent>()
   const [isFetchingPoapEvent, setIsFetchingPoapEvent] = useState(false)
   const [joined, setJoined] = useState<boolean | null>(null)
   const [isFetchingJoining, setIsFetchingJoining] = useState(false)
   const [joinBtnIsHovering, joinBtnHoverProps] = useHover()

   useEffect(() => {
      getPOAPEvent()
      getJoinStatus()
   }, [poapId])

   const getJoinStatus = () => {
      if (!poapId) {
         console.log('Missing POAP id')
         return
      }

      get( `/get_bookmarks/${account}/POAP_${poapId}`)
         .then((_joined: boolean) => {
            console.log('✅[GET][POAP][Joined?]')
            setJoined(_joined)
         })
         .catch((error) => {
            console.error('🚨[POST][POAP][Joined?]:', error)
         })
   }

   const joinGroup = () => {
      setIsFetchingJoining(true)

      post( `/create_bookmark`, {
         walletaddr: account,
         nftaddr: `poap_${poapId}`,
      })
         .then(() => {
            console.log('✅[POST][POAP][Join]')
            setJoined(true)
         })
         .finally(() => {
            setIsFetchingJoining(false)
         })
         .catch((error) => {
            console.error('🚨[POST][POAP][Join]:', error)
         })
   }

   const leaveGroup = () => {
      setIsFetchingJoining(true)
      post( `/delete_bookmark`, {
         walletaddr: account,
         nftaddr: `poap_${poapId}`,
      })
         .then((count: number) => {
            console.log('✅[POST][POAP][Leave]')
            setJoined(false)
         })
         .finally(() => setIsFetchingJoining(false))
         .catch((error) => {
            console.error('🚨[POST][POAP][Leave]:', error)
         })
   }

   const getPOAPEvent = () => {
      if (!process.env.REACT_APP_POAP_API_KEY) {
         console.log('Missing POAP API key')
         return
      }
      if (!poapId) {
         console.log('Missing POAP id')
         return
      }
      setIsFetchingPoapEvent(true)
      fetch(`https://api.poap.tech/events/id/${poapId}`, {
         method: 'GET',
         headers: {
            Authorization: process.env.REACT_APP_POAP_API_KEY,
         },
      })
         .then((response) => response.json())
         .then((result: POAPEvent) => {
            console.log(`✅[GET][POAP Event]:`, result)
            setPoapEvent(result)
         })
         .then(() => setIsFetchingPoapEvent(false))
         .catch((error) => console.log(error))
   }

   return (
      <Flex flexDirection="column" background="white" height="100vh" flex="1">
         <Flex alignItems="center" px={5} pt={4} pb={2}>
            {isFetchingPoapEvent ? (
               <Stack direction="row">
                  <SkeletonCircle height="60px" width="60px" />
                  <Stack direction="column" width="220px" maxWidth="100%">
                     <Skeleton height="30px" />
                     <Skeleton height="22px" width="70%" />
                  </Stack>
               </Stack>
            ) : (
               <Flex alignItems="flex-start" p={2} borderRadius="md">
                  {poapEvent?.image_url && (
                     <Image
                        src={poapEvent.image_url}
                        alt=""
                        height="60px"
                        borderRadius="var(--chakra-radii-xl)"
                        mr={3}
                     />
                  )}
                  <Box>
                     <Flex alignItems="center" mb={2}>
                        {poapEvent?.name && (
                           <Heading size="md" mr={2}>
                              {poapEvent.name}
                           </Heading>
                        )}
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
                     <Stack direction="row">
                        <Tag size="sm">
                           <Text ml={1}>
                              <IconMapPin
                                 stroke={1.5}
                                 width="15px"
                                 height="15px"
                                 style={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                 }}
                              />{' '}
                              {poapEvent?.country}
                              {poapEvent?.city ? `, ${poapEvent?.city}` : ''}
                           </Text>
                        </Tag>
                        <Tag size="sm">
                           <Text ml={1}>
                              <IconCalendarEvent
                                 stroke={1.5}
                                 width="15px"
                                 height="15px"
                                 style={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                 }}
                              />{' '}
                              {poapEvent?.start_date.replaceAll('-', ' ')}
                              {poapEvent?.end_date !== poapEvent?.start_date
                                 ? ` - ${poapEvent?.end_date.replaceAll(
                                      '-',
                                      ' '
                                   )}`
                                 : ''}
                           </Text>
                        </Tag>
                     </Stack>
                     <Stack direction="row" mt={2}>
                        <Button
                           size="xs"
                           href={poapEvent?.event_url}
                           as={CLink}
                        >
                           <Text ml={1}>
                              <IconExternalLink
                                 stroke={1.5}
                                 width="15px"
                                 height="15px"
                                 style={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                 }}
                              />{' '}
                              {poapEvent?.event_url}
                           </Text>
                        </Button>
                     </Stack>
                  </Box>
               </Flex>
            )}
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
               <Tab>Chat </Tab>
            </TabList>

            <TabPanels
               overflowY="auto"
               className="custom-scrollbar"
               height="100%"
            >
               <TabPanel px="0" height="100%" padding="0">
                  <NFTGroupChat
                     account={account}
                     nftContractAddr={`poap_${poapId}`}
                  />
               </TabPanel>
            </TabPanels>
         </Tabs>
      </Flex>
   )
}

export default POAPById
