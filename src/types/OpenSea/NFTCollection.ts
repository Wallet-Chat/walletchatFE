import GeneralNFTCollection from '../NFTCollection'

export default interface OpenSeaNFTCollection {
    collection: {
       banner_image_url?: string
       chat_url?: string
       created_date?: string
       description?: string
       discord_url?: string
       external_url?: string
       safelist_request_status?: string
       image_url: string
       is_subject_to_whitelist?: boolean
       large_image_url?: string
       medium_username?: string
       name: string
       slug?: string
       telegram_url?: string
       twitter_username?: string
       instagram_username?: string
       wiki_url?: string
       is_nsfw?: boolean
    }
    address: string
    total_supply?: string
 }
 
 export function openseaToGeneralNFTCollectionType(data: OpenSeaNFTCollection) : GeneralNFTCollection {
   return {
      name: data?.collection?.name,
      slug: data?.collection?.slug,
      created_date: data?.collection?.created_date,
      description: data?.collection?.description,
   
      image_url: data?.collection?.image_url,
      large_image_url: data?.collection?.large_image_url,
      banner_image_url: data?.collection?.banner_image_url,
   
      chat_url: data?.collection?.chat_url,
      discord_url: data?.collection?.discord_url,
      external_url: data?.collection?.external_url,
      medium_username: data?.collection?.medium_username,
      telegram_url: data?.collection?.telegram_url,
      twitter_username: data?.collection?.twitter_username,
      instagram_username: data?.collection?.instagram_username,
      wiki_url: data?.collection?.wiki_url,
   
      contract_address: data?.address,
      total_supply: data?.total_supply
   }
 }
 