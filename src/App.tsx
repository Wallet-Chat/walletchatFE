import { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { ChakraProvider, Button, Box, Flex } from '@chakra-ui/react'
import { theme } from './theme'

import Header from './components/Header'
import LoadingIndicator from './components/LoadingIndicator'
import './App.scss'
import Chat from './scenes/Chat'

export const App = () => {
   const [currentAccount, setCurrentAccount] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   useEffect(() => {
      setIsLoading(true)
      // checkIfWalletIsConnected()
   }, [])

   // const checkIfWalletIsConnected = async () => {
   //    try {
   //       const { ethereum } = window

   //       if (!ethereum) {
   //          console.log('Make sure you have MetaMask!')
   //          setIsLoading(false)
   //          return
   //       } else {
   //          console.log('We have the ethereum object', ethereum)

   //          /*
   //           * Check if we're authorized to access the user's wallet
   //           */
   //          const accounts = await ethereum.request({ method: 'eth_accounts' })

   //          /*
   //           * User can have multiple authorized accounts, we grab the first one if its there!
   //           */
   //          if (accounts.length !== 0) {
   //             const account = accounts[0]
   //             console.log('Found an authorized account:', account)
   //             setCurrentAccount(account)
   //          } else {
   //             console.log('No authorized account found')
   //          }
   //       }
   //    } catch (error) {
   //       console.log(error)
   //    }
   //    setIsLoading(false)
   // }
   // const connectWalletAction = async () => {
   //    try {
   //       const { ethereum } = window

   //       if (!ethereum) {
   //          alert('Get MetaMask!')
   //          return
   //       }

   //       const accounts = await ethereum.request({
   //          method: 'eth_requestAccounts',
   //       })

   //       console.log('Connected', accounts[0])
   //       setCurrentAccount(accounts[0])
   //    } catch (error) {
   //       console.log(error)
   //    }
   // }

   // if (isLoading) {
   //    return <LoadingIndicator />
   // }

   // if (!currentAccount) {
   //    return (
   //       <Box>
   //          <Button variant="" onClick={connectWalletAction}>
   //             Connect Wallet
   //          </Button>
   //       </Box>
   //    )
   // } else {
   return (
      <ChakraProvider theme={theme}>
         <Box>
            <Header />
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
