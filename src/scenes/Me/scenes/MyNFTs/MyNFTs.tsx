import { Box, Button, Flex, Heading, Image, Spinner } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import equal from 'fast-deep-equal/es6'

import { convertIpfsUriToUrl } from '../../../../helpers/ipfs'
import MyNFTItem from './components/MyNFTItem'
import { NFTPortNFT } from '../../../../types/NFTPort/NFT'
import OpenSeaNFT, {
   openseaToGeneralNFTType,
} from '../../../../types/OpenSea/NFT'
import NFT from '../../../../types/NFT'
import { nftPortToGeneralNFTType } from '../../../../types/NFTPort/NFT'
import POAP from '../../../../types/POAP/POAP'
import MyNFTPOAP from './components/MyNFTPOAP'
import { chains } from '../../../../constants'


export default function MyNFTs({ account }: { account: string }) {
   const [nfts, setNfts] = useState<NFT[]>([])
   const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
   const [poaps, setPoaps] = useState<POAP[]>([])
   const [filteredPoaps, setFilteredPoaps] = useState<POAP[]>([])
   const [isFetchingNFTs, setIsFetchingNFTs] = useState(true)
   const [isFetchingPOAPs, setIsFetchingPOAPs] = useState(true)
   const [chainsFilter, setChainsFilter] = useState([''])
   

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

         if (!isFetchingNFTs) setIsFetchingNFTs(true)

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
               setIsFetchingNFTs(false)
            })
      }
      const fetchPoaps = async () => {
         if (process.env.REACT_APP_POAP_API_KEY === undefined) {
            console.log('Missing POAP API Key')
            return
         }
         if (!account) {
            console.log('No account connected')
            return
         }

         setIsFetchingPOAPs(true)

         fetch(
            `https://api.poap.tech/actions/scan/${account}`,
            {
               method: 'GET',
               headers: {
                  Authorization: process.env.REACT_APP_POAP_API_KEY,
               },
            }
         )
            .then((response) => response.json())
            .then((result: POAP[]) => {
               console.log(`✅[GET][POAPs] ${account}:`, result)
               setPoaps(result)
            })
            .then(() => {
               setIsFetchingPOAPs(false)
            })
            .catch((error) => console.log(error))
      }
      fetchAllNfts()
      fetchPoaps()
   }, [account])

   useEffect(() => {
      console.log('chainsFilter', chainsFilter)
      if (chainsFilter.length === 0) {
         setNfts([])
      } else if (
         chainsFilter.includes('') ||
         chainsFilter.length === Object.keys(chains).length
      ) {
         if (!equal(nfts, filteredNfts)) setFilteredNfts(nfts)
         if (!equal(poaps, filteredPoaps)) setFilteredPoaps(poaps)
      } else if (chainsFilter.length > 0) {
         const _allowedChainIds = Object.keys(chains)
         const _newNfts = nfts.filter(
            (d) =>
               d?.chain_id &&
               _allowedChainIds.includes(d.chain_id)
         )
         setFilteredNfts(_newNfts)

         const _allowedChainNames = _allowedChainIds.map((c) => chains[c]?.name)
         if (!equal(_newNfts, nfts)) setNfts(_newNfts)
         const _newPoaps = poaps.filter(
            (d) =>
               d?.chain &&
               _allowedChainNames.includes(d.chain)
         )
         setFilteredPoaps(_newPoaps)
         if (!equal(_newPoaps, poaps)) setPoaps(_newPoaps)
      } else {
         setNfts([])
         setPoaps([])
      }
   }, [chainsFilter, nfts, poaps])

   const toggleChain = (chain: string) => {
      if (chain === '') {
         if (chainsFilter.length > 1) setChainsFilter([''])
         else if (chainsFilter.length === 1 && chainsFilter[0] !== '')
            setChainsFilter([''])
      } else {
         const index = chainsFilter.indexOf(chain)
         if (index > -1) {
            // item found
            let newChainsFilter = chainsFilter
            newChainsFilter.splice(index, 1)
            setChainsFilter(newChainsFilter)
         } else {
            if (chainsFilter[0] === '') {
               setChainsFilter([chain])
            } else {
               setChainsFilter([...chainsFilter, chain])
            }
         }
      }
   }

   if (isFetchingNFTs || isFetchingPOAPs) {
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
            <Box px={5} my={2}>
                     <Button
                        size="sm"
                        height="auto"
                        py={1}
                        px={3}
                        onClick={() => toggleChain('')}
                        variant={chainsFilter[0] === '' ? 'lightgray' : 'white'}
                        opacity={chainsFilter[0] === '' ? '1' : '0.7'}
                        mr={2}
                     >
                        All
                     </Button>
                     {Object.keys(chains).map((chain) => {
                        const _selected =
                           chainsFilter.includes(chain) ||
                           chainsFilter[0] === ''
                        return (
                           <Button
                              key={chain}
                              size="sm"
                              height="auto"
                              py={1}
                              px={3}
                              onClick={() => toggleChain(chain)}
                              variant={_selected ? 'lightgray' : 'white'}
                              opacity={_selected ? '1' : '0.9'}
                              mr={2}
                           >
                              {chains[chain]?.logo && (
                                 <Image
                                    src={`data:image/svg+xml;base64,${chains[chain]?.logo}`}
                                    alt=""
                                    width="15px"
                                    height="15px"
                                    d="inline-block"
                                    verticalAlign="middle"
                                    mr={1}
                                    filter={
                                       _selected ? 'none' : 'grayscale(100%)'
                                    }
                                 />
                              )}
                              {chains[chain]?.name}
                           </Button>
                        )
                     })}
                  </Box>
            <Flex wrap="wrap">
               {filteredPoaps.map((poap, i) => (
                  <Box mb={4} mr={4} key={i}>
                     <MyNFTPOAP key={i} poap={poap} />
                  </Box>
               ))}
               {filteredNfts.map((nft, i) => (
                  <Box mb={4} mr={4} key={i}>
                     <MyNFTItem key={i} nft={nft} />
                  </Box>
               ))}
            </Flex>
         </Box>
      </Box>
   )
}
