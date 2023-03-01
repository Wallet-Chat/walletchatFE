import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { Box, Flex, Image, Heading, Spinner, Tag } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { isMobile } from 'react-device-detect'
import * as PAGES from '@/constants/pages'
import logoThumb from './images/logo-thumb.svg'
import './App.scss'
import Inbox from './scenes/DM'
import NewConversation from './scenes/NewConversation'
import DMByAddress from './scenes/DM/scenes/DMByAddress'
import NFT from './scenes/NFT'
import Sidebar from './components/Sidebar/Sidebar'
import { useWallet } from './context/WalletProvider'
import useIsMobileView from './context/IsMobileViewProvider'
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

export const App = () => {
  const { isAuthenticated, name, account, web3, delegate }: any = useWallet()

  const isMobileView = useIsMobileView()

  if (!isAuthenticated) {
    return (
      <Flex
        p={2}
        flexFlow='column'
        position='absolute'
        top='15px'
        bottom='15px'
        left='10px'
        right='10px'
      >
        {isChromeExtension() && <ExtensionCloseButton />}

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

          <ConnectButton chainStatus='none' showBalance={false} />
        </Box>
      </Flex>
    )
  }

  if (isAuthenticated && !name) {
    return (
      <Box>
        <Flex>
          {isChromeExtension() && <ExtensionCloseButton />}

          <Sidebar />

          {name === undefined ? (
            <Flex
              justifyContent='center'
              alignItems='center'
              height='100vh'
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
        minHeight={isMobile ? '100vh' : 'unset'}
      >
        {isChromeExtension() && <ExtensionCloseButton />}

        <Sidebar />

        <Box flex='1' overflow='hidden' minWidth='1px'>
          <Routes>
            <Route path={`/${PAGES.DM}`}>
              <Route
                path='new'
                element={
                  <Flex>
                    <NewConversation web3={web3} />
                    {!isMobileView && (
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
                element={
                  <Flex>
                    <Inbox account={account} web3={web3} />
                    <Outlet />
                  </Flex>
                }
              >
                <Route
                  index
                  element={
                    !isMobileView && (
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
                    )
                  }
                />

                <Route
                  path=':address'
                  element={<DMByAddress account={account} delegate={delegate} />}
                />
              </Route>
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
                <Flex>
                  <NFT account={account} web3={web3} />
                  {!isMobileView && (
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
                  <Flex>
                    <NFT account={account} web3={web3} />

                    {!isMobileView && (
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
                  <Flex>
                    {!isMobileView && <NFT account={account} web3={web3} />}

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
                      path=':nftId'
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
                  <Flex>
                    <Community account={account} web3={web3} />

                    {!isMobileView && (
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
                  <Flex>
                    {!isMobileView && (
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
        </Box>
      </Flex>
    </Box>
  )
}
