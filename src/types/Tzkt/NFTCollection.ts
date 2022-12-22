import GeneralNFTCollection from '../NFTCollection'
import TzktNFT from "./NFT"

export default interface TzktNFTCollection {
      nfts?: Array <{nft: TzktNFT}>
 }
 
 export function tzktToGeneralNFTCollectionType(data: TzktNFT) : GeneralNFTCollection {
   return {
      name: data?.token.metadata.name,
      // slug: data?.collection?.slug,
      // created_date: data?.collection?.created_date,
      description: data?.token.metadata.description,
   
      image_url: data?.token?.metadata?.displayUri || data?.token.metadata?.image,
      // large_image_url: data?.collection?.large_image_url,
      // banner_image_url: data?.collection?.banner_image_url,
   
      // chat_url: data?.collection?.chat_url,
      // discord_url: data?.collection?.discord_url,
      // external_url: data?.collection?.external_url,
      // medium_username: data?.collection?.medium_username,
      // telegram_url: data?.collection?.telegram_url,
      // twitter_username: data?.collection?.twitter_username,
      // instagram_username: data?.collection?.instagram_username,
      // wiki_url: data?.collection?.wiki_url,
   
      contract_address: data?.token.contract.address,
      total_supply: data?.token.totalSupply
   }
 }
 