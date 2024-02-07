import GeneralNFTCollection from '../NFTCollection'

export default interface OpenSeaNFTCollection {
    name: string
    chain: string
    collection: string
    contract_standard: string
    address: string
    total_supply?: string
 }
 
 export function openseaToGeneralNFTCollectionType(data: OpenSeaNFTCollection) : GeneralNFTCollection {
   return {
      name: data?.name,
      chain: data?.chain,
      collection: data?.collection,
      contract_standard: data?.contract_standard,
      address: data?.address,
      total_supply: data?.total_supply
   }
 }
 