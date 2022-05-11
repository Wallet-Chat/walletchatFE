import { Route, Routes, Navigate } from 'react-router-dom'
import { Button, Box, Flex, Image, Heading } from '@chakra-ui/react'

import logoThumb from './images/logo-thumb.svg'
import './App.scss'
import Inbox from './scenes/Inbox'
import NewConversation from './scenes/NewConversation'
import Chat from './scenes/Chat'
import Sidebar from './components/Sidebar'
import { useWallet } from './context/WalletProvider'
import { IconX } from '@tabler/icons'
import LoadingIndicator from './components/LoadingIndicator'

export const App = () => {
   const {
      appLoading,
      isAuthenticated,
      connectWallet,
      disconnectWallet,
      account,
      web3,
   } = useWallet()

   const closeBtn = (
      <Flex textAlign="right" position="fixed" top={0} right={0}>
         <Button
            borderBottomLeftRadius="lg"
            borderBottomRightRadius="lg"
            borderTopLeftRadius={0}
            borderTopRightRadius={0}
            background="lightGray.500"
            py={0}
            px={1}
            size="lg"
            height="24px"
            onClick={() => window.close()}
         >
            <IconX size={18} color="var(--chakra-colors-darkGray-700)" />
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
            <Box
               borderRadius="lg"
               className="bg-pattern"
               padding="70px 40px"
               flexGrow={1}
            >
               <Image src={logoThumb} mb={5} width="40px" />
               {appLoading ? (
                  <LoadingIndicator />
               ) : (
                  <>
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
                  </>
               )}
            </Box>
         </Flex>
      )
   } else {
      return (
         <Box>
            <Flex>
               {closeBtn}
               <Sidebar
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
                        element={<Chat account={account} web3={web3} />}
                     />
                     <Route path="/chat" element={<Inbox web3={web3} />} />
                     <Route
                        path="/"
                        element={<Navigate to="/chat" replace />}
                     />
                  </Routes>
               </Box>
            </Flex>
         </Box>
      )
   }
}
