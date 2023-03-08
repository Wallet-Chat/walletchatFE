export function getContractAddressAndNFTId(url: string) {
  const urlWithoutProtocol = url.replace('https://', '').replace('http://', '')
  const parts = urlWithoutProtocol.split('/')
  const length = parts.length

  // Assuming url..../0x....../12345, the itemId will always come last,
  // and the contract address will always come before that
  const itemId = parts[length - 1]
  const contractAddress = parts[length - 2]

  if (url.startsWith('looksrare.org')) {
    return { itemId, contractAddress, chain: 'ethereum' } 
  }

  const network = parts[length - 3]

  if (length >= 4) {
    return { itemId, contractAddress, network }
  }

  if (url.startsWith('x2y2.io')) {
    if (network === 'eth') {
      return { itemId, contractAddress, network: 'ethereum' }
    }
  }

  return {}
}
