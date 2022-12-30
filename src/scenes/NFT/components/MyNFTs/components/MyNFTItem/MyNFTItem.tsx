import { Box, Button, Image, Text, Link, Flex, Tooltip } from '@chakra-ui/react'
import { IconArrowNarrowRight } from '@tabler/icons'
import { Link as RLink } from 'react-router-dom'
import { truncateAddress } from '../../../../../../helpers/truncateString'
import NFT from '../../../../../../types/NFT'
import IconEtherscan from '../../../../../../images/icon-products/icon-etherscan-mono.svg'
import IconTzkt from '../../../../../../images/icon-products/icon-tzkt.png'
import IconNEAR from '../../../../../../images/icon-chains/icon-near.svg'
import { chains } from '../../../../../../constants'

export default function MyNFTItem({ nft }: { nft: NFT }) {
   let chain, blockExplorerUrl, chainLogo, chainName, explorerLogo
   if (nft?.chain_id) {
      chain = chains[nft.chain_id]
      blockExplorerUrl = nft.chain_id && chain?.block_explorer_url
      chainLogo = chain?.logo
      chainName = chain?.name
   }
   if (chainName == "Tezos") {
      explorerLogo = IconTzkt
   } else if (chainName == "NEAR") {
      explorerLogo = IconNEAR
   } else {
      explorerLogo = IconEtherscan
   }

   return (
      <Flex
         alignItems="center"
         border="1px"
         borderColor="lightgray.400"
         borderRadius="md"
         width="300px"
         maxW="100%"
      >
         {nft?.image ? (
            <Image
               src={`${nft.image}`}
               alt=""
               width="100px"
               maxW="100%"
               maxH="100px"
               fit="cover"
               borderRadius="md"
               fallback={
                  <Box
                     background="lightgray.400"
                     width="100px"
                     height="100px"
                  ></Box>
               }
            />
         ) : (
            <Box
               background="lightgray.400"
               width="100px"
               height="100px"
               flex="0 0 100px"
            ></Box>
         )}
         <Box p={3} overflow="hidden" width="100%">
            <Text
               fontSize="md"
               fontWeight="bold"
               textOverflow="ellipsis"
               whiteSpace="nowrap"
               overflow="hidden"
            >
               {nft.name}
            </Text>
            <Box mb={2}>
               {nft.chain_id && nft?.collection?.contract_address && (
                  <Link
                     href={`${blockExplorerUrl}${nft.collection.contract_address}`}
                     target="_blank"
                  >
                     <Flex alignItems="center">
                        {chainLogo && (
                           <Tooltip label={`${chainName} chain`}>
                              <Image
                                 verticalAlign="middle"
                                 src={`data:image/svg+xml;base64,${chainLogo}`}
                                 width="15px"
                                 height="15px"
                                 mr={1}
                                 alt=""
                              />
                           </Tooltip>
                        )}
                        <Image
                           verticalAlign="middle"
                           src={explorerLogo}
                           width="15px"
                           height="15px"
                           mr={1}
                           alt=""
                        />
                        <Box verticalAlign="middle" fontSize="sm">
                           {nft?.collection?.contract_address &&
                              truncateAddress(nft.collection.contract_address)}
                        </Box>
                     </Flex>
                  </Link>
               )}
            </Box>
            {chain?.slug && nft?.collection?.contract_address && (
               <RLink
                  to={`/nft/${chain.slug}/${nft.collection.contract_address}`}
                  style={{ textDecoration: 'none' }}
               >
                  <Button variant="outline" size="sm" width="100%">
                     Community <IconArrowNarrowRight stroke="1.5" />
                  </Button>
               </RLink>
            )}
         </Box>
      </Flex>
   )
}
