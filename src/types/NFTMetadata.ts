export default interface NFTMetadataType {
   contract: {
      address: string
   }
   id: {
      tokenId: string
      tokenMetadata: {
         tokenType: string
      }
   }
   title: string
   description: string
   tokenUri: {
      raw: string
      gateway: string
   }
   media: [
      {
         uri: [Object]
      }
   ]
   metadata: {
      image: string
      name: string
      description: string
      external_url: string
      google_image: string
      ipfs_image: string
   }
   timeLastUpdated: string
}
