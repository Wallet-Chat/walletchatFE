import {
   Avatar,
   Box,
   Button,
   Flex,
   Heading,
   Image,
   Link,
   Modal,
   ModalBody,
   ModalCloseButton,
   ModalContent,
   ModalFooter,
   ModalHeader,
   ModalOverlay,
   Spinner,
   Text,
   Tooltip,
   useDisclosure,
   useToast,
} from '@chakra-ui/react'
import { IconBrandTwitter, IconExternalLink, IconMessageCircle, IconPhoto } from '@tabler/icons'
import pluralize from 'pluralize'
import { ChangeEvent, useEffect, useState } from 'react'
import { useParams, useLocation, NavLink, Route, Routes } from 'react-router-dom'
import equal from 'fast-deep-equal/es6'

import CommunityGroupChat from './components/CommunityGroupChat'
import CommunityTweets from './components/CommunityTweets'
import { useHover } from '../../../../helpers/useHover'
import IconDiscord from '../../../../images/icon-products/icon-discord.svg'
import CommunityType from '../../../../types/Community'
import Resizer from 'react-image-file-resizer'
import { useWallet } from '../../../../context/WalletProvider'

const activeStyle = {
   background: "var(--chakra-colors-gray-200)"
}

const CommunityByName = () => {
   let { community = '' } = useParams()
   const location = useLocation()
   const { account } = useWallet()

   const [communityData, setCommunityData] = useState<CommunityType>()
   const [
      isFetchingCommunityDataFirstTime,
      setIsFetchingCommunityDataFirstTime,
   ] = useState(true)
   const [joined, setJoined] = useState<boolean | null>(null)
   const [joinBtnIsHovering, joinBtnHoverProps] = useHover()
   const [isFetchingJoining, setIsFetchingJoining] = useState(false)

   const { isOpen, onOpen, onClose } = useDisclosure()

   const [file, setFile] = useState<Blob | MediaSource>()
   const [filePreview, setFilePreview] = useState('')
   const [isFetchingAvatar, setIsFetchingAvatar] = useState(false)
   const [isSuccessAvatar, setIsSuccessAvatar] = useState(false)
   const toast = useToast()

   const pp = useParams()
   console.log(location, pp)

   const resizeFile = (file: Blob) =>
      new Promise((resolve) => {
         Resizer.imageFileResizer(
            file,
            64,
            64,
            'JPEG',
            100,
            0,
            (uri) => {
               resolve(uri)
            },
            'base64'
         )
      })

   useEffect(() => {
      getCommunityData()
   }, [account, community])

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
               credentials: 'include',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('jwt')}`,
               },
            }
         )
            .then((response) => response.json())
            .then(async (data: CommunityType) => {
               if (!equal(data?.messages, communityData?.messages)) {
                  console.log('✅[GET][Community]:', data)
                  setCommunityData({
                     ...data,
                     twitter: data?.social?.find((i) => i.type === 'twitter')
                        ?.username,
                     discord: data?.social?.find((i) => i.type === 'discord')
                        ?.username,
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
         fetch(
            ` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/create_bookmark`,
            {
               method: 'POST',
               credentials: 'include',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('jwt')}`,
               },
               body: JSON.stringify({
                  walletaddr: account,
                  nftaddr: community,
               }),
            }
         )
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
         fetch(
            ` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/delete_bookmark`,
            {
               method: 'POST',
               credentials: 'include',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('jwt')}`,
               },
               body: JSON.stringify({
                  walletaddr: account,
                  nftaddr: community,
               }),
            }
         )
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

   useEffect(() => {
      // create the preview
      if (file) {
         const objectUrl = URL.createObjectURL(file)
         setFilePreview(objectUrl)

         // free memory whenever this component is unmounted
         return () => URL.revokeObjectURL(objectUrl)
      }
   }, [file])

   const upload = async (e: ChangeEvent<HTMLInputElement>) => {
      console.warn(e.target.files)
      const files = e.target.files
      if (files && files.length !== 0) {
         setFile(files[0])
         const image = await resizeFile(files[0])

         setIsFetchingAvatar(true)
         if (isSuccessAvatar) {
            setIsSuccessAvatar(false)
         }

         if (!community) {
            console.log('Missing community name')
            return
         }

         fetch(
            ` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/image`,
            {
               method: 'PUT',
               credentials: 'include',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('jwt')}`,
               },
               body: JSON.stringify({
                  base64data: image,
                  addr: community,
               }),
            }
         )
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[POST][Image]:', response)
               toast({
                  title: 'Success',
                  description: `Community avatar updated`,
                  status: 'success',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
               setIsSuccessAvatar(true)
            })
            .catch((error) => {
               console.error('🚨[POST][Image]:', error)
               toast({
                  title: 'Error',
                  description: `Image Not Updated - Unknown error`,
                  status: 'error',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
            })
            .then(() => {
               setIsFetchingAvatar(false)
            })
      }
   }

   return (
      <Flex flexDirection="column" background="white" height="100vh" flex="1">
         {/* <Box p={1} background="gray.900" color="gray.100">
            <Flex
               border="1px solid #e2e2e2"
               borderRadius="sm"
               justifyContent="space-between"
               alignItems="center"
            >
               <Box
                  py={0.5}
                  px={2}
                  fontSize="xs"
                  letterSpacing={2}
                  textTransform="uppercase"
               >
                  You are admin
               </Box>
               <Box>
                  <Button onClick={onOpen} variant="white" size="xs">
                     Manage
                  </Button>
               </Box>
            </Flex>
         </Box> */}
         <Flex alignItems="center" px={5} pt={4} pb={2}>
            <Flex justifyContent="space-between">
               <Flex alignItems="flex-start" p={2} borderRadius="md">
                  <label
                     style={{
                        pointerEvents: isFetchingAvatar ? 'none' : 'auto',
                     }}
                  >
                     <Avatar
                        size="md"
                        name={communityData?.name}
                        src={
                           isSuccessAvatar ? filePreview : communityData?.logo
                        }
                        mr={2}
                        cursor="pointer"
                        overflow="hidden"
                        data-group
                     >
                        <input
                           type="file"
                           onChange={(e) => upload(e)}
                           name="img"
                           style={{
                              position: 'absolute',
                              opacity: '0',
                           }}
                        />
                        {isFetchingAvatar && (
                           <Flex
                              background="rgba(0,0,0,0.5)"
                              position="absolute"
                              bottom="0%"
                              width="100%"
                              height="100%"
                              borderRadius="50%"
                              justifyContent="center"
                              alignItems="center"
                           >
                              <Spinner color="gray.500" size="sm" />
                           </Flex>
                        )}
                        <Flex
                           background="gray.300"
                           position="absolute"
                           bottom="0%"
                           width="100%"
                           justifyContent="center"
                           py={0.5}
                           px={1}
                           transform="translateY(100%)"
                           transition="transform 0.2s ease-in-out"
                           _groupHover={{
                              transform: 'translateY(0)',
                           }}
                        >
                           <IconPhoto
                              color="black"
                              size={20}
                              strokeWidth={1.5}
                           />
                        </Flex>
                     </Avatar>
                  </label>

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
                           <Heading
                              size="md"
                              mr="1"
                              maxWidth={[140, 140, 200, 300]}
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                           >
                              {communityData.name}
                           </Heading>
                        </Flex>
                     )}
                     <Box>
                        {communityData?.members && (
                           <Box>
                              <Text fontSize="md">
                                 {communityData.members}{' '}
                                 {pluralize('member', communityData?.members)}
                              </Text>
                           </Box>
                        )}
                     </Box>
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
               <Flex>
                  <NavLink
                     to="./"
                     relative="path"
                     style={({ isActive }) => (isActive ? activeStyle : {})}
                  >
                     <IconMessageCircle strokeWidth={1.5} />
                  </NavLink>
                  {communityData?.tweets && communityData.tweets.length > 0 ? (
                     <NavLink
                        to="./tweets"
                        relative="path"
                        style={({ isActive }) => (isActive ? activeStyle : {})}
                     >
                        <IconBrandTwitter strokeWidth={1.5} />
                     </NavLink>
                  ) : (
                     <></>
                  )}
                  {communityData?.discord && (
                     <Tooltip
                        label={
                           <Flex>
                              <Box mr={1}>Discord</Box>{' '}
                              <IconExternalLink strokeWidth={1.5} size={15} />
                           </Flex>
                        }
                     >
                        <Link
                           href={`https://www.discord.gg/${communityData.discord}`}
                           target="_blank"
                           d="inline-block"
                           verticalAlign="middle"
                           mr={1}
                        >
                           <Image
                              src={IconDiscord}
                              alt=""
                              height="24px"
                              width="24px"
                           />
                        </Link>
                     </Tooltip>
                  )}
                  {communityData?.twitter && (
                     <Tooltip
                        label={
                           <Flex>
                              <Box mr={1}>Twitter</Box>{' '}
                              <IconExternalLink strokeWidth={1.5} size={15} />
                           </Flex>
                        }
                     >
                        <Link
                           href={`https://twitter.com/${communityData?.twitter}`}
                           target="_blank"
                           d="inline-block"
                           verticalAlign="middle"
                        >
                           <IconBrandTwitter
                              stroke={1.5}
                              color="white"
                              fill="var(--chakra-colors-lightgray-800)"
                           />
                        </Link>
                     </Tooltip>
                  )}
               </Flex>
            </Flex>
         </Flex>
         <Box
            display="flex"
            flexDirection="column"
            overflowY="auto"
            flexGrow={1}
         >
            <Box overflowY="auto" className="custom-scrollbar" height="100%">
               <Routes>
                  <Route
                     index
                     element={
                        <CommunityGroupChat
                           account={account}
                           community={community}
                           chatData={communityData?.messages || []}
                           isFetchingCommunityDataFirstTime={
                              isFetchingCommunityDataFirstTime
                           }
                        />
                     }
                  />
                  <Route
                     path="tweets"
                     element={
                        <CommunityTweets tweets={communityData?.tweets || []} />
                     }
                  />
               </Routes>
            </Box>
         </Box>
         <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
               <ModalHeader>Community Info</ModalHeader>
               <ModalCloseButton />
               <ModalBody>
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
               </ModalBody>

               <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={onClose}>
                     Close
                  </Button>
               </ModalFooter>
            </ModalContent>
         </Modal>
      </Flex>
   )
}

export default CommunityByName
