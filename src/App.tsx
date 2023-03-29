import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import {
  Link,
  HStack,
  Box,
  Flex,
  Image,
  Heading,
  Spinner,
  Tag,
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
import { useWallet } from './context/WalletProvider'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import EnterName from './scenes/Me/scenes/EnterName'
import ChangeName from './scenes/Me/scenes/ChangeName'
import EnterEmail from './scenes/Me/scenes/EnterEmail'
import ChangeEmail from './scenes/Me/scenes/ChangeEmail'
import VerifyEmail from './scenes/Me/scenes/VerifyEmail'
import VerifySuccess from './scenes/Me/scenes/VerifySuccess'
import NFTByContractAndId from './scenes/NFT/scenes/NFTByContractAndId'
import Community from './scenes/Community'
import { isChromeExtension } from './helpers/chrome'
import NFTByContract from './scenes/NFT/scenes/NFTByContract'
import POAPById from './scenes/NFT/scenes/POAPById'
import CommunityByName from './scenes/Community/scenes/CommunityByName'
import ExtensionCloseButton from './components/ExtensionCloseButton'
import ConnectWalletButton from '@/components/ConnectWallet'

export const App = () => {
  const { isAuthenticated, name, account, web3, delegate }: any = useWallet()

  const isSmallLayout = useIsSmallLayout()

  if (!isAuthenticated) {
    return (
      <Flex flex={1} padding='15px'>
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
            <EnterName account={account} />
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
                    <NewConversation web3={web3} />
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
                  <Flex flexGrow={1} overflowY='scroll'>
                    <Inbox account={account} web3={web3} />

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
                path=':address'
                element={
                  <Flex flexGrow={1} overflowY='scroll'>
                    {!isSmallLayout && <Inbox account={account} web3={web3} />}

                    <DMByAddress account={account} delegate={delegate} />
                  </Flex>
                }
              />
            </Route>

            <Route path={`/${PAGES.ME}`}>
              <Route
                path='enter-email'
                element={<EnterEmail account={account} />}
              />
              <Route path='change-name' element={<ChangeName />} />
              <Route
                path='change-email'
                element={<ChangeEmail account={account} />}
              />
              <Route
                path='verify-email'
                element={<VerifyEmail account={account} />}
              />
              <Route
                path='verify-success'
                element={<VerifySuccess account={account} />}
              />
            </Route>

            <Route
              path='/nft_error'
              element={
                <Flex flexGrow={1} overflowY='scroll'>
                  <NFT account={account} web3={web3} />
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
                  <Flex flexGrow={1} overflowY='scroll'>
                    <NFT account={account} web3={web3} />

                    {!isSmallLayout && (
                      <Flex
                        background='lightgray.200'
                        flex='1'
                        alignItems='center'
                        justifyContent='center'
                      >
                        <Tag background='white'>Explore NFT groups</Tag>
                      </Flex>
                    )}
                  </Flex>
                }
              />

              <Route
                element={
                  <Flex flexGrow={1} overflowY='scroll'>
                    {!isSmallLayout && <NFT account={account} web3={web3} />}

                    <Outlet />
                  </Flex>
                }
              >
                <Route
                  path='poap/:poapId'
                  element={<POAPById account={account} />}
                />

                <Route path=':chain'>
                  <Route path=':nftContractAddr'>
                    <Route
                      index
                      element={<NFTByContract account={account} />}
                    />
                    <Route
                      path=':nftId*'
                      element={<NFTByContractAndId account={account} />}
                    />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path={`/${PAGES.COMMUNITY}`}>
              <Route
                index
                element={
                  <Flex flexGrow={1} overflowY='scroll'>
                    <Community account={account} web3={web3} />

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
                  <Flex flexGrow={1} overflowY='scroll'>
                    {!isSmallLayout && (
                      <Community account={account} web3={web3} />
                    )}
                    <CommunityByName account={account} />
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
