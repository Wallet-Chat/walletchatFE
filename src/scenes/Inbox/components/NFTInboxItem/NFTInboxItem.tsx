import { Box, Flex, Image } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Blockies from 'react-blockies'
import { MessageUIType } from '../../../../types/Message'
import { formatInboxDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'
import NFTContractType from '../../../../types/NFTContract'

const Wrapper = styled.button`
   display: block;
   width: 100%;
   padding: var(--chakra-space-3) var(--chakra-space-5);
   background: #fff;
   text-align: left;
   color: var(--chakra-colors-yellow-900);

   &:not(:last-child) {
      border-bottom: 1px solid var(--chakra-colors-red-300);
   }

   &:hover {
      background: var(--chakra-colors-red-300);
   }

   .timestamp {
      display: block;
      color: var(--chakra-colors-yellow-300);
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
   border-radius: 0.3rem;
   overflow: hidden;
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

const NFTInboxItem = ({ data }: { data: MessageUIType }) => {
   const [nft, setNft] = useState<NFTContractType>()

   useEffect(() => {
      if (data.nftAddr) {
         if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
            console.log('Missing OpenSea API Key')
            return
         }
         fetch(`https://api.opensea.io/api/v1/asset_contract/${data.nftAddr}`, {
            method: 'GET',
            headers: {
               Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
            },
         })
            .then((response) => response.json())
            .then((result: NFTContractType) => {
               console.log(`✅[GET][NFT Contract]:`, result)
               if (result?.collection.name) {
                  setNft(result)
               }
            })
            .catch((error) => console.log(`🚨[GET][NFT Contract]:`, error))
      }
   }, [data.nftAddr])

   return (
      <Link to={`/nft/${data.nftAddr}`} style={{ textDecoration: 'none' }}>
         <Wrapper>
            <Flex justifyContent="space-between">
               <Flex>
                  <Box mr={2} flexShrink={0}>
                     <BlockieWrapper>
                        {data.nftAddr &&
                           (nft?.collection.image_url ? (
                              <Image
                                 src={nft.collection.image_url}
                                 alt=""
                                 width="41px"
                              />
                           ) : (
                              <Blockies seed={data.nftAddr} scale={5} />
                           ))}
                     </BlockieWrapper>
                  </Box>
                  <Box minWidth="0">
                     {data.nftAddr && (
                        <RecipientAddress>
                           {nft?.collection.name
                              ? nft.collection.name
                              : truncateAddress(data.nftAddr)}
                        </RecipientAddress>
                     )}
                     {data.message && (
                        <Box fontSize="md" color="darkgray.100" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                           {data.message.substring(0, 25)}{data.message.length > 25 && '...'}
                        </Box>
                     )}
                  </Box>
               </Flex>
               <Box textAlign="right" flexShrink={0}>
                  <Box className="timestamp">
                     {formatInboxDate(data.timestamp)}
                  </Box>
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
