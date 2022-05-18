import { useEffect } from 'react'
import { IconX } from '@tabler/icons'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { Button, Box, Flex, Image, Heading, Spinner } from '@chakra-ui/react'

import logoThumb from './images/logo-thumb.svg'
import './App.scss'
import Inbox from './scenes/Inbox'
import NewConversation from './scenes/NewConversation'
import Chat from './scenes/Chat'
import Sidebar from './components/Sidebar'
import { useWallet } from './context/WalletProvider'
import { useUnreadCount } from './context/UnreadCountProvider'

export const App = () => {

   const { unreadCount, setUnreadCount } = useUnreadCount()
   const location = useLocation()
   console.log("location", location)

   const {
      appLoading,
      isAuthenticated,
      connectWallet,
      disconnectWallet,
      account,
      web3,
   } = useWallet()

   useEffect(() => {
      const interval = setInterval(() => {
         getUnreadCount()
       }, 30000) // every 30s
     
       return () => clearInterval(interval)
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
            console.log('✅ [GET] UNREAD COUNT:', count)
            setUnreadCount(count)
         })
         .catch((error) => {
            console.error('🚨🚨REST API Error [GET]:', error)
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
            {closeBtn}
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
                  className="bg-pattern"
                  padding="70px 40px"
                  flexGrow={1}
               >
                  <Image src={logoThumb} mb={5} width="40px" />
                  <Heading size="2xl" mb={8}>
                     Login to start chatting
                  </Heading>
                  <Button
                     variant="black"
                     onClick={() => connectWallet()}
                     size="lg"
                  >
                     Sign in using wallet
                  </Button>
               </Box>
            )}
         </Flex>
      )
   } else {
      return (
         <Box>
            <Flex>
               {closeBtn}
               <Sidebar
                  unreadCount={unreadCount}
                  currAccountAddress={account}
                  disconnectWallet={disconnectWallet}
               />
               <Box flex="1">
                  <Routes>
                     <Route
                        path="/new"
                        element={<NewConversation web3={web3} />}
                     />
                     <Route
                        path="/chat/:address"
                        element={
                           <Chat
                              account={account}
                              web3={web3}
                              isAuthenticated={isAuthenticated}
                           />
                        }
                     />
                     <Route
                        path="/chat"
                        element={
                           <Inbox
                              account={account}
                              web3={web3}
                              isAuthenticated={isAuthenticated}
                           />
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
