import { Box, Flex, Image, Tooltip } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Blockies from 'react-blockies'

import { formatInboxDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'
import NFTContractType from '../../../../types/NFTContract'
import { InboxItemType } from '../../../../types/InboxItem'
import IconPolygon from "../../../../images/icon-polygon.svg"
import IconEthereum from "../../../../images/icon-ethereum.svg"

const Wrapper = styled.button`
   display: block;
   width: 100%;
   padding: var(--chakra-space-3) var(--chakra-space-5);
   background: #fff;
   text-align: left;
   color: var(--chakra-colors-darkgray-900);

   &:not(:last-child) {
      border-bottom: 1px solid var(--chakra-colors-lightgray-300);
   }

   &:hover {
      background: var(--chakra-colors-lightgray-300);
   }

   .timestamp {
      display: block;
      color: var(--chakra-colors-darkgray-300);
      font-size: var(--chakra-fontSizes-md);
      user-select: none;
      line-height: 1.7;
   }
`
const RecipientAddress = styled.div`
   font-size: var(--chakra-fontSizes-lg);
   font-weight: bold;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
`
const BlockieWrapper = styled.div`
   position: relative;
   border-radius: 0.3rem;
   overflow: hidden;
`
const ChainImage = styled.div`
   position: absolute;
   bottom: 0;
   right: 0;
   width: 1rem;
   height: 1rem;
   background: rgba(255, 255, 255, 0.8);
   padding: var(--chakra-space-0-5);
   border-radius: var(--chakra-radii-sm);
`
const NotificationCount = styled.div`
   display: inline-block;
   background: var(--chakra-colors-information-400);
   border-radius: var(--chakra-radii-md);
   height: 18px;
   color: #fff;
   font-weight: 700;
   font-size: 90%;
   text-align: center;
   margin-left: auto;
   padding: 0 var(--chakra-space-2);
`

const NFTInboxItem = ({ data }: { data: InboxItemType }) => {
   const [nft, setNft] = useState<NFTContractType>()
   const [isError, setIsError] = useState(false)

   useEffect(() => {
      if (data.nftaddr) {
         if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
            console.log('Missing OpenSea API Key')
            return
         }
         fetch(`https://api.opensea.io/api/v1/asset_contract/${data.nftaddr}`, {
            method: 'GET',
            headers: {
               Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
            },
         })
            .then((response) => response.json())
            .then((result: NFTContractType) => {
               // console.log(`✅[GET][NFT Contract]:`, result)
               if (result?.collection.name) {
                  setNft(result)
               }
            })
            .catch((error) => {
               // console.log(`🚨[GET][NFT Contract]:`, error)
               setIsError(true)
            })
      }
   }, [data.nftaddr])

   if (isError) return <Box></Box>

   return (
      <Link to={`/nft/ethereum/${data.nftaddr}`} style={{ textDecoration: 'none' }}>
         <Wrapper>
            <Flex justifyContent="space-between">
               <Flex>
                  <Box mr={2} flexShrink={0}>
                     <BlockieWrapper>
                        {data?.chain === "ethereum" && (
                           <Tooltip label="Ethereum chain">
                              <ChainImage>
                                 <Image src={IconEthereum} alt="Ethereum chain" width="100%" height="100%" />
                              </ChainImage>
                           </Tooltip>
                        )}
                        {data?.chain === "polygon" && (
                           <Tooltip label="Polygon chain">
                              <ChainImage>
                                 <Image src={IconPolygon} alt="Polygon chain"  width="100%" height="100%" />
                              </ChainImage>
                           </Tooltip>
                        )}
                        {data.nftaddr &&
                           (nft?.collection.image_url ? (
                              <Image
                                 src={nft.collection.image_url}
                                 alt=""
                                 width="41px"
                              />
                           ) : (
                              <Blockies seed={data.nftaddr} scale={5} />
                           ))}
                     </BlockieWrapper>
                  </Box>
                  <Box minWidth="0">
                     {data.nftaddr && (
                        <RecipientAddress>
                           {nft?.collection.name
                              ? nft.collection.name
                              : truncateAddress(data.nftaddr)}
                        </RecipientAddress>
                     )}
                     {data.message && (
                        <Box
                           fontSize="md"
                           color="darkgray.100"
                           whiteSpace="nowrap"
                           overflow="hidden"
                           textOverflow="ellipsis"
                        >
                           {data.message.substring(0, 25)}
                           {data.message.length > 25 && '...'}
                        </Box>
                     )}
                     {data.message === '' && (
                        <Box
                           fontSize="md"
                           color="darkgray.100"
                           whiteSpace="nowrap"
                           overflow="hidden"
                           textOverflow="ellipsis"
                        >
                           Welcome!
                        </Box>
                     )}
                  </Box>
               </Flex>
               <Box textAlign="right" flexShrink={0}>
                  {data.timestamp !== '' && (
                     <Box className="timestamp">
                        {formatInboxDate(data.timestamp)}
                     </Box>
                  )}
                  {data.unread && data.unread !== 0 ? (
                     <NotificationCount>{data.unread}</NotificationCount>
                  ) : (
                     ''
                  )}
               </Box>
            </Flex>
         </Wrapper>
      </Link>
   )
}

export default NFTInboxItem
