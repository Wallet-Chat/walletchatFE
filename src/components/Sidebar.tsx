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
   Tooltip,
   Popover,
   PopoverTrigger,
   PopoverContent,
   PopoverArrow,
   PopoverBody,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
   IconCirclePlus,
   IconLogout,
   IconMessageCircle2,
   IconPencil,
   IconSwitchHorizontal,
} from '@tabler/icons'
import Blockies from 'react-blockies'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import {
   IconBrandTwitter,
   IconBrandDiscord
} from '@tabler/icons'

import IconFeedback from '../images/icon-feedback.svg'
import IconDiscord from '../images/icon-discord.svg'
import logoThumb from '../images/logo-thumb.svg'
import { getContractAddressAndNFTId } from '../helpers/contract'
import NFTMetadataType from '../types/NFTMetadata'
// import NFTUnreadType from '../types/NFTUnread'
// import SidebarNFTLink from './SidebarNFTLink'
import animatedPlaceholder from '../images/animated-placeholder.gif'
import { useWallet } from '../context/WalletProvider'
import { truncateAddress } from '../helpers/truncateString'
import { useIsMobileView } from '../context/IsMobileViewProvider'

const LinkElem = styled(NavLink)`
   position: relative;
   display: flex;
   flex-direction: column;
   align-items: center;
   width: 60px;
   height: 60px;
   padding: 0.8rem;
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

   &:hover,
   &.active {
      background: var(--chakra-colors-lightgray-400);

      &::before {
         background: var(--chakra-colors-darkgray-900);
      }

      svg {
         stroke: var(--chakra-colors-darkgray-900);
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
const FeedbackLinkElem = styled(LinkElem)`
   background: var(--chakra-colors-warning-200);
   &.active {
      background: var(--chakra-colors-warning-200);
   }
`
const AccountInfo = styled.button`
   padding: 0.6rem 0.8rem;
   border-radius: 0.5rem;
   text-align: center;
   background: var(--chakra-colors-lightgray-400);

   & > span {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
   }

   &:hover {
      background: var(--chakra-colors-lightgray-300);
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
   bottom: 0;
   right: 0;
   width: 25px;
   height: 25px;
   overflow: hidden;
   background: var(--chakra-colors-information-400);
   border-radius: var(--chakra-radii-md);
   border: 2px solid #fff;

   &::before {
      content: '';
      display: block;
      padding-top: 100%;
   }

   .square-content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      color: white;
   }
   .square-content div {
      display: table;
      width: 100%;
      height: 100%;
   }
   .square-content span {
      display: flex;
      justify-content: center;
      align-items: center;
   }
`

interface URLChangedEvent extends Event {
   detail?: string
}

const Sidebar = ({ unreadCount }: { unreadCount: number }) => {
   const nftNotificationCount = 0
   const [url, setUrl] = useState<string | undefined>('')
   const [nftContractAddr, setNftContractAddr] = useState<string>()
   const [nftId, setNftId] = useState<number>()
   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [imageUrl, setImageUrl] = useState<string>()

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
            // console.log('query tab url:', url)
         })

      const updateURL = (e: URLChangedEvent) => {
         // console.log('received', data)
         if (e.detail && e.detail !== url) {
            // if incoming and existing url are the same, do nothing
            setUrl(e.detail)
         }
      }

      window.addEventListener('urlChangedEvent', updateURL)

      // getUnreadNfts()
      // const interval = setInterval(() => {
      //    getUnreadNfts()
      // }, 5000) // every 5s

      return () => {
         window.removeEventListener('urlChangedEvent', updateURL)
         // clearInterval(interval)
      }
   }, [])

   useEffect(() => {
      if (url) {
         const [contractAddress, nftId] = getContractAddressAndNFTId(url)
         if (contractAddress && nftId !== null) {
            console.log(contractAddress, nftId)
            setNftContractAddr(contractAddress)
            setNftId(parseInt(nftId))
            if (contractAddress.startsWith('0x')) {
               getNftMetadata(contractAddress, parseInt(nftId))
            }
         }
      }
   }, [url])

   const getNftMetadata = (nftContractAddr: string, nftId: number) => {
      if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
         console.log('Missing NFT Port API Key')
         return
      }
      fetch(
         `https://api.nftport.xyz/v0/nfts/${nftContractAddr}/${nftId}?chain=ethereum`,
         {
            method: 'GET',
            headers: {
               Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
            },
         }
      )
         .then((response) => response.json())
         .then((result: NFTMetadataType) => {
            console.log('✅[GET][NFT Metadata]:', result)

            setNftData(result)

            let url = result.nft?.cached_file_url
            if (url?.includes('ipfs://')) {
               let parts = url.split('ipfs://')
               let cid = parts[parts.length - 1]
               url = `https://ipfs.io/ipfs/${cid}`
               setImageUrl(url)
            } else if (url !== null) {
               setImageUrl(url)
            }
         })
         .catch((error) => console.log('error', error))
   }

   // const getUnreadNfts = () => {

   //    fetch(`${process.env.REACT_APP_REST_API}/get_unread_cnt_nft/${currAccountAddress}/`, {
   //       method: 'GET',
   //       headers: {
   //          'Content-Type': 'application/json',
   //       },
   //    })
   //       .then((response) => response.json())
   //       .then((data: NFTUnreadType[]) => {
   //          console.log('✅[GET][Unread NFTs]:', data)
   //          setUnreadNfts(data)
   //       })
   //       .catch((error) => {
   //          console.error('🚨[GET][Unread NFTs]:', error)
   //       })
   // }

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
                  <Box padding="0.8rem" cursor="pointer" borderRadius="md" _hover={{ background: "lightgray.400" }}>
                     <Image src={logoThumb} alt="" width="30px" />
                  </Box>
               </PopoverTrigger>
               <PopoverContent _focus={{ boxShadow: 'none' }} width="150px">
                  <PopoverArrow />
                  <PopoverBody textAlign="left" p={5}>
                     <Text fontSize="md" fontWeight="bold">WalletChat</Text>
                     <CDivider my="1" />
                     <Flex alignItems="center">
                        <Link to="https://twitter.com/wallet_chat" target="_blank"><IconBrandTwitter stroke={1.5} color="white"fill="var(--chakra-colors-lightgray-800)" /></Link>
                        <Link to="https://discord.gg/walletchat" target="_blank"><Image src={IconDiscord} alt="" height="24px" width="24px" /></Link>
                     </Flex>
                     <Text fontSize="sm" mt={2} color="lightgray.900">Ver. {process.env.REACT_APP_VERSION}</Text>
                  </PopoverBody>
               </PopoverContent>
            </Popover>
            <Box mt={isMobile ? 0 : 2} ml={isMobile ? 2 : 0}></Box>
            <Divider />
            <Box mb={isMobile ? 0 : 5} mr={isMobile ? 5 : 0}></Box>

            {name !== null && (
               <LinkElem to={'/chat'}>
                  {/* <Box className="popup-text">Chat</Box> */}
                  <IconMessageCircle2 size="30" stroke={1.5} />
                  {unreadCount > 0 && (
                     <UnreadCountContainer>
                        <Box className="square-content">
                           <Box>
                              <span>
                                 <Badge
                                    variant="black"
                                    background="information.400"
                                    fontSize="lg"
                                 >
                                    {unreadCount}
                                 </Badge>
                              </span>
                           </Box>
                        </Box>
                     </UnreadCountContainer>
                  )}
               </LinkElem>
            )}
            {metadata && (
               <LinkElem2 to={`/nft/${nftContractAddr}/${nftId}`}>
                  {/* <Box className="popup-text">NFT</Box> */}
                  {/* <Image src={coolcat2356} alt="" width="40px" /> */}
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
            {/* {unreadNfts && unreadNfts.map((item, i) => (
               <SidebarNFTLink nftContractAddr={item.nftaddr} nftId={item.nftid} key={i} />
            ))} */}
         </Flex>
         <Flex flexDirection={isMobile ? 'row' : 'column'} alignItems="center">
            {name !== null && (
               <Tooltip label="New" placement="top">
                  <LinkElem to={`/new`}>
                     <IconCirclePlus size="30" stroke={1.5} />
                  </LinkElem>
               </Tooltip>
            )}

            <Tooltip label="Feedback" placement="top">
               <FeedbackLinkElem
                  to={`/chat/0x17FA0A61bf1719D12C08c61F211A063a58267A19`}
               >
                  <Image src={IconFeedback} width="50px" height="50px" alt="" />
               </FeedbackLinkElem>
            </Tooltip>

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
               <MenuList>
                  <MenuGroup
                     title={name || truncateAddress(account)}
                     fontSize="lg"
                  >
                     <MenuItem
                        as={NavLink}
                        to="/change-name"
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
               </MenuList>
            </Menu>
         </Flex>
      </Flex>
   )
}

export default Sidebar
