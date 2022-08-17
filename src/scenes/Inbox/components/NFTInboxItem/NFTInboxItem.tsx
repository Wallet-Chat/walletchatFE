import { Box, Flex, Image, Tooltip } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Blockies from 'react-blockies'

import { formatInboxDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'
import { InboxItemType } from '../../../../types/InboxItem'
import IconPolygon from '../../../../images/icon-chains/icon-polygon.svg'
import IconEthereum from '../../../../images/icon-chains/icon-ethereum.svg'
import { BlockieWrapper } from '../../../../styled/BlockieWrapper'
import {
   InboxItemChainImage,
   InboxItemNotificationCount,
   InboxItemRecipientAddress,
   InboxItemWrapper,
} from '../../../../styled/InboxItem'
import { convertIpfsUriToUrl } from '../../../../helpers/ipfs'
import NFTCollection from '../../../../types/NFTCollection'
import OpenSeaNFTCollection, { openseaToGeneralNFTCollectionType } from '../../../../types/OpenSea/NFTCollection'
import NFTPortNFTCollection, { nftPortToGeneralNFTCollectionType } from '../../../../types/NFTPort/NFTCollection'


const NFTInboxItem = ({ data }: { data: InboxItemType }) => {
   const [nft, setNft] = useState<NFTCollection>()
   const [isError, setIsError] = useState(false)

   useEffect(() => {
      const getNftMetadata = () => {
         if (!data?.nftaddr) {
            console.log('Missing contract address')
            return
         }
         if (data?.chain === 'ethereum') {
            if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
               console.log('Missing OpenSea API Key')
               return
            }
            fetch(
               `https://api.opensea.io/api/v1/asset_contract/${data.nftaddr}`,
               {
                  method: 'GET',
                  headers: {
                     Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
                  },
               }
            )
               .then((response) => response.json())
               .then((result: OpenSeaNFTCollection) => {
                  if (result?.collection?.name) {
                     // console.log(`✅[GET][NFT Contract]:`, result)
                     setNft(openseaToGeneralNFTCollectionType(result))
                  }
               })
               .catch((error) => {
                  console.log(`🚨[GET][NFT Contract]:`, error)
                  setIsError(error)
               })
         } else if (data?.chain === 'polygon') {
            if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
               console.log('Missing NFT Port API Key')
               return
            }
            fetch(
               `https://api.nftport.xyz/v0/nfts/${data.nftaddr}?chain=${data.chain}&page_size=1&include=all`,
               {
                  method: 'GET',
                  headers: {
                     Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
                  },
               }
            )
               .then((response) => response.json())
               .then((data: NFTPortNFTCollection) => {
                  // console.log('✅[GET][NFT Metadata]:', data)

                  let _transformed: NFTCollection = nftPortToGeneralNFTCollectionType(data)
                  setNft({
                     ..._transformed,
                     image_url: _transformed.image_url?.includes('ipfs://') ? convertIpfsUriToUrl(_transformed.image_url) : _transformed.image_url 
                  })
               })
               .catch((error) => {
                  console.log('🚨[GET][NFT Metadata]:', error)
                  setIsError(error)
               })
         }
      }

      getNftMetadata()
   }, [data.nftaddr, data?.chain])

   if (isError || data?.chain === "none") return <Box></Box>

   return (
      <Link
         to={`/nft/ethereum/${data.nftaddr}`}
         style={{ textDecoration: 'none' }}
      >
         <InboxItemWrapper>
            <Flex justifyContent="space-between">
               <Flex>
                  <Box mr={2} flexShrink={0}>
                     <BlockieWrapper>
                        {data?.chain === 'ethereum' && (
                           <Tooltip label="Ethereum chain">
                              <InboxItemChainImage>
                                 <Image
                                    src={IconEthereum}
                                    alt="Ethereum chain"
                                    width="100%"
                                    height="100%"
                                 />
                              </InboxItemChainImage>
                           </Tooltip>
                        )}
                        {data?.chain === 'polygon' && (
                           <Tooltip label="Polygon chain">
                              <InboxItemChainImage>
                                 <Image
                                    src={IconPolygon}
                                    alt="Polygon chain"
                                    width="100%"
                                    height="100%"
                                 />
                              </InboxItemChainImage>
                           </Tooltip>
                        )}
                        {data.nftaddr &&
                           (nft?.image_url ? (
                              <Image
                                 src={nft.image_url}
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
                        <InboxItemRecipientAddress>
                           {nft?.name
                              ? nft.name
                              : truncateAddress(data.nftaddr)}
                        </InboxItemRecipientAddress>
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
                     <InboxItemNotificationCount>
                        {data.unread}
                     </InboxItemNotificationCount>
                  ) : (
                     ''
                  )}
               </Box>
            </Flex>
         </InboxItemWrapper>
      </Link>
   )
}

export default NFTInboxItem
