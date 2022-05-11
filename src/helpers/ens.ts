// @ts-ignore
import namehash from '@ensdomains/eth-ens-namehash'
import Web3 from 'web3'

export async function reverseENSLookup(address: string, web3: Web3) {
   let lookup = address.toLowerCase().substring(0, 2) + '.addr.reverse'
   let ResolverContract = await web3.eth.ens.getResolver(lookup)
   console.log("lookup", lookup, address, ResolverContract)
   let nh = namehash.hash(lookup)
   try {
      let name = await ResolverContract.methods.name(nh).call()
      if (name && name.length) {
         const verifiedAddress = await web3.eth.ens.getAddress(name)
         console.log(verifiedAddress,)
         if (
            verifiedAddress &&
            verifiedAddress.toLowerCase() === address.toLowerCase()
         ) {
            return name
         }
      }
   } catch (e) {}
}
