import { Box,Flex, Heading, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import equal from 'fast-deep-equal/es6'

import { convertIpfsUriToUrl, convertNearIpfsUriToUrl } from '../../../../helpers/ipfs'
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
import ChainFilters from '../../../../components/ChainFilters'
import MyNFTSkeleton from './components/MyNFTSkeleton'
import TzktNFT from '../../../../types/Tzkt/NFT'
import { NearContractNftSearch, NearNftContracts, NftCount, ReferenceJSON } from '../../../../types/NEAR/NFT'
import NearNFT from '../../../../types/NEAR/NFT'
import { tezosTztkToGeneralNFTType } from '../../../../types/Tzkt/NFT'
import { nearPagodaToGeneralNFTType } from '../../../../types/NEAR/NFT'
import NFTPortNFTCollection from '../../../../types/NFTPort/NFTCollection'

export default function MyNFTs({ account }: { account: string }) {
   // NFTs
   const [nfts, setNfts] = useState<NFT[]>([])
   const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
   const [isFetchingNFTs, setIsFetchingNFTs] = useState(true)

   // POAPs
   const [poaps, setPoaps] = useState<POAP[]>([])
   const [filteredPoaps, setFilteredPoaps] = useState<POAP[]>([])
   const [isFetchingPOAPs, setIsFetchingPOAPs] = useState(false)

   // Filters
   const [chainFilters, setChainFilters] = useState<Array<string>>([''])

   //this is to fetch individual NFT data, maybe not needed since we don't do this for other blockchains yet
   const fetchNearNFT = async (contract: string) => {
      if (!process.env.REACT_APP_PAGODA_API_KEY) {
         console.log('Missing PAGODA API key')
         return
      } else { console.log ("testing kevin: ", process.env.REACT_APP_PAGODA_API_KEY) }
      try {
         const nearData = await fetch(`https://near-mainnet.api.pagoda.co/eapi/v1/accounts/${account}/NFT/${contract}`, {
            method: 'GET',
            headers: {
               accept: 'application/json',
               'X-API-Key': process.env.REACT_APP_PAGODA_API_KEY,
            }
         })
         const nearDataJSON = await nearData.json()
         console.log(`✅[GET][NEAR NFT by contract] ${account} ${contract}:`, nearDataJSON)
         let contractSearchData: NearContractNftSearch = nearDataJSON
         //console.log(`[contractSearchData] ${account} ${contract}:`, contractSearchData)       
         let transformed: NFT[] = []
         if (contractSearchData.nfts.length > 0) {          
               let nftDataForDisplay = contractSearchData.nfts
                  .filter((nft: NearNFT) => nft.metadata?.title || "")
                  .map(async (nft: NearNFT) => {
                     const _nft = nearPagodaToGeneralNFTType(nft)
                     if (_nft.collection?.contract_address) { _nft.collection.contract_address = contract }
                     if (_nft.collection?.image) { _nft.collection.image = contractSearchData.contract_metadata.icon }
                     //if (_nft?.image && contractSearchData.contract_metadata.icon.startsWith("data")) { _nft.image = contractSearchData.contract_metadata.icon }
                     
                     //NEAR NFTs have collection details in an IPFS json blob (but some just have a filename with no reference...)
                     if (nft.metadata.reference && !nft.metadata.reference.includes(".")) {
                        await fetch(convertNearIpfsUriToUrl(nft.metadata.reference), {
                           method: 'GET',
                           }).then((res) => res.json())
                           .then((collectionData) => {
                              console.log(`✅[GET][NEAR NFT collection details] ${account} ${contract}:`, collectionData)

                              let collectionDetails: ReferenceJSON = collectionData
                              if (_nft.collection?.name) { _nft.collection.name = collectionDetails.collection}
                              if (_nft.description) { _nft.description = collectionDetails.description}
                           })
                     }
                     
                     return {
                        ..._nft,
                        chain_id: 'NEAR',
                        //NEAR has some SVGs returned as part of the data - need to test
                        image: _nft?.image ? _nft.image.startsWith("data") ? _nft.image : convertNearIpfsUriToUrl(_nft.image) : ""
                     }
                  })
                  transformed = transformed.concat(await Promise.all(nftDataForDisplay))
         }
         console.log(`[transformed] ${account} ${contract}:`, transformed)
         setNfts(nfts => [...nfts, ...transformed])
         setIsFetchingNFTs(false)
         }
         catch (e) { console.log(`🚨[GET][NEAR NFT by contract] ${account} ${contract}`, e)}
   }

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

         if (account.startsWith("tz")) {
            await Promise.all([
               fetch(
                  `https://api.tzkt.io/v1/tokens/balances?account=${account}`,
                  {
                     method: 'GET',
                     headers: {
                        //Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
                     },
                  }
               ).then((res) => res.json()),
            ])
               .then(tezosData => {
                  console.log(
                     `✅[GET][Tezos NFTs] ${account}:`,
                     tezosData
                  )
                  let transformed: NFT[] = []
                  if (tezosData?.length > 0) {
                     transformed = transformed.concat(
                        tezosData[0]
                           .filter((nft: TzktNFT) => nft.token.metadata.name || nft.token.metadata.displayUri)
                           .map((nft: TzktNFT) => {
                              const _nft = tezosTztkToGeneralNFTType(nft)
                              //Tezos Domains has no image metata, at least none from TzKT.io
                              if (_nft.collection && _nft.collection.contract_address == "KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS"){
                                 _nft.image = "https://walletchat-pfp-storage.sgp1.digitaloceanspaces.com/TezosDomains.png"
                              }
                              return {
                                 ..._nft,
                                 chain_id: 'tezos',
                                 image: _nft?.image?.includes('ipfs://')
                              ? convertIpfsUriToUrl(_nft.image)
                              : _nft.image,
                              }
                           })
                     )
                  }
                  setNfts(transformed)
               })
               .finally(() => {
                  setIsFetchingNFTs(false)
               })
               .catch((error) => console.log(`🚨[GET][Tezos NFTs] ${account}`, error))
         } else if (account.endsWith(".near") || account.endsWith(".testnet")) {
            if (!process.env.REACT_APP_PAGODA_API_KEY) {
               console.log('Missing PAGODA API key')
               return
            } else { console.log ("testing kevin: ", process.env.REACT_APP_PAGODA_API_KEY) }
            //when using Pagoda, we first just get a count of NFTs per contract (NearNftContracts type)
            let ownedNftContracts: string[] = [];
            await Promise.all([
               fetch(`https://near-mainnet.api.pagoda.co/eapi/v1/accounts/${account}/NFT`, {
                  method: 'GET',
                  headers: {
                   accept: 'application/json',
                   'X-API-Key': process.env.REACT_APP_PAGODA_API_KEY,
                }}).then((res) => res.json()),
            ])
               .then((returnedNftContracts) => {
                  console.log(`✅[GET][NEAR NFTs] ${account}:`, returnedNftContracts)
                  let transformed: NearNftContracts[] = []
                  if (returnedNftContracts?.length > 0) {
                     transformed = 
                     returnedNftContracts
                        .filter((contracts: NearNftContracts) => contracts.nft_counts
                        .map((count: NftCount) => {
                           const _contract = count.contract_account_id
                           return {
                              _contract,
                           }
                        })
                     )
                  }
                  //console.log("transformed: ", transformed)
                  for (let i=0; i<transformed[0].nft_counts.length; i++) {
                     ownedNftContracts.push(transformed[0].nft_counts[i].contract_account_id)
                  }
               })
               .finally(() => {
                  setIsFetchingNFTs(false)
               })
               .catch((error) => console.log(`🚨[GET][NEAR NFTs] ${account}`, error))

               setNfts([])
               console.log(`***[FETCH][NEAR NFTs for each owned NFT] ${account}`)
               ownedNftContracts.forEach(await fetchNearNFT)
         } else {
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
            .finally(() => {
               setIsFetchingNFTs(false)
            })
            .catch((error) => console.log(`🚨[GET][NFTs] ${account}`, error))
         }
            
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

         fetch(`https://api.poap.tech/actions/scan/${account}`, {
            method: 'GET',
            headers: {
               accept: 'application/json',
               'X-API-Key': process.env.REACT_APP_POAP_API_KEY,
            },
         })
            .then((response) => response.json())
            .then((result) => {
               console.log(`✅[GET][POAPs] ${account}:`, result)
               
               if (result.statusCode != 400){
                  setPoaps(result)
               }
            })
            .finally(() => {
               setIsFetchingPOAPs(false)
            })
            .catch((error) => console.log(error))
      }
      fetchAllNfts()
      if (!account.endsWith(".near") && !account.endsWith(".testnet") && !account.startsWith("tz")) {
         fetchPoaps()
      }
   }, [account])

   useEffect(() => {

      if (chainFilters.length === 0) {
         setNfts([])
      } else if (
         chainFilters.includes('') ||
         chainFilters.length === Object.keys(chains).length
      ) {
         if (!equal(nfts, filteredNfts)) setFilteredNfts(nfts)
         if (!equal(poaps, filteredPoaps)) setFilteredPoaps(poaps)
      } else if (chainFilters.length > 0) {
         const _newFilteredNfts = nfts.filter(
            (d) => d?.chain_id && chainFilters.includes(d.chain_id)
         )
         if (!equal(_newFilteredNfts, filteredNfts))
            setFilteredNfts(_newFilteredNfts)

         const _allowedChainNames = chainFilters.map((c) => chains[c]?.slug)

         if (poaps != null) {
            const _newFilteredPoaps = poaps.filter(
               (d) => d?.chain && _allowedChainNames.includes(d.chain)
            )
            if (!equal(_newFilteredPoaps, filteredPoaps))
               setFilteredPoaps(_newFilteredPoaps)
         }
      } else {
         setNfts([])
         setPoaps([])
      }
   }, [chainFilters, nfts, poaps])

   return (
      <Box
         overflowY="auto"
         className="custom-scrollbar"
      >
         <Box px={4} background="white">
            <Box mt={2}>
            <ChainFilters
               chainFilters={chainFilters}
               setChainFilters={setChainFilters}
            />
            </Box>
            <Flex wrap="wrap">
               {(isFetchingNFTs || isFetchingPOAPs) && (
                  <MyNFTSkeleton />
               )}
               {filteredPoaps.length === 0 && filteredNfts.length === 0 && !isFetchingNFTs && (
                  <Box textAlign="center" d="block" m="auto" p={5}>
                     <Text color="darkgray.100" fontSize="md">No NFTs found</Text>
                  </Box>
               )}
               {filteredPoaps.length > 0 && filteredPoaps.map((poap, i) => (
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
