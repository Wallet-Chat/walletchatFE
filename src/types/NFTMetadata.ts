// NFT Port API

export default interface NFTMetadataType {
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
   nft?: {
      animation_url: string | null
      cached_animation_url: string | null
      cached_file_url: string | null
      chain: string
      contract_address: string
      file_url: string | null
      metadata: {
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
      metadata_url: string
      mint_date: string
      token_id: string
      updated_date: string
   }
   owner: string
}

// Alchemy API

// export default interface NFTMetadataType {
//    contract: {
//       address: string
//    }
//    id: {
//       tokenId: string
//       tokenMetadata: {
//          tokenType: string
//       }
//    }
//    title: string
//    description: string
//    tokenUri: {
//       raw: string
//       gateway: string
//    }
//    media: [
//       {
//          uri: [Object]
//       }
//    ]
//    metadata: {
//       image: string
//       name: string
//       description: string
//       external_url: string
//       google_image: string
//       ipfs_image: string
//    }
//    timeLastUpdated: string
// }
