import Web3 from 'web3'

export const addressIsValid = async (web3: Web3, address: string) => {
   if (web3 != null) {
      return web3.utils.isAddress(address) || address.includes('.eth')
   } else {
      return false
   }
}
