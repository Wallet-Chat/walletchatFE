import { default as GeneralNFT } from '../NFT'

export interface Owner {
   address: string
   quantity: number
 }
export default interface OpenSeaNFT {
   nft?: {
      animation_url?: string
      collection?: string
      contract?: string
      creator?: string
      description?: string
      identifier?: string
      image_url?: string
      is_disabled?: string
      is_nsfw?: string
      is_suspicious?: string
      name?: string
      opensea_url?: string
      owners?: Owner[]
      rarity?: string
      token_standard?: string
      traits?: string
      updated_at?: string
   }
}

export function openseaToGeneralNFTType(data: OpenSeaNFT) : GeneralNFT {
   return {
     name: data?.nft?.name,
     image: data?.nft?.image_url,
     description: data?.nft?.description,
     attributes: data?.nft?.traits,
     contract_address: data?.nft?.contract
   }
 }