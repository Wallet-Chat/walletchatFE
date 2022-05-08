import { Route, Routes, Navigate } from 'react-router-dom'
import { ChakraProvider, Button, Box, Flex } from '@chakra-ui/react'
import { theme } from './theme'

import Header from './components/Header'
import './App.scss'
import Chat from './scenes/Chat'
import { useWallet } from './context/WalletProvider'

export const App = () => {
   const { isAuthenticated, connectWallet, disconnectWallet } = useWallet()

   return (
      <ChakraProvider theme={theme}>
         <Box>
            <Header />
            <Button
               variant="black"
               onClick={isAuthenticated ? disconnectWallet : connectWallet}
               id="wallet-connect"
            >
               {isAuthenticated ? 'Disconnect Wallet' : 'Connect Wallet'}
            </Button>
            <Flex px={8} py={6}>
               <Box>
                  <Routes>
                     <Route path="/chat" element={<Chat />} />
                     <Route
                        path="/"
                        element={<Navigate to="/chat" replace />}
                     />
                  </Routes>
               </Box>
            </Flex>
         </Box>
      </ChakraProvider>
   )
}
