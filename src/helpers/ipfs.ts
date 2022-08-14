export function convertIpfsUriToUrl(uri: string) {
   let parts = uri.split('ipfs://')
   let cid = parts[parts.length - 1]
   return `https://ipfs.io/ipfs/${cid}`
}
