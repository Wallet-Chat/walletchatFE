import { Route, Routes, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Link,
  HStack,
  Box,
  Flex,
  Image,
  Heading,
  Spinner,
  Tag,
  Button,
  useColorMode,
  IconButton
} from '@chakra-ui/react'
import { QuestionIcon } from '@chakra-ui/icons';
import { isMobile } from 'react-device-detect'
import * as PAGES from '@/constants/pages'
import logoThumb from './images/logo-thumb.svg'
import logoTwitter from './images/twitter-logo.svg'
import './App.scss'
import Inbox from './scenes/DM'
import NewConversation from './scenes/NewConversation'
import DMByAddress from './scenes/DM/scenes/DMByAddress'
import NFT from './scenes/NFT'
import Sidebar from './components/Sidebar/Sidebar'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import EnterName from './scenes/Me/scenes/EnterName'
import ChangeName from './scenes/Me/scenes/ChangeName'
import EnterEmail from './scenes/Me/scenes/EnterEmail'
import ChangeEmail from './scenes/Me/scenes/ChangeEmail'
import VerifyEmail from './scenes/Me/scenes/VerifyEmail'
import VerifySuccess from './scenes/Me/scenes/VerifySuccess'
import EnterReferral from './scenes/Me/scenes/EnterReferral/EnterReferral'
import NFTByContractAndId from './scenes/NFT/scenes/NFTByContractAndId'
import Community from './scenes/Community'
import { isChromeExtension } from './helpers/chrome'
import NFTByContract from './scenes/NFT/scenes/NFTByContract'
import POAPById from './scenes/NFT/scenes/POAPById'
import CommunityByName from './scenes/Community/scenes/CommunityByName'
import ExtensionCloseButton from './components/ExtensionCloseButton'
import ConnectWalletButton from '@/components/ConnectWallet'
import { useAppSelector } from './hooks/useSelector'
import { selectAccount, selectIsAuthenticated } from './redux/reducers/account'
import { endpoints } from './redux/reducers/dm'
import { enableDebugPrints, disableDebugPrints } from '@/helpers/log'
import * as ENV from '@/constants/env'
import Joyride, { CallBackProps, EVENTS } from "react-joyride";

import { useEffect, useState } from 'react'
import { API } from 'react-wallet-chat/dist/src/types'
import CreateNewCommunity from './scenes/Community/scenes/CreateNewCommunity'
import Leaderboard from './Leaderboard';
import TwitterPixel from 'react-twitter-pixel';
import storage from './utils/extension-storage';
//for debug printing manually on/off from console
window.debugON = enableDebugPrints
window.debugOFF = disableDebugPrints

// Initialize Twitter Pixel with your Pixel ID
TwitterPixel.init('tw-ofu6x-ohk5b');

const referralInput = "referral";
const accountDetails = "account";
const newDm = "new";
const dm = "dm";
const nft = "nft";
const community = "community";
const support = "support";
const leaderboard = "leaderboard";
const nameInput = "name";

export const App = () => {
  const location = useLocation()
  const [isSnapEnabled, setIsSnapEnabled] = useState(false);
  const account = useAppSelector((state) => selectAccount(state))
  const isAuthenticated = useAppSelector((state) =>
    selectIsAuthenticated(state)
  )
  const { currentData: name } = endpoints.getName.useQueryState(
    account?.toLocaleLowerCase()
  )
  const { currentData: referralCode } = endpoints.getReferredUser.useQueryState(
    account?.toLocaleLowerCase()
  )
  const isNewUserFirstPage = location.pathname.startsWith('/community/walletchat')
  const firstTimeLogin = storage.get('first-time-login');

  const navigate = useNavigate()
  useEffect(() => {
    window.addEventListener('message', (e) => {
      const { target, data }: API = e.data

      if (data) {
        const { contractAddress, itemId, network, redirect, ownerAddress } = data

        if (ownerAddress) {
          navigate(`/dm/${ownerAddress}`)
        }
      }
    })
  }, [navigate])

  useEffect(() => {
    const fetchSnapStatus = async () => {
      if (!isMobile) {
        const snaps = await window.ethereum.request({
          method: 'wallet_getSnaps',
        }); 
        if( Object.keys(snaps).includes('npm:walletchat-metamask-snap') ) {
          setIsSnapEnabled(true);
        }
      }
    };

    fetchSnapStatus();
  }, []);

  const [{ finalTour, finalStep }, setFinalTour] = useState({
    finalTour: true,
    finalStep: [
      {
        content: "Click on this icon to navigate to your list of Dms.",
        locale: { skip: <strong>SKIP</strong> },
        placement: "right",
        target: `.${dm}`,
        disableBeacon: true,
        title: <h2><b>Your list of DMs goes here!</b></h2>
      },
      {
        content: "Click on this icon to navigate to NFT groups you belong to",
        placement: "right",
        target: `.${nft}`,
        disableBeacon: true,
        title: <h2><b>Your NFT groups lives here!</b></h2>
      },
      {
        content: "Click on this icon to navigate to Communities you belong to",
        placement: "right",
        target: `.${community}`,
        disableBeacon: true,
        title: <h2><b>Communities you belong to!</b></h2>
      },
      {
        content: "Facing any issues?...Click on this icon to communicate with the support team",
        placement: "right",
        target: `.${support}`,
        disableBeacon: true,
        title: <h2><b>Support channel lives here!</b></h2>
      },
      {
        content: "Click on this icon to navigate to the WalletChat Leaderboard and see where you rank",
        placement: "right",
        target: `.${leaderboard}`,
        disableBeacon: true,
        title: <h2><b>WalletChat Leaderboard!</b></h2>
      },
    ]
  });

  const isSmallLayout = useIsSmallLayout()
  const { colorMode } = useColorMode();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { type } = data;
    if (type === EVENTS.TOUR_END) {
      storage.set('first-time-login', "false");
      localStorage.removeItem('first-time-login');
    }
  };

  if (!isAuthenticated) {
    return (
      <Flex bg="lightgray" flex={1} padding='15px' w="100%" h="100vh">
        <ExtensionCloseButton />

        <Box
          borderRadius='lg'
          className='bg-pattern'
          padding='70px 40px'
          flexGrow={1}
        >
          <Image src={logoThumb} mb={5} width='40px' />
          <Heading size='2xl' mb={8}>
          Log in to start chatting & earning 🏆
          </Heading>

          <ConnectWalletButton />

          <Heading size='2xl' mb={8} />
          {/* <HStack>
            <Heading size='s'>Delegate.cash supported</Heading>
            <Link
              href='https://twitter.com/delegatecash'
              target='_blank'
              _hover={{
                textDecoration: 'none',
                background: 'var(--chakra-colors-lightgray-400)',
              }}
            >
              <Image src={logoDelegateCash} width='25px' />
            </Link>
          </HStack> */}
          <HStack>
            <Heading size='s'>Powered by WalletChat.fun</Heading>
            <Link
              href='https://twitter.com/wallet_chat'
              target='_blank'
              _hover={{
                textDecoration: 'none',
                background: 'var(--chakra-colors-lightgray-400)',
              }}
            >
              <Image src={logoTwitter} width='25px' />
            </Link>
          </HStack>

          <HStack>
          {!isMobile && !isChromeExtension() && !isSnapEnabled && (
            <div>
            <HStack><br></br></HStack>
            <Button
                variant='black'
                size='lg'
                onClick={() => {
                  window.ethereum.request({
                    method: 'wallet_requestSnaps',
                    params: {
                      ["npm:walletchat-metamask-snap"]: { "version": ENV.REACT_APP_SNAP_VERSION },
                    },
                  });
                    // Trigger Twitter Pixel event
                    TwitterPixel.track('MetamaskSnapInstall', {
                      value: null,
                      conversion_id: null,
                      email_address: null,
                    });
                }}
              >
                Install WalletChat In Metamask
            </Button> 
            <IconButton
              icon={<QuestionIcon />}
              onClick={() => window.open('https://docs.walletchat.fun/metamask-integration', '_blank')}
              bg="transparent"
              fontSize="2xl"
            />
            </div>
          )}
          </HStack>
        </Box>
      </Flex>
    )
  }

  if (isAuthenticated &&
      (typeof referralCode !== "string" ||
      (referralCode !== "existinguser" && !referralCode.startsWith("wc-")))) {
    return (
      <Box>
        <Flex
          flexDirection={isMobile && !isChromeExtension() ? 'column' : 'row'}
          minHeight={isSmallLayout ? '100vh' : 'unset'}
          width='100vw'
        >
          <ExtensionCloseButton />

          <Sidebar 
            accountDetails={accountDetails}
            newDm={newDm} 
          />

          {referralCode === undefined ? (
            <Flex
              flexGrow={1}
              justifyContent='center'
              alignItems='center'
              width='100%'
            >
              <Spinner />
            </Flex>
          ) : (
            <EnterReferral referralInput={referralInput} accountDetails={accountDetails} newDm={newDm} />
          )}
        </Flex>
      </Box>
    )
  }

  if (isAuthenticated && !name) {
    return (
      <Box>
        <Flex
          flexDirection={isMobile && !isChromeExtension() ? 'column' : 'row'}
          minHeight={isSmallLayout ? '100vh' : 'unset'}
          width='100vw'
        >
          <ExtensionCloseButton />

          <Sidebar />

          {name === undefined ? (  
            <Flex
              flexGrow={1}
              justifyContent='center'
              alignItems='center'
              width='100%'
            >
              <Spinner />
            </Flex>
          ) : (
            <EnterName nameInput={nameInput} />
          )}
        </Flex>
      </Box>
    )
  }

  return (
    <Box>
      <Flex
        flexDirection={isMobile && !isChromeExtension() ? 'column' : 'row'}
        minHeight={isSmallLayout ? '100vh' : 'unset'}
        width='100vw'
      >
        <ExtensionCloseButton />

        {isNewUserFirstPage && firstTimeLogin === "true" ? (
          <>
            <Joyride
              callback={handleJoyrideCallback}
              continuous
              run={finalTour}
              steps={finalStep}
              showProgress
              showSkipButton
              hideCloseButton
              scrollToFirstStep
            />
            <Sidebar
              dm={dm}
              nft={nft}
              community={community}
              support={support}
              leaderboard={leaderboard}
            />
          
          </>
        ) : (
          <Sidebar />
        )}

        <Flex
          flex='1 1 0px'
          overflow='hidden'
          minWidth='1px'
          flexDirection='column'
        >
          <Routes>
            <Route path={`/${PAGES.DM}`}>
              <Route
                path='new'
                element={
                  <Flex flexGrow={1}>
                    <NewConversation />
                    {!isSmallLayout && (
                      <Flex
                        background='lightgray.200'
                        flex='1'
                        alignItems='center'
                        justifyContent='center'
                      >
                        <Tag background='white'>
                          Select a chat to start messaging
                        </Tag>
                      </Flex>
                    )}
                  </Flex>
                }
              />

              <Route
                index
                element={
                  <Flex flexGrow={1}>
                    <Inbox />

                    {!isSmallLayout && (
                      <Flex
                        background={colorMode}
                        flex='1'
                        alignItems='center'
                        justifyContent='center'
                      >
                        <Tag color={colorMode === "dark" ? "white": ""}>
                          Select a chat to start messaging
                        </Tag>
                      </Flex>
                    )}
                  </Flex>
                }
              />

              <Route
                path=':address'
                element={
                  <Flex flexGrow={1}>
                    {!isSmallLayout && <Inbox />}

                    <DMByAddress />
                  </Flex>
                }
              />
            </Route>

            <Route path={`/${PAGES.ME}`}>
              <Route path='enter-email' element={<EnterEmail />} />
              <Route path='change-name' element={<ChangeName />} />
              <Route path='change-email' element={<ChangeEmail />} />
              <Route path='verify-email' element={<VerifyEmail />} />
              <Route path='verify-success' element={<VerifySuccess />} />
            </Route>

            <Route
              path='/nft_error'
              element={
                <Flex flexGrow={1}>
                  <NFT />
                  {!isSmallLayout && (
                    <Flex
                      background='lightgray.200'
                      flex='1'
                      alignItems='center'
                      justifyContent='center'
                    >
                      <Tag background='white'>
                        You must own at least one NFT from the Searched
                        Collection
                      </Tag>
                    </Flex>
                  )}
                </Flex>
              }
            />

            <Route path={`/${PAGES.NFT}`}>
              <Route
                index
                element={
                  <Flex flexGrow={1}>
                    <NFT />

                    {!isSmallLayout && (
                      <Flex
                        background={colorMode}
                        flex='1'
                        alignItems='center'
                        justifyContent='center'
                      >
                        <Tag color={colorMode === "dark" ? "white": ""}>
                          Explore NFT groups
                        </Tag>
                      </Flex>
                    )}
                  </Flex>
                }
              />

              <Route
                element={
                  <Flex flexGrow={1}>
                    {!isSmallLayout && <NFT />}

                    <Outlet />
                  </Flex>
                }
              >
                <Route path='poap/:poapId' element={<POAPById />} />

                <Route path=':chain'>
                  <Route path=':nftContractAddr'>
                    <Route index element={<NFTByContract />} />
                    <Route path=':nftId*' element={<NFTByContractAndId />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path={`/${PAGES.COMMUNITY}`}>
              <Route
                index
                element={
                  <Flex flexGrow={1}>
                    <Community />

                    {!isSmallLayout && (
                      <Flex
                        background={colorMode}
                        flex='1'
                        alignItems='center'
                        justifyContent='center'
                      >
                        <Tag color={colorMode === "dark" ? "white": ""}>
                          Select a chat to start messaging
                        </Tag>
                      </Flex>
                    )}
                  </Flex>
                }
              />
	      
              <Route
                path='new'
                element={
                  <Flex flexGrow={1}>
                    <CreateNewCommunity />
                    {!isSmallLayout && (
                      <Flex
                        background='lightgray.200'
                        flex='1'
                        alignItems='center'
                        justifyContent='center'
                      >
                        <Tag background='white'>
                          Select a chat to start messaging
                        </Tag>
                      </Flex>
                    )}
                  </Flex>
                }
              />
              <Route
                path=':community'
                element={
                  <Flex flexGrow={1}>
                    {!isSmallLayout && <Community />}
                    <CommunityByName />
                  </Flex>
                }
              />
            </Route>

            <Route
                path='/leaderboard'
                element={
                  <Flex flexGrow={1}>
                    <Leaderboard />
                  </Flex>
                }
              />

            <Route path='/' element={<Navigate to='/dm' replace />} />
            <Route path='/index.html' element={<Navigate to='/dm' replace />} />
          </Routes>
        </Flex>
      </Flex>
    </Box>
  )
}
