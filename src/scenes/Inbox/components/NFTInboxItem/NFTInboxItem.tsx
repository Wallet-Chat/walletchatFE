import { Box } from '@chakra-ui/react'
import { useEffect } from 'react'

const NFTInboxItem = ({ nftAddr }: { nftAddr: string }) => {
   useEffect(() => {
      if (nftAddr) {
         const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}/getNFTsForCollection`
         const fetchURL = `${baseURL}?contractAddress=${nftAddr}}&limit=1&withMetadata=true`

         fetch(fetchURL, {
            method: 'GET',
         })
            .then((response) => response.json())
            .then((result) => {
               console.log('✅[GET][NFT data]:', result)
               //    setNftData(result)
            })
            .catch((error) => console.log('error', error))
      }
   }, [nftAddr])
   return <Box>{nftAddr}</Box>
}

export default NFTInboxItem
