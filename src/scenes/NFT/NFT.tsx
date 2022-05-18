import {
   Box,
   Flex,
   Heading,
   Image,
   Tab,
   TabList,
   TabPanel,
   TabPanels,
   Tabs,
   Text,
} from '@chakra-ui/react'
import { IconExternalLink } from '@tabler/icons'
import { useState } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Blockies from 'react-blockies'

import { truncateAddress } from '../../helpers/truncateString'
import NFTMetadataType from '../../types/NFTMetadata'
import NFTOwnerAddressType from '../../types/NFTOwnerAddressType'
import CommentType from '../../types/Comment'
import styled from 'styled-components'

// const contractAddr = '0x1a92f7381b9f03921564a437210bb9396471050c'
// const tokenId = '878'
const contractAddr = '0x716f29b8972d551294d9e02b3eb0fc1107fbf4aa'
const tokenId = '1484'
const tokenType = 'erc721'


const BlockieWrapper = styled.div`
   border-radius: var(--chakra-radii-md);
   overflow: hidden;
`

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
      <Box background="white" minHeight="100vh" p={5}>
         <Flex alignItems="center">
            {metadata && metadata.image && (
               <Image
                  src={metadata.image}
                  alt=""
                  height="60px"
                  borderRadius="var(--chakra-radii-xl)"
                  mr={3}
               />
            )}
            <Box>
               {metadata && metadata.name && (
                  <Heading size="md">{metadata.name}</Heading>
               )}
               {ownerAddress && (
                  <Box>
                     <Text fontSize="md" color="lightgray.800">
                        Owned by {truncateAddress(ownerAddress)}{' '}
                        <Link
                           to={`https://etherscan.io/address/${ownerAddress}`}
                           target="_blank"
                           style={{
                              display: 'inline-block',
                              verticalAlign: 'middle',
                           }}
                        >
                           <IconExternalLink
                              size={16}
                              color="var(--chakra-colors-lightgray-900)"
                              stroke="1.5"
                           />
                        </Link>
                     </Text>
                  </Box>
               )}
            </Box>
         </Flex>
         <Tabs>
            <TabList>
               <Tab>Chat</Tab>
               <Tab>Comments</Tab>
            </TabList>

            <TabPanels>
               <TabPanel>
                  <p>one!</p>
               </TabPanel>
               <TabPanel>
                  {dummyComments.map((comment: CommentType, i) => (
                      <Box>
                          <Flex alignItems="center">
                          <BlockieWrapper>
                          <Blockies
                           seed={comment.fromAddr.toLocaleLowerCase()}
                           scale={4}
                        />
                        </BlockieWrapper>
                        <Box>
                            <Text>{comment.fromAddr}
                        <Link
                           to={`https://etherscan.io/address/${comment.fromAddr}`}
                           target="_blank"
                           style={{
                              display: 'inline-block',
                              verticalAlign: 'middle',
                           }}
                        >
                           <IconExternalLink
                              size={16}
                              color="var(--chakra-colors-lightgray-900)"
                              stroke="1.5"
                           />
                        </Link>
                        </Text>
                        {comment.timestamp && <Text color="lightgray.700">{comment.timestamp}</Text>}
                        </Box>
                        </Flex>
                        <Text>{comment.message}</Text>
                      </Box>
                  ))}
               </TabPanel>
            </TabPanels>
         </Tabs>
      </Box>
   )
}

const dummyComments: CommentType[] = [
    {
        fromAddr: "0x8999531b12D3577c50D9bEb8E2C1857C7cA62808",
        nftAddr: contractAddr,
        nftId: parseInt(tokenId),
        timestamp: (new Date()).toString(),
        message: "Sed lacus mi, rutrum sed sem sagittis, imperdiet pellentesque purus. Pellentesque mi libero, varius non fermentum sed, bibendum sed metus. Quisque id turpis ut dui posuere luctus."
    },
    {
        fromAddr: "0x19871B6F5f64657d6Bf35C88b628F3d1778db81d",
        nftAddr: contractAddr,
        nftId: parseInt(tokenId),
        timestamp: (new Date()).toString(),
        message: "Proin ac diam ac elit molestie vehicula vitae nec felis."
    },
    {
        fromAddr: "0x91D7A110E0cE462d428F3ac700b4371990735517",
        nftAddr: contractAddr,
        nftId: parseInt(tokenId),
        timestamp: (new Date()).toString(),
        message: "Donec tristique, magna sed sodales eleifend, lectus ligula tempor enim, non porttitor ipsum nibh id odio. Sed lorem nisl, venenatis sed lorem et, euismod porttitor orci. "
    },
    {
        fromAddr: "0xbf9ceF53327Be908CBcFe1D8d217852d44b027de",
        nftAddr: contractAddr,
        nftId: parseInt(tokenId),
        timestamp: (new Date()).toString(),
        message: "Vivamus vel lectus a neque blandit viverra."
    },
    {
        fromAddr: "0x785F375F2B819d875Ce07009a15779E9c3679C1D",
        nftAddr: contractAddr,
        nftId: parseInt(tokenId),
        timestamp: (new Date()).toString(),
        message: "Quisque vitae neque nunc. In hac habitasse platea dictumst. Phasellus gravida fringilla nisl at malesuada. Pellentesque vitae ipsum at elit ultrices facilisis."
    },
]

export default NFT
