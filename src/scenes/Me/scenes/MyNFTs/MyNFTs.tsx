import { Box, Flex, Heading, Spinner } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

import { convertIpfsUriToUrl } from '../../../../helpers/ipfs'
import MyNFTItem from './components/MyNFTItem'
import { NFTPortNFT } from '../../../../types/NFTPort/NFT'
import OpenSeaNFT, {
   openseaToGeneralNFTType,
} from '../../../../types/OpenSea/NFT'
import NFT from '../../../../types/NFT'
import { nftPortToGeneralNFTType } from '../../../../types/NFTPort/NFT'

export default function MyNFTs({ account }: { account: string }) {
   const [nfts, setNfts] = useState<NFT[]>([])
   const [isFetching, setIsFetching] = useState(true)

   useEffect(() => {
      const fetchAllNfts = async () => {
         if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
            console.log('Missing NFTPort API Key')
            return
         }
         if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
            console.log('Missing OpenSea API Key')
            return
         }
         if (!account) {
            console.log('No account connected')
            return
         }

         if (!isFetching) setIsFetching(true)

         await Promise.all([
            fetch(
               `https://api.nftport.xyz/v0/accounts/${account}?chain=polygon`,
               {
                  method: 'GET',
                  headers: {
                     Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
                  },
               }
            ).then((res) => res.json()),
            fetch(`https://api.opensea.io/api/v1/assets?owner=${account}`, {
               method: 'GET',
               headers: {
                  Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
               },
            }).then((res) => res.json()),
         ])
            .then(([polygonData, ethereumData]) => {
               console.log(
                  `✅[GET][NFTs] ${account}:`,
                  polygonData,
                  ethereumData
               )
               let transformed: NFT[] = []
               if (polygonData?.nfts?.length > 0) {
                  transformed = polygonData.nfts
                     .filter((nft: NFTPortNFT) => nft.name || nft.file_url)
                     .map((nft: NFTPortNFT) => {
                        const _nft = nftPortToGeneralNFTType(nft)
                        return {
                           ..._nft,
                           chain_id: '137',
                           image: _nft?.image?.includes('ipfs://')
                              ? convertIpfsUriToUrl(_nft.image)
                              : _nft.image,
                        }
                     })
               }
               if (ethereumData?.assets?.length > 0) {
                  transformed = transformed.concat(
                     ethereumData.assets
                        .filter((nft: OpenSeaNFT) => nft.name || nft.image_url)
                        .map((nft: OpenSeaNFT) => {
                           const _nft = openseaToGeneralNFTType(nft)
                           return {
                              ..._nft,
                              chain_id: '1',
                           }
                        })
                  )
               }
               setNfts(transformed)
            })
            .catch((error) => console.log(`🚨[GET][NFTs] ${account}`, error))
            .then(() => {
               setIsFetching(false)
            })
      }
      fetchAllNfts()
   }, [account])

   if (isFetching) {
      return (
         <Flex justifyContent="center" alignItems="center">
            <Spinner />
         </Flex>
      )
   }

   return (
      <Box
         height={isMobile ? 'unset' : '100vh'}
         overflowY="auto"
         className="custom-scrollbar"
      >
         <Box px={4} py={6} background="white">
            <Heading size="xl" mb={5}>
               My NFTs
            </Heading>
            <Flex wrap="wrap">
               {nfts.map((nft, i) => (
                  <Box mb={4} mr={4} key={i}>
                     <MyNFTItem key={i} nft={nft} />
                  </Box>
               ))}
            </Flex>
         </Box>
      </Box>
   )
}
