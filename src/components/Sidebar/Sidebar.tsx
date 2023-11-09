import {
  Box,
  Image,
  Divider as CDivider,
  Flex,
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
  Badge,
  MenuGroup,
  Text,
  MenuDivider,
  Link as CLink,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Button,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import { useLocation, NavLink, useNavigate } from 'react-router-dom'
import {
  IconLogout,
  IconMessagePlus,
  IconPencil,
  IconBell,
  IconBrandTwitter,
} from '@tabler/icons'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { useColorMode } from "@chakra-ui/color-mode";

import * as ENV from '@/constants/env'
import IconDiscord from '../../images/icon-products/icon-discord.svg'
import IconPrivacy from '../../images/privacy-policy.png'
import logoThumb from '../../images/logo-thumb.svg'
import NFTPortNFTResponse from '../../types/NFTPort/NFT'
import animatedPlaceholder from '../../images/animated-placeholder.gif'
import { useWallet } from '../../context/WalletProvider'
import { truncateAddress } from '../../helpers/truncateString'
import { convertIpfsUriToUrl } from '../../helpers/ipfs'
import { useUnreadCount } from '../../context/UnreadCountProvider'
import IconDM from '../../images/icon-dm.svg'
import IconCommunity from '../../images/icon-community.svg'
import IconNFT from '../../images/icon-nft.svg'
import IconSupport from '../../images/icon-feedback.svg'
import IconLeaderboard from '../../images/icon-leaderboard.svg'
import { isChromeExtension } from '../../helpers/chrome'
import Avatar from '../Inbox/DM/Avatar'
import { getSupportWallet } from '@/helpers/widget'
import { API } from 'react-wallet-chat/dist/src/types'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'
import { endpoints } from '@/redux/reducers/dm'
import { log } from '@/helpers/log'
import ToggleColorMode from '../ToggleColorMode'

interface URLChangedEvent extends Event {
  detail?: string
}

//can delete this if we get leaderboard inside the app, then we don't need the external sidebar link
const ExternalSidebarLink = styled(
  ({
    children,
    className,
    to,
    end,
  }: {
    children: any
    className?: string
    to: string
    end?: boolean
  }) => {
    return (
      <a href={to} target="_blank" className={className}>
        {children}
      </a>
    )
  }
)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${isMobile ? '50px' : '60px'};  // Adjusted width
  height: ${isMobile ? '50px' : '60px'};  // Adjusted height
  padding: var(--chakra-space-2);
  margin-bottom: ${isMobile ? '0' : '0.2rem'};
  margin-right: ${isMobile ? '0.2rem' : '0.2rem'};
  border-radius: 0.5rem;
  text-align: center;
  box-sizing: border-box;
  background: #fff;

  &::before {
    content: '';
    width: 5px;
    height: 35%;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    background: transparent;
    border-top-right-radius: 0.2rem;
    border-bottom-right-radius: 0.2rem;
  }

  img {
    opacity: 0.6;
  }

  &:hover,
  &.active {
    background: var(--chakra-colors-lightgray-400);

    &::before {
      background: var(--chakra-colors-darkgray-900);
    }

    img {
      opacity: 1;
    }
  }
`

const SidebarLink = styled(
  ({
    children,
    className,
    to,
    end,
  }: {
    children: any
    className?: string
    to: string
    end?: boolean
  }) => {
    return (
      <NavLink to={to} end={!!end} className={className}>
        {children}
      </NavLink>
    )
  }
)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${isMobile ? '50px' : '60px'};
  height: ${isMobile ? '50px' : '60px'};
  padding: var(--chakra-space-2);
  margin-bottom: ${isMobile ? '0' : '0.2rem'};
  margin-right: ${isMobile ? '0.2rem' : '0.2rem'};
  border-radius: 0.5rem;
  text-align: center;
  box-sizing: border-box;
  background: #fff;

  &::before {
    content: '';
    width: 5px;
    height: 35%;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    background: transparent;
    border-top-right-radius: 0.2rem;
    border-bottom-right-radius: 0.2rem;
  }

  img {
    opacity: 0.6;
  }

  &:hover,
  &.active {
    background: var(--chakra-colors-lightgray-400);

    &::before {
      background: var(--chakra-colors-darkgray-900);
    }

    svg {
      stroke: var(--chakra-colors-darkgray-900);
    }
    img {
      opacity: 1;
    }
  }
`
const NFTSidebarLink = styled(SidebarLink)`
  background: var(--chakra-colors-lightgray-200);
`
const Divider = () => (
  <Box
    display='block'
    w={isMobile ? 'px' : 'full'}
    h={isMobile ? 'full' : 'px'}
    _before={{
      content: '""',
      display: 'block',
      my: '0',
      mx: 'auto',
      w: isMobile ? 'px' : '10',
      h: isMobile ? '10' : 'px',
      borderBottom: '1px solid #cbcbcb',
      borderRight: '1px solid #cbcbcb',
    }}
  />
)

const AccountInfo = styled.button`
  padding: ${isMobile ? '0.2rem 0.3rem' : '0.6rem 0.8rem'};
  border-radius: var(--chakra-radii-md);
  /* border-bottom-left-radius: 0.5rem;
   border-bottom-right-radius: 0.5rem; */
  text-align: center;
  background: var(--chakra-colors-lightgray-400);
  border: 1px solid var(--chakra-colors-lightgray-900);
  /* border-top: none; */

  & > span {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
  }

  &:hover {
    background: var(--chakra-colors-lightgray-500);
  }
`

const UnreadBadge = ({ children }: { children: string }) => (
  <Box
    position='absolute'
    top={0}
    right={0}
    overflow='hidden'
    background='black'
    borderRadius='full'
    border='2px solid #fff'
    display='flex'
    alignItems='center'
    justifyContent='center'
    width='1.5rem'
    height='1.5rem'
  >
    <Badge variant='black' fontSize='sm'>
      {children}
    </Badge>
  </Box>
)

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isSupportPage = location.pathname.includes(getSupportWallet())
  const isNewDMPage = location.pathname.startsWith('/dm/new')
  const urlToCheck = (window.location != window.parent.location)
                        ? document.referrer
                        : document.location.href
  const supportDisabled = urlToCheck.includes("good") //skip support for goodDollar

  const nftNotificationCount = 0
  const [url, setUrl] = useState<string | undefined>('')
  const [nftContractAddr, setNftContractAddr] = useState<string>()
  const [nftId, setNftId] = useState<string>()
  const [chainName, setChainName] = useState('ethereum')
  const [nftData, setNftData] = useState<NFTPortNFTResponse>()
  const [imageUrl, setImageUrl] = useState<string>()
  const { unreadCount } = useUnreadCount()
  const { colorMode } = useColorMode();

  const { metadata } = nftData?.nft || {}

  const { disconnectWallet } = useWallet()
  const account = useAppSelector((state) => selectAccount(state))
  const { currentData: name } = endpoints.getName.useQueryState(
    account?.toLocaleLowerCase()
  )

  const getNftMetadata = (
    nftContractAddr: string,
    nftId: string,
    chain: string
  ) => {
    if (ENV.REACT_APP_NFTPORT_API_KEY === undefined) {
      log('Missing NFT Port API Key')
      return
    }
    if (!nftContractAddr || !nftId) {
      log('Missing contract address or id')
      return
    }
    fetch(
      `https://api.nftport.xyz/v0/nfts/${nftContractAddr}/${nftId}?chain=${chain}`,
      {
        method: 'GET',
        headers: {
          Authorization: ENV.REACT_APP_NFTPORT_API_KEY,
        },
      }
    )
      .then((response) => response.json())
      .then((result: NFTPortNFTResponse) => {
        log('✅[GET][NFT Metadata]:', result)

        setNftData(result)

        const responseUrl = result.nft?.cached_file_url
        if (responseUrl?.includes('ipfs://')) {
          setImageUrl(convertIpfsUriToUrl(responseUrl))
        } else if (responseUrl !== null) {
          setImageUrl(responseUrl)
        }
      })
      .catch((error) => log('error', error))
  }

  useEffect(() => {
    if (isChromeExtension()) {
      const queryInfo = { active: true, lastFocusedWindow: true }
      chrome.tabs &&
        chrome.tabs.query(queryInfo, (tabs) => {
          const url = tabs[0].url
          setUrl(url)
        })

      const updateURL = (e: URLChangedEvent) => {
        if (e.detail && e.detail !== url) {
          // if incoming and existing url are the same, do nothing
          setUrl(e.detail)
        }
      }

      window.addEventListener('urlChangedEvent', updateURL)

      return () => {
        window.removeEventListener('urlChangedEvent', updateURL)
      }
    }
  }, [])

  // -- Widget iFrame API for receiving NFT data --
  

  return (
    <Flex
      justifyContent='space-between'
      alignItems='center'
      flexDirection={isMobile ? 'row' : 'column'}
      borderRight='1px solid var(--chakra-colors-lightgray-400)'
      background={colorMode}
      height={isMobile ? 'auto' : '100vh'}
      py={isMobile ? 'var(--chakra-space-1)' : '0.2rem'}
      px={isMobile ? 'var(--chakra-space-2)' : '0.2rem'}
      order={isMobile ? 2 : 0}
      zIndex='5000'
    >
      <Flex flexDirection={isMobile ? 'row' : 'column'} alignItems='center'>
        {!isMobile && (
          <>
            <Popover>
              <PopoverTrigger>
                <Box
                  padding='0.8rem'
                  cursor='pointer'
                  borderRadius='md'
                  _hover={{ background: 'lightgray.400' }}
                >
                  <Image src={logoThumb} alt='' width='30px' />
                </Box>
              </PopoverTrigger>
              <PopoverContent _focus={{ boxShadow: 'none' }} width='150px'>
                <PopoverArrow />
                <PopoverBody textAlign='left' p={5}>
                  <Text fontSize='md' fontWeight='bold'>
                    WalletChat
                  </Text>
                  <CDivider my='1' />
                  <Flex alignItems='center'>
                    <CLink
                      href='https://twitter.com/wallet_chat'
                      target='_blank'
                    >
                      <IconBrandTwitter
                        stroke={1.5}
                        color='white'
                        fill='var(--chakra-colors-lightgray-800)'
                      />
                    </CLink>
                    <CLink href='http://discord.gg/S47CDmDtdf' target='_blank'>
                      <Image
                        src={IconDiscord}
                        alt=''
                        height='24px'
                        width='24px'
                      />
                    </CLink>
                    <CLink
                      href='https://www.freeprivacypolicy.com/live/28f2eb52-46cc-4346-b7dd-a989aa6b680c'
                      target='_blank'
                    >
                      <Image
                        src={IconPrivacy}
                        alt=''
                        height='24px'
                        width='24px'
                      />
                    </CLink>
                  </Flex>
                  <Text fontSize='sm' mt={2} color='lightgray.900'>
                    Ver. {ENV.REACT_APP_VERSION}
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Box mt={isMobile ? 0 : 2} ml={isMobile ? 2 : 0} />
            <Divider />
            <Box mb={isMobile ? 0 : 5} mr={isMobile ? 5 : 0} />
          </>
        )}

        <SidebarLink to='/dm' end={isSupportPage || isNewDMPage}>
          <Image src={IconDM} alt='' />
          {unreadCount?.dm > 0 && <UnreadBadge>{unreadCount?.dm}</UnreadBadge>}
        </SidebarLink>

        <SidebarLink to='/nft' end={!metadata}>
          <Image src={IconNFT} alt='' />
          {unreadCount?.nft > 0 && (
            <UnreadBadge>{unreadCount?.nft}</UnreadBadge>
          )}
        </SidebarLink>

        <SidebarLink to='/community'>
          <Image src={IconCommunity} alt='' />
          {unreadCount?.community > 0 && (
            <UnreadBadge>{unreadCount?.community}</UnreadBadge>
          )}
        </SidebarLink>

        {!supportDisabled && (  //skip support for goodDollar
          <SidebarLink to={`/dm/${getSupportWallet()}`}>
            <Image src={IconSupport} alt='' />
          </SidebarLink>
        )}

        <ExternalSidebarLink to='https://leaderboard.walletchat.fun'>
          <Image src={IconLeaderboard} alt='' />
        </ExternalSidebarLink>

          {/* active this when we finally add the leaderboard into the app */}
        {/* <SidebarLink to='/leaderboard'>
          <Image src={IconLeaderboard} alt='' />
        </SidebarLink> */}

        {metadata && (
          <NFTSidebarLink to={`/nft/${chainName}/${nftContractAddr}/${nftId}`}>
            {imageUrl && (
              <Image
                src={imageUrl}
                fallbackSrc={animatedPlaceholder}
                alt=''
                height='40px'
                borderRadius='var(--chakra-radii-xl)'
              />
            )}
            {nftNotificationCount > 0 && (
              <Badge
                variant='black'
                position='absolute'
                bottom='0'
                right='0'
                fontSize='lg'
              >
                {nftNotificationCount}
              </Badge>
            )}
          </NFTSidebarLink>
        )}
      </Flex>
      <Flex flexDirection={isMobile ? 'row' : 'column'} alignItems='center'>
        {/* <ToggleColorMode /> */}
        <SidebarLink to='/dm/new'>
          <Button
            size='sm'
            variant='outline'
            borderRadius='full'
            w='100%'
            h='100%'
            _hover={{
              textDecoration: 'none',
              backgroundColor: 'var(--chakra-colors-lightgray-300)',
            }}
          >
            <AddIcon boxSize='4' />
          </Button>
        </SidebarLink>

        <Menu isLazy>
          <MenuButton as={AccountInfo}>
            {account && (
              <>
                <Avatar account={account} />

                {!isMobile && (
                  <span
                    style={{
                      fontSize: 'var(--chakra-fontSizes-md)',
                      color: 'var(--chakra-colors-darkgray-500)',
                    }}
                  >
                    {account.substring(0, 5)}
                  </span>
                )}
              </>
            )}
          </MenuButton>
          <MenuList pb={0} borderColor='darkgray.100'>
            <MenuGroup
              title={name || (account && truncateAddress(account))}
              fontSize='lg'
            >
              <MenuItem
                as={NavLink}
                to='/me/change-name'
                icon={
                  <Box>
                    <IconPencil stroke='1.5' />
                  </Box>
                }
                _hover={{ textDecoration: 'none' }}
              >
                Change Name or PFP
              </MenuItem>
              <MenuItem
                as={NavLink}
                to='/me/change-email'
                icon={
                  <Box>
                    <IconBell stroke='1.5' />
                  </Box>
                }
                _hover={{ textDecoration: 'none' }}
              >
                Notifications
              </MenuItem>
              <MenuItem
                onClick={disconnectWallet}
                icon={
                  <Box>
                    <IconLogout stroke='1.5' />
                  </Box>
                }
              >
                Sign out
              </MenuItem>
            </MenuGroup>
            <MenuDivider borderColor='lightgray.500' />
            <MenuGroup>
              <MenuItem
                as={NavLink}
                to='/dm/0x17FA0A61bf1719D12C08c61F211A063a58267A19'
                icon={
                  <Box>
                    <IconMessagePlus stroke='1.5' />
                  </Box>
                }
                _hover={{ textDecoration: 'none' }}
              >
                Feedback &amp; Suggestions
              </MenuItem>
              <Flex
                justifyContent='space-between'
                alignItems='center'
                px={3}
                background='lightgray.300'
                pb={1}
                borderRadius='md'
                mt={2}
              >
                <Text fontSize='sm' mt={2} color='lightgray.900'>
                  WalletChat Ver. {ENV.REACT_APP_VERSION}
                </Text>
                <Flex alignItems='center'>
                  <CLink href='https://twitter.com/wallet_chat' target='_blank'>
                    <IconBrandTwitter
                      fill='var(--chakra-colors-lightgray-800)'
                      stroke='none'
                    />
                  </CLink>
                  <CLink href='http://discord.gg/S47CDmDtdf' target='_blank'>
                    <Image
                      src={IconDiscord}
                      alt=''
                      height='24px'
                      width='24px'
                    />
                  </CLink>
                  <CLink
                    href='https://www.freeprivacypolicy.com/live/28f2eb52-46cc-4346-b7dd-a989aa6b680c'
                    target='_blank'
                  >
                    <Image
                      src={IconPrivacy}
                      alt=''
                      height='24px'
                      width='24px'
                    />
                  </CLink>
                </Flex>
              </Flex>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  )
}
