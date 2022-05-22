import {
   Box,
   Image,
   Flex,
   MenuButton,
   MenuList,
   MenuItem,
   Menu,
   Badge
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { IconCirclePlus, IconMessageCircle2 } from '@tabler/icons'
import Blockies from 'react-blockies'
import styled from 'styled-components'

import logoThumb from '../images/logo-thumb.svg'
import { getContractAddressAndNFTId } from '../helpers/contract'
import NFTMetadataType from '../types/NFTMetadata'

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
`

const LinkElem2 = styled(LinkElem)`
   background: var(--chakra-colors-lightgray-200);
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
   width: 100%;
   height: 1px;
   &::before {
      content: '';
      display: block;
      margin: 0 auto;
      width: 40px;
      height: 1px;
      border-bottom: 1px solid #cbcbcb;
   }
`

interface URLChangedEvent extends Event {
   detail?: string
}

const Sidebar = ({
   unreadCount,
   currAccountAddress,
   disconnectWallet,
}: {
   unreadCount: number
   currAccountAddress: string
   disconnectWallet: () => void
}) => {
   const nftNotificationCount = 0
   const [url, setUrl] = useState<string | undefined>('')
   const [nftContractAddr, setNftContractAddr] = useState<string>()
   const [nftId, setNftId] = useState<number>()
   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [imageUrl, setImageUrl] = useState<string>()

   const { metadata } = nftData || {}

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

      return () => {
         window.removeEventListener('urlChangedEvent', updateURL)
      }
   }, [])

   useEffect(() => {
      if (url) {
         const [contractAddress, nftId] = getContractAddressAndNFTId(url)
         if (contractAddress && nftId !== null) {
            console.log(contractAddress, nftId)
            setNftContractAddr(contractAddress)
            setNftId(parseInt(nftId))
            getNftMetadata(contractAddress, parseInt(nftId))
         }
      }
   }, [url])

   const getNftMetadata = (nftContractAddr: string, nftId: number) => {
      const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}/getNFTMetadata`
      const fetchURL = `${baseURL}?contractAddress=${nftContractAddr}&tokenId=${nftId}&tokenType=erc721`

      fetch(fetchURL, {
         method: 'GET',
      })
         .then((response) => response.json())
         .then((result: NFTMetadataType) => {
            console.log('✅[GET][NFT data]:', result)
            // console.log(JSON.stringify(result, null, 2))
            setNftData(result)
            console.log('metadata:', result && result.metadata)

            let url = result.metadata && result.metadata.image
            if (url?.includes('ipfs://')) {
               let parts = url.split('ipfs://')
               let cid = parts[parts.length - 1]
               url = `https://ipfs.io/ipfs/${cid}`
               setImageUrl(url)
            } else {
               setImageUrl(url)
            }
         })
         .catch((error) => console.log('error', error))
   }

   return (
      <Flex
         justifyContent="space-between"
         alignItems="center"
         flexFlow="column nowrap"
         borderRight="1px solid var(--chakra-colors-lightgray-400)"
         background="white"
         height="100vh"
         padding="0.2rem"
      >
         <Flex flexDirection="column" alignItems="center">
            <Box padding="0.8rem">
               <Image src={logoThumb} alt="" width="30px" />
            </Box>
            <Box mt={2}></Box>
            <Divider />
            <Box mb={5}></Box>
            <LinkElem to={'/chat'}>
               <IconMessageCircle2 size="30" stroke={1.5} />
               {unreadCount > 0 && (
                  <Badge
                     variant="black"
                     position="absolute"
                     bottom="0"
                     right="0"
                     fontSize="lg"
                  >
                     {unreadCount}
                  </Badge>
               )}
            </LinkElem>
            {console.log(metadata)}
            {metadata && (
               <LinkElem2 to={`/nft/${nftContractAddr}/${nftId}`}>
                  {/* <Image src={coolcat2356} alt="" width="40px" /> */}
                  {imageUrl && (
                     <Image
                        src={imageUrl}
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
         <Flex flexDirection="column" alignItems="center">
            <LinkElem to={`/new`}>
               <IconCirclePlus size="30" stroke={1.5} />
            </LinkElem>
            <Menu>
               <MenuButton as={AccountInfo}>
                  {currAccountAddress && (
                     <>
                        <Blockies
                           seed={currAccountAddress.toLocaleLowerCase()}
                           scale={4}
                        />
                        <span
                           style={{
                              fontSize: 'var(--chakra-fontSizes-md)',
                              color: 'var(--chakra-colors-darkgray-500)',
                           }}
                        >
                           {currAccountAddress.substring(0, 5)}
                        </span>
                     </>
                  )}
               </MenuButton>
               <MenuList>
                  <MenuItem onClick={() => disconnectWallet()}>
                     Sign out
                  </MenuItem>
               </MenuList>
            </Menu>
         </Flex>
      </Flex>
   )
}

export default Sidebar
