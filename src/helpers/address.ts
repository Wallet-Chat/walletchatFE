import Web3 from 'web3'

export const addressIsValid = async (web3: Web3, address: string) => {
   if (web3 != null) {
   return web3.utils.isAddress(address) || address.includes('.eth')
   } else {
      return true //TODO we should do some more validation on other types
   }
}
export const getWalletChain = (address: string) => {
   if (address.includes(".near") || address.includes(".testnet") || 
       (address.length == 64 && !address.includes('0x'))) {
      return "near"
   } else if (address.includes(".eth") || address.startsWith("0x")) {
      return "ethereum"
   } else if (address.startsWith("tz") || address.endsWith(".tez")) {
      return "tezos"
   }
   else {
      return "ethereum" 
   }
}
