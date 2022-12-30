import { default as GeneralNFT } from '../NFT'

export default interface NearNFT {
      token_id: string;
      owner_account_id: string;
      metadata: Metadata;
}

export interface Metadata {
      title: string;
      description?: any;
      media: string;
      media_hash?: any;
      copies: number;
      extra?: any;
      reference: string;
      reference_hash?: any;
}

export interface NearContractNftSearch {
      nfts: NearNFT[];
      contract_metadata: ContractMetadata;
      block_timestamp_nanos: string;
      block_height: string;
}

export interface ReferenceJSON {
      description: string;
      collection: string;
      collection_id: string;
      creator_id: string;
      attributes: any[];
      mime_type: string;
  }

//get NFTs by accountID gets you just the summary by contract on Pagoda (first query top level result)
//https://near-mainnet.api.pagoda.co/eapi/v1/accounts/{account_id}/NFT/
export interface NearNftContracts {
      nft_counts: NftCount[];
      block_timestamp_nanos: string;
      block_height: string;
}

export interface ContractMetadata {
      spec: string;
      name: string;
      symbol: string;
      icon: string;
      base_uri: string;
      reference?: any;
      reference_hash?: any;
}

export interface NftCount {
      contract_account_id: string;
      nft_count: number;
      last_updated_at_timestamp_nanos: string;
      contract_metadata: ContractMetadata;
}


export function nearPagodaToGeneralNFTType(data: NearNFT) : GeneralNFT {
   return {
     name: data?.metadata?.title,
     image: data?.metadata?.media,
     description: data?.metadata?.description,
     token_id: data?.token_id,
//      attributes: data?.token.metadata?.attributes,
     collection: {
      name: data?.metadata?.title,
      image: data?.metadata?.media, //placeholder needs fixing
      contract_address: data?.owner_account_id, //placeholder
     }
   }
 }

