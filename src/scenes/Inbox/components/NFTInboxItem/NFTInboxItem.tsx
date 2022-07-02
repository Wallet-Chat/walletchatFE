import { Box, Flex, Image } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Blockies from 'react-blockies'
import NFTMetadataType from '../../../../types/NFTMetadata'
import { MessageUIType } from '../../../../types/Message'
import { formatMessageDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'

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
`
const BlockieWrapper = styled.div`
   border-radius: 0.3rem;
   overflow: hidden;
`
const NotificationCount = styled.div`
   background: var(--chakra-colors-error-600);
   border-radius: 50%;
   width: 18px;
   height: 18px;
   color: #fff;
   font-weight: 700;
   font-size: 90%;
   text-align: center;
   margin-left: auto;
`

const NFTInboxItem = ({ data }: { data: MessageUIType }) => {
   const [nft, setNft] = useState<NFTMetadataType>()
   const [imageUrl, setImageUrl] = useState<string|null|undefined>()
   const [serverData, setServerData] = useState()

   useEffect(() => {
      if (data.nftAddr) {
         if (!process.env.REACT_APP_NFTPORT_API_KEY) {
            console.log('Missing NFTPort API Key')
            return
         }
         fetch(
            `https://api.nftport.xyz/v0/nfts/${data.nftAddr}/1?chain=ethereum`,
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

               setNft(result)

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
   }, [data.nftAddr])

   return (
      <Link to={`/nft/${data.nftAddr}/1`} style={{ textDecoration: 'none' }}>
         <Wrapper>
            <Flex justifyContent="space-between">
               <Flex>
                  <Box mr={2}>
                     <BlockieWrapper>
                        {data.nftAddr && (
                           imageUrl ?
                           <Image src={imageUrl} alt="" width="41px" />
                           :
                           <Blockies seed={data.nftAddr} scale={5} />
                        )}
                     </BlockieWrapper>
                  </Box>
                  <Box>
                     {data.nftAddr && (
                        <RecipientAddress>
                           {nft?.contract.name ? nft?.contract.name : truncateAddress(data.nftAddr)}
                        </RecipientAddress>
                     )}
                     {data.message && (
                        <Box fontSize="md" color="darkgray.100">
                           {data.message.substring(0, 25)}
                           {data.message.length > 25 && '...'}
                        </Box>
                     )}
                  </Box>
               </Flex>
               <Box>
                  <Box className="timestamp">
                     {formatMessageDate(new Date(data.timestamp))}
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
