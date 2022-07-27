import { useEffect, useState } from 'react'
import { IconX } from '@tabler/icons'
import { Route, Routes, Navigate } from 'react-router-dom'
import {
   Button,
   Box,
   Flex,
   Image,
   Heading,
   Spinner,
   Alert,
   Tag,
} from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'


import logoThumb from './images/logo-thumb.svg'
import './App.scss'
import Inbox from './scenes/Inbox'
import NewConversation from './scenes/NewConversation'
import Chat from './scenes/Chat'
import NFT from './scenes/NFT'
import Sidebar from './components/Sidebar'
import { useWallet } from './context/WalletProvider'
import { useIsMobileView } from './context/IsMobileViewProvider'
import { useUnreadCount } from './context/UnreadCountProvider'
import EnterName from './scenes/EnterName'
import ChangeName from './scenes/ChangeName'
import NFTById from './scenes/NFT/scenes/NFTById'
import Community from './scenes/Community'
import { isChromeExtension } from './helpers/chrome'

export const App = () => {
   const { unreadCount, setUnreadCount } = useUnreadCount()
   const [btnClicks, setBtnClicks] = useState(0)

   // const location = useLocation()
   // console.log("location", location)

   const {
      appLoading,
      isAuthenticated,
      connectWallet,
      name,
      account,
      web3,
   } = useWallet()

   const { isMobileView } = useIsMobileView()

   useEffect(() => {
      const interval = setInterval(() => {
         getUnreadCount()
      }, 5000) // every 5s

      return () => {
         clearInterval(interval)
      }
   }, [])

   useEffect(() => {
      getUnreadCount()
   }, [isAuthenticated, account])

   const getUnreadCount = () => {
      if (account) {
         fetch(` ${process.env.REACT_APP_REST_API}/get_unread_cnt/${account}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         })
            .then((response) => response.json())
            .then((count: number) => {
               console.log('✅[GET][Unread Count]:', count)
               setUnreadCount(count)
            })
            .catch((error) => {
               console.error('🚨[GET][Unread Count]:', error)
            })
      }
   }

   const closeBtn = (
      <Flex textAlign="right" position="fixed" top={0} right={0}>
         <Button
            borderBottomLeftRadius="lg"
            borderBottomRightRadius="lg"
            borderTopLeftRadius={0}
            borderTopRightRadius={0}
            background="lightgray.500"
            py={0}
            px={1}
            size="lg"
            height="24px"
            onClick={() => window.close()}
         >
            <IconX size={18} color="var(--chakra-colors-darkgray-700)" />
         </Button>
      </Flex>
   )

   const inbox = (
      <Inbox
         account={account}
         web3={web3}
         isAuthenticated={isAuthenticated}
      />
   )

   if (appLoading || !isAuthenticated) {
      return (
         <Flex
            p={2}
            flexFlow="column"
            position="absolute"
            top="15px"
            bottom="15px"
            left="10px"
            right="10px"
         >
            {/* <Header /> */}
            {isChromeExtension() && closeBtn}
            {appLoading ? (
               <Flex
                  w="100vw"
                  h="100vh"
                  justifyContent="center"
                  alignItems="center"
               >
                  <Spinner />
               </Flex>
            ) : (
               <Box
                  borderRadius="lg"
                  className="space-pattern"
                  padding="70px 40px"
                  flexGrow={1}
               >
                  <Image src={logoThumb} mb={5} width="40px" />
                  <Heading size="2xl" mb={8}>
                     Login to start chatting
                  </Heading>
                  <Button
                     variant="black"
                     onClick={() => {
                        setBtnClicks(btnClicks + 1)
                        connectWallet()
                     }}
                     size="lg"
                  >
                     Sign in using wallet
                  </Button>
                  {btnClicks > 0 && (
                     <Alert status="success" variant="solid" mt={4}>
                        Check the MetaMask extension to continue
                     </Alert>
                  )}
               </Box>
            )}
         </Flex>
      )
   } else if (isAuthenticated && name === null) {
      return (
         <Box>
            <Flex>
               {isChromeExtension() && closeBtn}
               <Sidebar unreadCount={unreadCount} />
               <EnterName account={account} />
            </Flex>
         </Box>
      )
   } else {
      return (
         <Box>
            <Flex flexDirection={(isMobile && !isChromeExtension()) ? 'column' : 'row'} minHeight={isMobile ? '100vh' : 'unset'}>
               {isChromeExtension() && closeBtn}
               <Sidebar unreadCount={unreadCount} />
               <Box flex="1" overflow="hidden" minWidth="1px">
                  <Routes>
                     <Route
                        path="/new"
                        element={<NewConversation web3={web3} />}
                     />
                     <Route
                        path="/chat/:address"
                        element={
                           <Flex>
                              {!isMobileView && inbox}
                              <Chat
                                 account={account}
                                 web3={web3}
                                 isAuthenticated={isAuthenticated}
                              />
                           </Flex>
                        }
                     />
                     <Route
                        path="/chat"
                        element={
                           <Flex>
                              {inbox}
                              {!isMobileView && (
                                 <Flex background="lightgray.200" flex="1" alignItems="center" justifyContent="center">
                                    <Tag background="white">Select a chat to start messaging</Tag>
                                 </Flex>
                              )}
                           </Flex>
                        }
                     />
                     <Route path="/change-name" element={<ChangeName />} />

                     <Route
                        path="/nft/:nftContractAddr/:nftId"
                        element={
                           <Flex>
                              {!isMobileView && inbox}
                              <NFTById
                                 account={account}
                              />
                           </Flex>
                        }
                     />
                     <Route
                        path="/nft/:nftContractAddr"
                        element={
                           <Flex>
                              {!isMobileView && inbox}
                              <NFT account={account} />
                           </Flex>
                        }
                     />
                     <Route
                        path="/community/:community"
                        element={
                           <Flex>
                              {!isMobileView && inbox}
                              <Community account={account} />
                           </Flex>
                        }
                     />
                     <Route
                        path="/"
                        element={<Navigate to="/chat" replace />}
                     />
                     <Route
                        path="/index.html"
                        element={<Navigate to="/chat" replace />}
                     />
                  </Routes>
               </Box>
            </Flex>
         </Box>
      )
   }
}
