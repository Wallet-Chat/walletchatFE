import { Image, Badge } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

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
   background: #DD4237;

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
      background: #DD4237;

      &::before {
         background: var(--chakra-colors-darkgray-900);
      }

      svg {
         stroke: var(--chakra-colors-darkgray-900);
      }
   }
`

const Sidebar = ({
   nftContractAddr,
   nftId,
}: {
   nftContractAddr: string
   nftId: string
}) => {
   const nftNotificationCount = 0
   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [imageUrl, setImageUrl] = useState<string>()

   const { metadata } = nftData?.nft || {}

   useEffect(() => {
      if (nftContractAddr && nftId) {
         getNftMetadata(nftContractAddr, nftId)
      }
   }, [nftContractAddr, nftId])

   const getNftMetadata = (nftContractAddr: string, nftId: string) => {
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

   return (
      <>
         {metadata && (
            <LinkElem to={`/nft/${nftContractAddr}/${nftId}`}>
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
            </LinkElem>
         )}
      </>
   )
}

export default Sidebar
