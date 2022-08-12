import { Box, Button, Image, Text, Link, Flex, Tooltip } from '@chakra-ui/react'
import { IconArrowNarrowRight } from '@tabler/icons'
import { Link as RLink } from 'react-router-dom'
import { truncateAddress } from '../../../../../../helpers/truncateString'
import NFTPortNFT from '../../../../../../types/NFTPortNFT'
import IconEtherscan from '../../../../../../images/icon-etherscan-mono.svg'
import { chains } from '../../../../../../constants'

export default function MyNFTItem({ nft }: { nft: NFTPortNFT }) {
   const chain = chains[nft.chain_id]
   const blockExplorerUrl = nft.chain_id && chain?.block_explorer_url
   const chainLogo = chain?.logo
   const chainName = chain?.name

   return (
      <Flex
         alignItems="center"
         border="1px"
         borderColor="lightgray.400"
         borderRadius="md"
         width="300px"
         maxW="100%"
      >
         {nft.file_url ? (
            <Image
               src={`${nft.file_url}`}
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
         <Box p={3} overflow="hidden">
            <Text fontSize="md" fontWeight="bold" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
               {nft.name}
            </Text>
            <Box mb={2}>
               {nft.chain_id && (
                  <Link
                     href={`${blockExplorerUrl}${nft.contract_address}`}
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
                           src={IconEtherscan}
                           width="15px"
                           height="15px"
                           mr={1}
                           alt=""
                        />
                        <Box verticalAlign="middle" fontSize="sm">
                           {truncateAddress(nft.contract_address)}
                        </Box>
                     </Flex>
                  </Link>
               )}
            </Box>
            {chain?.slug && (
               <RLink
                  to={`/nft/${chain.slug}/${nft.contract_address}`}
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
