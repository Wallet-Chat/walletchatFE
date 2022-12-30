export function convertIpfsUriToUrl(uri: string) {
   let parts = uri.split('ipfs://')
   let cid = parts[parts.length - 1]
   return `https://walletchat.infura-ipfs.io/ipfs/${cid}`
}

export function convertNearIpfsUriToUrl(cid: string) {
   return `https://walletchat.infura-ipfs.io/ipfs/${cid}`
}
