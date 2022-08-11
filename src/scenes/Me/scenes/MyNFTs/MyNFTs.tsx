import { Box, Flex, Heading, Spinner } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import NFTPortNFT from '../../../../types/NFTPortNFT'
import { convertIpfsUriToUrl } from '../../../../helpers/ipfs'
import MyNFTItem from './components/MyNFTItem'
import NFTAssetType from '../../../../types/NFTAsset'

export default function MyNFTs({ account }: { account: string }) {
   const [nfts, setNfts] = useState<NFTPortNFT[]>([])
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
            fetch(
               `https://api.opensea.io/api/v1/assets?owner=${account}`,
               {
                  method: 'GET',
                  headers: {
                     Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
                  },
               }
            ).then((res) => res.json()),
         ])
            .then(([polygonData, ethereumData]) => {
               console.log(`✅[GET][NFTs] ${account}:`, polygonData, ethereumData)
               let transformed: NFTPortNFT[] = []
               if (polygonData?.nfts?.length > 0) {
                  transformed = polygonData.nfts
                     .filter((nft: NFTPortNFT) => nft.name || nft.file_url)
                     .map((nft: NFTPortNFT) => ({
                        ...nft,
                        chain_id: '137',
                        file_url: nft.file_url.includes('ipfs://')
                           ? convertIpfsUriToUrl(nft.file_url)
                           : nft.file_url,
                     }))
                  
               }
               if (ethereumData?.assets?.length > 0) {
                transformed = transformed.concat(ethereumData.assets
                   .filter((nft: NFTAssetType) => nft.name || nft.image_url)
                   .map((nft: NFTAssetType) => ({
                      ...nft,
                      contract_address: nft?.asset_contract?.address,
                      chain_id: '1',
                      file_url: nft.image_url.includes('ipfs://')
                         ? convertIpfsUriToUrl(nft.image_url)
                         : nft.image_url,
                   })))
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
        <Heading size="xl" mb={5}>My NFTs</Heading>
         <Flex wrap="wrap" >
            {nfts.map((nft, i) => (
               <Box mb={4} mr={4}>
                  <MyNFTItem key={i} nft={nft} />
               </Box>
            ))}
         </Flex>
         </Box>
      </Box>
   )
}
