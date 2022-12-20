import { default as GeneralNFT } from '../NFT'

export default interface TzktNFT {
   id: number;
   account: Account;
   token: Token;
   balance: string;
   transfersCount: number;
   firstLevel: number;
   firstTime: Date;
   lastLevel: number;
   lastTime: Date;
}

// export default interface TzktNFTResponse {
//    nfts: Array<TzktNFT>
// }

export interface Account {
      address: string;
}

export interface Contract {
      address: string;
}

export interface Shares {
      address: string;
}

export interface Royalties {
      shares: Shares;
      decimals: string;
}

export interface Metadata {
      name: string;
      image: string;
      rights: string;
      symbol: string;
      formats: any[];
      creators: string[];
      decimals: string;
      royalties: Royalties;
      attributes: any[];
      displayUri: string;
      artifactUri: string;
      description: string;
      thumbnailUri: string;
      isBooleanAmount: boolean;
      shouldPreferSymbol: boolean;
}

export interface Token {
      id: number;
      contract: Contract;
      tokenId: string;
      standard: string;
      totalSupply: string;
      metadata: Metadata;
}

export function tezosTztkToGeneralNFTType(data: TzktNFT) : GeneralNFT {
   return {
     name: data?.token.metadata.name,
     image: data?.token?.metadata?.displayUri || data?.token.metadata?.image,
     description: data?.token.metadata?.description,
     token_id: data?.token.tokenId,
     attributes: data?.token.metadata?.attributes,
     collection: {
      name: data?.token?.metadata.name,
      image: data?.token?.metadata.displayUri || data?.token?.metadata?.image,
      contract_address: data?.token.contract.address
     }
   }
 }

