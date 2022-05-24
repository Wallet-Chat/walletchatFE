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
   background: var(--chakra-colors-lightgray-200);

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

const Sidebar = ({
   nftContractAddr,
   nftId,
}: {
   nftContractAddr: string
   nftId: number
}) => {
   const nftNotificationCount = 0
   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [imageUrl, setImageUrl] = useState<string>()

   const { metadata } = nftData || {}

   useEffect(() => {
      if (nftContractAddr && nftId) {
         getNftMetadata(nftContractAddr, nftId)
      }
   }, [nftContractAddr, nftId])

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