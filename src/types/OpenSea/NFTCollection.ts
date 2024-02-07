import GeneralNFTCollection from '../NFTCollection'

export default interface OpenSeaNFTCollection {
    name: string
    collection: string
    description?: string
    image_url?: string
    banner_image_url?: string
    owner?: string
    safelist_status?: string
    category?: string
    is_disabled?: string
    is_nsfw?: string
    trait_offers_enabled?: string
    collection_offers_enabled?: string
    opensea_url?: string
    wiki_url?: string
    discord_url?: string
    telegram_url?: string
    twitter_username?: string
    instagram_username?: string
 }
 
 export function openseaToGeneralNFTCollectionType(data: OpenSeaNFTCollection) : GeneralNFTCollection {
   return {
      name: data?.name,
      description: data?.description,
      image_url: data?.image_url,
      banner_image_url: data?.banner_image_url,
      owner: data?.owner,
      safelist_status: data?.safelist_status,
      category: data?.category,
      is_disabled: data?.is_disabled,
      is_nsfw: data?.is_nsfw,
      trait_offers_enabled: data?.trait_offers_enabled,
      collection_offers_enabled: data?.collection_offers_enabled,
      opensea_url: data?.opensea_url,
      discord_url: data?.discord_url,
      telegram_url: data?.telegram_url,
      twitter_username: data?.twitter_username,
      instagram_username: data?.instagram_username,
   }
 }
 