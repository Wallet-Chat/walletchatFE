import { url } from "inspector"

export function convertIpfsUriToUrl(uri: string) {
   if (uri.includes('ipfs://')) {
      let parts = uri.split('ipfs://')
      let cid = parts[parts.length - 1]
      return `https://walletchat.infura-ipfs.io/ipfs/${cid}`
   } else if (uri.includes('https://ipfs.io/ipfs')){
      let parts = uri.split('https://ipfs.io/ipfs/')
      let cid = parts[parts.length - 1]
      return `https://walletchat.infura-ipfs.io/ipfs/${cid}`
   } else {
      return uri
   }
}
