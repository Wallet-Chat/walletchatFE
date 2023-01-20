import { useState, useEffect } from 'react'
import type { BasicProfile } from "@datamodels/identity-profile-basic";
import { IconX } from '@tabler/icons'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import {
   Button,
   Box,
   Flex,
   Image,
   Heading,
   Spinner,
   Alert,
   Tag,
   HStack,
   VStack,
} from '@chakra-ui/react'
import ceramicLogo from './images/ceramic.png'
import { isMobile } from 'react-device-detect'
import { useCeramicContext } from './context'
import { authenticateCeramic } from './utils'
import styles from './styles/Home.module.css'


import logoThumb from './images/logo-thumb.svg'
import './App.scss'
import Inbox from './scenes/DM'
import NewConversation from './scenes/NewConversation'
import Chat from './scenes/DM/scenes/DMByAddress'
import NFT from './scenes/NFT'
import Sidebar from './components/Sidebar/Sidebar'
import { useWallet } from './context/WalletProvider'
import { useIsMobileView } from './context/IsMobileViewProvider'
import EnterName from './scenes/Me/scenes/EnterName'
import ChangeName from './scenes/Me/scenes/ChangeName'
import EnterEmail from './scenes/Me/scenes/EnterEmail'
import ChangeEmail from './scenes/Me/scenes/ChangeEmail'
import VerifyEmail from './scenes/Me/scenes/VerifyEmail'
import NFTByContractAndId from './scenes/NFT/scenes/NFTByContractAndId'
import Community from './scenes/Community'
import { isChromeExtension } from './helpers/chrome'
import NFTByContract from './scenes/NFT/scenes/NFTByContract'
import POAPById from './scenes/NFT/scenes/POAPById'
import CommunityByName from './scenes/Community/scenes/CommunityByName'

export const App = () => {
   const location = useLocation();
   const clients = useCeramicContext()
   const { ceramic, composeClient } = clients
   const [profile, setProfile] = useState<BasicProfile | undefined>()
   const [loading, setLoading] = useState<boolean>(false)

   const {
      appLoading,
      isAuthenticated,
      connectWallet,
      connectWalletTezos,
      connectWalletNEAR,
      name,
      isFetchingName,
      account,
      web3,
      error,
      setRedirectUrl,
      btnClicks,
      setBtnClicks
   } = useWallet()
   useEffect(() => {
      const currentPath = location.pathname;
      console.log(`currentPath: ${currentPath}`)
      setRedirectUrl(currentPath)
   }, [location]);

   const { isMobileView } = useIsMobileView()
    
   const handleLogin = async () => {
      await authenticateCeramic(ceramic, composeClient)
      await getProfile()
   }
   
   const getProfile = async () => {
      setLoading(true)
      if(ceramic.did !== undefined) {
         const profile: any = await composeClient.executeQuery(`
         query {
            viewer {
               basicProfile {
               id
               name
               description
               gender
               emoji
               }
            }
         }
         `);
          
         setProfile(profile?.data?.viewer?.basicProfile)
         setLoading(false);
      }
   }
   
   const updateProfile = async () => {
      setLoading(true);
      if (ceramic.did !== undefined) {
         const update = await composeClient.executeQuery(`
         mutation {
            createBasicProfile(input: {
               content: {
               name: "${profile?.name}"
               description: "${profile?.description}"
               gender: "${profile?.gender}"
               emoji: "${profile?.emoji}"
               }
            }) 
            {
               document {
               name
               description
               gender
               emoji
               }
            }
         }
         `);
         await getProfile();
         setLoading(false);
      }
   }
   
   /**
    * On load check if there is a DID-Session in local storage.
    * If there is a DID-Session we can immediately authenticate the user.
    * For more details on how we do this check the 'authenticateCeramic function in`../utils`.
    */
   useEffect(() => {
      if(localStorage.getItem('did')) {
         handleLogin()
      }
   }, [ ])

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
      <Inbox account={account} web3={web3} isAuthenticated={isAuthenticated} />
   )

   const nftInbox = (
      <NFT account={account} web3={web3} isAuthenticated={isAuthenticated} />
   )

   const communityInbox = (
      <Community account={account} web3={web3} isAuthenticated={isAuthenticated} />
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
                  className="bg-pattern"
                  padding="70px 40px"
                  flexGrow={1}
               >
                  <Image src={logoThumb} mb={5} width="40px" />
                  <Heading size="2xl" mb={8}>
                     Login to start chatting
                  </Heading>
                  <Heading>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create ceramic app" />
        <link rel="icon" href="/favicon.ico" />
      </Heading>
      <main className={styles.main}>
        <h1 className={styles.title}>Your Decentralized Profile</h1>
        <Image
          src={ceramicLogo}
          width="100"
          height="100"
          className={styles.logo}
        />
        {profile === undefined && ceramic.did === undefined ? (
          <button
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        ) : (
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                defaultValue={profile?.name || ''}
                onChange={(e) => {
                  setProfile({ ...profile, name: e.target.value });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <input
                type="text"
                defaultValue={profile?.description || ''}
                onChange={(e) => {
                  setProfile({ ...profile, description: e.target.value });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Gender</label>
              <input
                type="text"
                defaultValue={profile?.gender || ''}
                onChange={(e) => {
                  setProfile({ ...profile, gender: e.target.value });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Emoji</label>
              <input
                type="text"
                defaultValue={profile?.emoji || ''}
                onChange={(e) => {
                  setProfile({ ...profile, emoji: e.target.value });
                }}
                maxLength={2}
              />
            </div>
            <div className={styles.buttonContainer}>
              <button
              onClick={() => {
                updateProfile();
              }}>
                {loading ? 'Loading...' : 'Update Profile'}
              </button>
            </div>
          </div>
        )}
      </main>
                  {btnClicks > 0 && !error && (
                     <Alert status="success" variant="solid" mt={4}>
                        Check the your wallet for signature prompt to continue
                     </Alert>
                  )}
                  {error && (
                     <Alert status="error" variant="solid" mt={4}>
                        {error}
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
               <Sidebar />
               {isFetchingName ? (
                  <Flex
                     justifyContent="center"
                     alignItems="center"
                     height="100vh"
                     width="100%"
                  >
                     <Spinner />
                  </Flex>
               ) : (
                  <EnterName account={account} />
               )}
            </Flex>
         </Box>
      )
   } else {
      return (
         <Box>
            <Flex
               flexDirection={
                  isMobile && !isChromeExtension() ? 'column' : 'row'
               }
               minHeight={isMobile ? '100vh' : 'unset'}
            >
               {isChromeExtension() && closeBtn}
               <Sidebar />
               <Box flex="1" overflow="hidden" minWidth="1px">
                  <Routes>
                     <Route
                        path="/dm/new"
                        element={
                           <Flex>
                              <NewConversation web3={web3} />
                              {!isMobileView && (
                                 <Flex
                                    background="lightgray.200"
                                    flex="1"
                                    alignItems="center"
                                    justifyContent="center"
                                 >
                                    <Tag background="white">
                                       Select a chat to start messaging
                                    </Tag>
                                 </Flex>
                              )}
                           </Flex>
                        }
                     />
                     <Route
                        path="/dm/:address"
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
                        path="/dm"
                        element={
                           <Flex>
                              {inbox}
                              {!isMobileView && (
                                 <Flex
                                    background="lightgray.200"
                                    flex="1"
                                    alignItems="center"
                                    justifyContent="center"
                                 >
                                    <Tag background="white">
                                       Select a chat to start messaging
                                    </Tag>
                                 </Flex>
                              )}
                           </Flex>
                        }
                     />
                     <Route path="/me/enter-email" element={<EnterEmail account={account} />} />
                     <Route path="/me/change-name" element={<ChangeName />} />
                     <Route path="/me/change-email" element={<ChangeEmail account={account} />} />
                     <Route path="/me/verify-email" element={<VerifyEmail account={account} />} />
                     <Route
                        path="/nft"
                        element={
                           <Flex>
                              {nftInbox}
                              {!isMobileView && (
                                 <Flex
                                    background="lightgray.200"
                                    flex="1"
                                    alignItems="center"
                                    justifyContent="center"
                                 >
                                    <Tag background="white">
                                       Explore NFT groups
                                    </Tag>
                                 </Flex>
                              )}
                           </Flex>
                        }
                     />
                     <Route
                        path="/nft_error"
                        element={
                           <Flex>
                              {nftInbox}
                              {!isMobileView && (
                                 <Flex
                                    background="lightgray.200"
                                    flex="1"
                                    alignItems="center"
                                    justifyContent="center"
                                 >
                                    <Tag background="white">
                                       You must own at least one NFT from the Searched Collection 
                                    </Tag>
                                 </Flex>
                              )}
                           </Flex>
                        }
                     />
                     <Route
                        path="/nft/poap/:poapId"
                        element={
                           <Flex>
                              {!isMobileView && nftInbox}
                              <POAPById account={account} />
                           </Flex>
                        }
                     />
                     <Route
                        path="/nft/:chain/:nftContractAddr/:nftId"
                        element={
                           <Flex>
                              {!isMobileView && nftInbox}
                              <NFTByContractAndId account={account} />
                           </Flex>
                        }
                     />
                     <Route
                        path="/nft/:chain/:nftContractAddr_Name"
                        element={
                           <Flex>
                              {!isMobileView && nftInbox}
                              <NFTByContract account={account} />
                           </Flex>
                        }
                     />
                     <Route
                        path="/community"
                        element={
                           <Flex>
                              {communityInbox}
                              {!isMobileView && (
                                 <Flex
                                    background="lightgray.200"
                                    flex="1"
                                    alignItems="center"
                                    justifyContent="center"
                                 >
                                    <Tag background="white">
                                       Select a chat to start messaging
                                    </Tag>
                                 </Flex>
                              )}
                           </Flex>
                        }
                     />
                     <Route
                        path="/community/:community"
                        element={
                           <Flex>
                              {!isMobileView && communityInbox}
                              <CommunityByName account={account} />
                           </Flex>
                        }
                     />
                     <Route
                        path="/"
                        element={<Navigate to="/dm" replace />}
                     />
                     <Route
                        path="/index.html"
                        element={<Navigate to="/dm" replace />}
                     />
                  </Routes>
               </Box>
            </Flex>
         </Box>
      )
   }
}
