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
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
   IconLogout,
   IconMessageCircle2,
   IconMessagePlus,
   IconPencil,
   IconSwitchHorizontal,
} from '@tabler/icons'
import Blockies from 'react-blockies'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { IconBrandTwitter } from '@tabler/icons'

import IconDiscord from '../images/icon-products/icon-discord.svg'
import logoThumb from '../images/logo-thumb.svg'
import { getContractAddressAndNFTId } from '../helpers/contract'
import NFTPortNFT from '../types/NFTPort/NFT'
import animatedPlaceholder from '../images/animated-placeholder.gif'
import { useWallet } from '../context/WalletProvider'
import { truncateAddress } from '../helpers/truncateString'
import { useIsMobileView } from '../context/IsMobileViewProvider'
import { convertIpfsUriToUrl } from '../helpers/ipfs'
import { useUnreadCount } from '../context/UnreadCountProvider'
import IconChat from '../images/icon-chat.svg'
import IconCommunity from '../images/icon-community.svg'
import IconNFT from '../images/icon-nft.svg'

interface URLChangedEvent extends Event {
   detail?: string
}

export default function Sidebar() {
   const nftNotificationCount = 0
   const [url, setUrl] = useState<string | undefined>('')
   const [nftContractAddr, setNftContractAddr] = useState<string>()
   const [nftId, setNftId] = useState<string>()
   const [chainName, setChainName] = useState('ethereum')
   const [nftData, setNftData] = useState<NFTPortNFT>()
   const [imageUrl, setImageUrl] = useState<string>()
   const { unreadCount } = useUnreadCount()

   const { isMobileView } = useIsMobileView()

   const { metadata } = nftData?.nft || {}

   const { disconnectWallet, name, account, walletRequestPermissions } =
      useWallet()

   useEffect(() => {
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
   }, [])

   useEffect(() => {
      if (url) {
         const [contractAddress, nftId, chain] = getContractAddressAndNFTId(url)
         if (contractAddress && nftId !== null && chain) {
            setNftContractAddr(contractAddress)
            setNftId(nftId)
            setChainName(chain)
            if (contractAddress.startsWith('0x')) {
               getNftMetadata(contractAddress, nftId, chain)
            }
         }
      }
   }, [url])

   const getNftMetadata = (
      nftContractAddr: string,
      nftId: string,
      chain: string
   ) => {
      if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
         console.log('Missing NFT Port API Key')
         return
      }
      if (!nftContractAddr || !nftId) {
         console.log('Missing contract address or id')
         return
      }
      fetch(
         `https://api.nftport.xyz/v0/nfts/${nftContractAddr}/${nftId}?chain=${chain}`,
         {
            method: 'GET',
            headers: {
               Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
            },
         }
      )
         .then((response) => response.json())
         .then((result: NFTPortNFT) => {
            console.log('✅[GET][NFT Metadata]:', result)

            setNftData(result)

            let url = result.nft?.cached_file_url
            if (url?.includes('ipfs://')) {
               setImageUrl(convertIpfsUriToUrl(url))
            } else if (url !== null) {
               setImageUrl(url)
            }
         })
         .catch((error) => console.log('error', error))
   }

   return (
      <Flex
         justifyContent="space-between"
         alignItems="center"
         flexDirection={isMobile ? 'row' : 'column'}
         borderRight="1px solid var(--chakra-colors-lightgray-400)"
         background="white"
         height={isMobile ? 'auto' : '100vh'}
         py={isMobile ? 'var(--chakra-space-1)' : '0.2rem'}
         px={isMobile ? 'var(--chakra-space-2)' : '0.2rem'}
         order={isMobile ? 2 : 0}
      >
         <Flex flexDirection={isMobile ? 'row' : 'column'} alignItems="center">
            <Popover>
               <PopoverTrigger>
                  <Box
                     padding="0.8rem"
                     cursor="pointer"
                     borderRadius="md"
                     _hover={{ background: 'lightgray.400' }}
                  >
                     <Image src={logoThumb} alt="" width="30px" />
                  </Box>
               </PopoverTrigger>
               <PopoverContent _focus={{ boxShadow: 'none' }} width="150px">
                  <PopoverArrow />
                  <PopoverBody textAlign="left" p={5}>
                     <Text fontSize="md" fontWeight="bold">
                        WalletChat
                     </Text>
                     <CDivider my="1" />
                     <Flex alignItems="center">
                        <CLink
                           href="https://twitter.com/wallet_chat"
                           target="_blank"
                        >
                           <IconBrandTwitter
                              stroke={1.5}
                              color="white"
                              fill="var(--chakra-colors-lightgray-800)"
                           />
                        </CLink>
                        <CLink
                           href="https://discord.gg/walletchat"
                           target="_blank"
                        >
                           <Image
                              src={IconDiscord}
                              alt=""
                              height="24px"
                              width="24px"
                           />
                        </CLink>
                     </Flex>
                     <Text fontSize="sm" mt={2} color="lightgray.900">
                        Ver. {process.env.REACT_APP_VERSION}
                     </Text>
                  </PopoverBody>
               </PopoverContent>
            </Popover>
            <Box mt={isMobile ? 0 : 2} ml={isMobile ? 2 : 0}></Box>
            <Divider />
            <Box mb={isMobile ? 0 : 5} mr={isMobile ? 5 : 0}></Box>
           
            {name !== null && (
               <>
               <LinkElem to={'/chat'}>
                  {/* <Box className="popup-text">Chat</Box> */}
                  <Image src={IconChat} alt="" />
                  {unreadCount?.dm > 0 && (
                     <UnreadCountContainer>
                        <Badge variant="blue" fontSize="md">
                           {unreadCount?.dm}
                        </Badge>
                     </UnreadCountContainer>
                  )}
               </LinkElem>
               <LinkElem to={'/nft'}>
                  <Image src={IconNFT} alt="" />
                  {unreadCount?.nft > 0 && (
                     <UnreadCountContainer>
                        <Badge variant="blue" fontSize="md">
                           {unreadCount?.nft}
                        </Badge>
                     </UnreadCountContainer>
                  )}
               </LinkElem>
               <LinkElem to={'/community'}>
                  <Image src={IconCommunity} alt="" />
                  {unreadCount?.community > 0 && (
                     <UnreadCountContainer>
                        <Badge variant="blue" fontSize="md">
                           {unreadCount?.community}
                        </Badge>
                     </UnreadCountContainer>
                  )}
               </LinkElem>
               </>
            )}
            
            {metadata && (
               <LinkElem2 to={`/nft/${chainName}/${nftContractAddr}/${nftId}`}>
                  {imageUrl && (
                     <Image
                        src={imageUrl}
                        fallbackSrc={animatedPlaceholder}
                        alt=""
                        height="40px"
                        borderRadius="var(--chakra-radii-xl)"
                     />
                  )}
                  {nftNotificationCount > 0 && (
                     <Badge
                        variant="black"
                        position="absolute"
                        bottom="0"
                        right="0"
                        fontSize="lg"
                     >
                        {nftNotificationCount}
                     </Badge>
                  )}
               </LinkElem2>
            )}
         </Flex>
         <Flex flexDirection={isMobile ? 'row' : 'column'} alignItems="center">
            <Button
               size="sm"
               background="lightgray.200"
               px={2}
               width="100%"
               borderEndStartRadius="0"
               borderEndEndRadius="0"
               border="1px solid var(--chakra-colors-lightgray-900)"
               borderBottom="none"
               _hover={{ background: 'lightgray.500' }}
            >
               <Link to="/me/nfts" style={{ textDecoration: 'none' }}>
                  <Text fontSize="sm">My NFTs</Text>
               </Link>
            </Button>
            <Menu>
               <MenuButton as={AccountInfo}>
                  {account && (
                     <>
                        <Blockies
                           seed={account.toLocaleLowerCase()}
                           scale={4}
                        />
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
               <MenuList pb={0} borderColor="darkgray.100">
                  <MenuGroup
                     title={name || (account && truncateAddress(account))}
                     fontSize="lg"
                  >
                     <MenuItem
                        as={NavLink}
                        to="/me/change-name"
                        icon={
                           <Box>
                              <IconPencil stroke="1.5" />
                           </Box>
                        }
                        _hover={{ textDecoration: 'none' }}
                     >
                        Change name
                     </MenuItem>
                     <MenuItem
                        onClick={() => disconnectWallet()}
                        icon={
                           <Box>
                              <IconLogout stroke="1.5" />
                           </Box>
                        }
                     >
                        Sign out
                     </MenuItem>
                  </MenuGroup>
                  {isMobileView && (
                     <>
                        <MenuDivider />
                        <MenuItem
                           onClick={() => walletRequestPermissions()}
                           icon={
                              <Box>
                                 <IconSwitchHorizontal stroke="1.5" />
                              </Box>
                           }
                        >
                           Connect more
                           <Text fontSize="sm" color="darkgray.400">
                              Switch active account using MetaMask
                           </Text>
                        </MenuItem>
                     </>
                  )}
                  <MenuDivider borderColor="lightgray.500" />
                  <MenuGroup>
                     <MenuItem
                        as={NavLink}
                        to="/chat/0x17FA0A61bf1719D12C08c61F211A063a58267A19"
                        icon={
                           <Box>
                              <IconMessagePlus stroke="1.5" />
                           </Box>
                        }
                        _hover={{ textDecoration: 'none' }}
                     >
                        Feedback &amp; Suggestions
                     </MenuItem>
                     <Flex justifyContent="space-between" alignItems="center" px={3} background="lightgray.300" pb={1} borderRadius="md" mt={2}>
                     <Text fontSize="sm" mt={2} color="lightgray.900">
                        WalletChat Ver. {process.env.REACT_APP_VERSION}
                     </Text>
                     <Flex alignItems="center">
                        <CLink
                           href="https://twitter.com/wallet_chat"
                           target="_blank"
                        >
                           <IconBrandTwitter
                              fill="var(--chakra-colors-lightgray-800)"
                              stroke="none"
                           />
                        </CLink>
                        <CLink
                           href="https://discord.gg/walletchat"
                           target="_blank"
                        >
                           <Image
                              src={IconDiscord}
                              alt=""
                              height="24px"
                              width="24px"
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

const LinkElem = styled(NavLink)`
   position: relative;
   display: flex;
   flex-direction: column;
   align-items: center;
   width: 60px;
   height: 60px;
   padding: var(--chakra-space-2);
   margin-bottom: 0.2rem;
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

   &:hover {
      .popup-text {
         transform: translateY(20%);
         opacity: 1;
      }
   }

   .popup-text {
      position: absolute;
      left: 0;
      bottom: 0;
      background: var(--chakra-colors-darkgray-900);
      color: white;
      transform: translateY(50%);
      border-radius: 0.5rem;
      width: 100%;
      opacity: 0;
      transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
      font-size: var(--chakra-fontSizes-md);
   }
`
const LinkElem2 = styled(LinkElem)`
   background: var(--chakra-colors-lightgray-200);
`
const AccountInfo = styled.button`
   padding: 0.6rem 0.8rem;
   border-bottom-left-radius: 0.5rem;
   border-bottom-right-radius: 0.5rem;
   text-align: center;
   background: var(--chakra-colors-lightgray-400);
   border: 1px solid var(--chakra-colors-lightgray-900);
   border-top: none;

   & > span {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
   }

   &:hover {
      background: var(--chakra-colors-lightgray-500);
   }
`
const Divider = styled.div`
   display: block;
   width: ${isMobile ? '1px' : '100%'};
   height: ${isMobile ? '100%' : '1px'};
   &::before {
      content: '';
      display: block;
      margin: 0 auto;
      width: ${isMobile ? '1px' : '40px'};
      height: ${isMobile ? '40px' : '1px'};
      border-bottom: 1px solid #cbcbcb;
      border-right: 1px solid #cbcbcb;
   }
`
const UnreadCountContainer = styled.div`
   position: absolute;
   top: 0;
   right: 0;
   overflow: hidden;
   background: var(--chakra-colors-information-400);
   border-radius: var(--chakra-radii-md);
   border: 2px solid #fff;
`
