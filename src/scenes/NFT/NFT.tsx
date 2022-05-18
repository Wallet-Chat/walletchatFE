import { Box, Image, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useEffect } from 'react'
import NFTMetadataType from '../../types/NFTMetadata'
import NFTOwnerAddressType from '../../types/NFTOwnerAddressType'

// const contractAddr = '0x1a92f7381b9f03921564a437210bb9396471050c'
// const tokenId = '878'
const contractAddr = '0x716f29b8972d551294d9e02b3eb0fc1107fbf4aa'
const tokenId = '1484'
const tokenType = 'erc721'


const NFT = () => {
   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [ownerAddress, setOwnerAddress] = useState<string>()

   const { metadata } = nftData || {}

   const getNftMetadata = () => {
      const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}/getNFTMetadata`
      const fetchURL = `${baseURL}?contractAddress=${contractAddr}&tokenId=${tokenId}&tokenType=${tokenType}`

      fetch(fetchURL, {
         method: 'GET',
      })
         .then((response) => response.json())
         .then((result: NFTMetadataType) => {
            console.log(
               '[GET][NFT data]:',
               result,
               JSON.stringify(result, null, 2)
            )
            setNftData(result)
         })
         .catch((error) => console.log('error', error))
   }

   const getOwnerAddress = () => {
      const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}/getOwnersForToken`

      const fetchURL = `${baseURL}?contractAddress=${contractAddr}&tokenId=${tokenId}&tokenType=${tokenType}`

      fetch(fetchURL, {
         method: 'GET',
      })
         .then((response) => response.json())
         .then((result: NFTOwnerAddressType) => {
            console.log(
               '[GET][NFT Owner Address]:',
               result,
               JSON.stringify(result, null, 2)
            )
            setOwnerAddress(result.owners[0])
         })
         .catch((error) => console.log('error', error))
   }

   useEffect(() => {
      getNftMetadata()
      getOwnerAddress()
   }, [])

   console.log(nftData)

   return (
      <Box>
         {metadata && (
            <>
               {metadata.image && <Image src={metadata.image} alt="" />}
               {metadata.name && <Text>{metadata.name}</Text>}
            </>
         )}
      </Box>
   )
}

export default NFT
