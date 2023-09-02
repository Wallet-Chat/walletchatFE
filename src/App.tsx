import { Route, Routes, Navigate, Outlet, useNavigate } from 'react-router-dom'
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
} from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import * as PAGES from '@/constants/pages'
import logoThumb from './images/logo-thumb.svg'
import logoTwitter from './images/twitter-logo.svg'
import logoDelegateCash from './images/delegateCash.svg'
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
import { log, enableDebugPrints, disableDebugPrints } from '@/helpers/log'
import { ReactComponent as FlaskFox } from '@/images/flask_fox.svg';
import { useEffect } from 'react'
import { API } from 'react-wallet-chat/dist/src/types'
import { useWallet } from './context/WalletProvider'
//for debug printing manually on/off from console
window.debugON = enableDebugPrints
window.debugOFF = disableDebugPrints

export const App = () => {
  const account = useAppSelector((state) => selectAccount(state))
  const isAuthenticated = useAppSelector((state) =>
    selectIsAuthenticated(state)
  )
  const { currentData: name } = endpoints.getName.useQueryState(
    account?.toLocaleLowerCase()
  )
  const { currentData: referral_code } = endpoints.getReferredUser.useQueryState(
    account?.toLocaleLowerCase()
  )

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

  const isSmallLayout = useIsSmallLayout()
  const { colorMode } = useColorMode();

  if (!isAuthenticated) {
    return (
      <Flex bg="lightgray" flex={1} padding='15px'>
        <ExtensionCloseButton />

        <Box
          borderRadius='lg'
          className='bg-pattern'
          padding='70px 40px'
          flexGrow={1}
        >
          <Image src={logoThumb} mb={5} width='40px' />
          <Heading size='2xl' mb={8}>
            Login to start chatting
          </Heading>

          <ConnectWalletButton />

          <Heading size='2xl' mb={8} />
          <HStack>
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
          </HStack>
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
        </Box>
      </Flex>
    )
  }

  if (isAuthenticated && !referral_code) {
    return (
      <Box>
        <Flex
          flexDirection={isMobile && !isChromeExtension() ? 'column' : 'row'}
          minHeight={isSmallLayout ? '100vh' : 'unset'}
          width='100vw'
        >
          <ExtensionCloseButton />

          <Sidebar />

          {referral_code === undefined ? (
            <Flex
              flexGrow={1}
              justifyContent='center'
              alignItems='center'
              width='100%'
            >
              <Spinner />
            </Flex>
          ) : (
            <EnterReferral />
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
            <EnterName />
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

        <Sidebar />

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
                path=':community'
                element={
                  <Flex flexGrow={1}>
                    {!isSmallLayout && <Community />}
                    <CommunityByName />
                  </Flex>
                }
              />
            </Route>

            <Route path='/' element={<Navigate to='/dm' replace />} />
            <Route path='/index.html' element={<Navigate to='/dm' replace />} />
          </Routes>
        </Flex>
      </Flex>
    </Box>
  )
}
