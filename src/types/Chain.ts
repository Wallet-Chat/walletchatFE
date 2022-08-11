export default interface ChainType {
    symbol: string
    name: string
    chainId?: number
    logo?: string
    block_explorer_url?: string
  }
 
  export interface ChainObjectType {
    [chainId: string]: ChainType
  }