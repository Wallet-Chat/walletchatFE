import { default as GeneralNFT } from '../NFT'

export default interface NFTPortNFTResponse {
   contract: {
      metadata: {
         banner_url: string
         cached_banner_url: string
         cached_thumbnail_url: string
         description: string
         thumbnail_url: string
      }
      name: string
      symbol: string
      type: string
   }
   nft?: NFTPortNFT
   nfts?: Array<NFTPortNFT>
   owner: string
}

export interface NFTPortNFT {
   name: string
   animation_url?: string | null
   cached_animation_url?: string | null
   cached_file_url?: string | null
   chain?: string
   contract_address?: string
   creator_address?: string
   file_url?: string | null
   metadata?: {
      attributes: Array<{
         trait_type: string
         value: string
      }>
      description: string
      google_image: string
      image: string
      ipfs_image: string
      name: string
   }
   metadata_url?: string
   mint_date?: string
   token_id?: string
   chain_id?: string
   updated_date?: string
}

export function nftPortToGeneralNFTType(data: NFTPortNFT) : GeneralNFT {
   return {
     name: data?.name,
     image: data?.metadata?.image,
     description: data?.metadata?.description,
     token_id: data?.token_id,
     attributes: data?.metadata?.attributes,
     collection: {
      name: data?.name,
      image: data?.metadata?.image,
      contract_address: data?.contract_address
     }
   }
 }