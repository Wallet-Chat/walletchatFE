import { Box, Flex, Image, Tooltip } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Blockies from 'react-blockies'

import { formatInboxDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'
import NFTContractType from '../../../../types/NFTContract'
import { InboxItemType } from '../../../../types/InboxItem'
import IconPolygon from '../../../../images/icon-polygon.svg'
import IconEthereum from '../../../../images/icon-ethereum.svg'
import { BlockieWrapper } from '../../../../styled/BlockieWrapper'
import {
   InboxItemChainImage,
   InboxItemNotificationCount,
   InboxItemRecipientAddress,
   InboxItemWrapper,
} from '../../../../styled/InboxItem'

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
                        <InboxItemRecipientAddress>
                           {nft?.collection.name
                              ? nft.collection.name
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
