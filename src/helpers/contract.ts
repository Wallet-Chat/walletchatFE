export function getContractAddressAndNFTId (url: string) {
    if (url.includes("opensea.io")) {
        let parts = url.split("/")
        let length = parts.length
        if (length >= 5) {
            if (parts[length - 3] === 'ethereum') {
                return [parts[length - 2], parts[length - 1], "ethereum"]
            } else if (parts[length - 3] === 'polygon') {
                return [parts[length - 2], parts[length - 1], "polygon"]
            }
        }
    } else if (url.includes("looksrare.org")) {
        let parts = url.split("/")
        let length = parts.length
        if (length >= 4) {
            return [parts[length - 2], parts[length - 1], "ethereum"]
        }
    } else if (url.includes("x2y2.io")) {
        let parts = url.split("/")
        let length = parts.length
        if (length >= 4) {
            if (parts[length - 3] === 'eth') {
                return [parts[length - 2], parts[length - 1], "ethereum"]
            }
        }
    }
    else if (url.includes("eth-global2022")) {
        let parts = url.split("/")
        let length = parts.length
        if (length >= 5) {
            if (parts[length - 3] === 'ethereum') {
                return [parts[length - 2], parts[length - 1], "ethereum"]
            } else if (parts[length - 3] === 'polygon') {
                return [parts[length - 2], parts[length - 1], "polygon"]
            }
        }
    }
    return [null, null]
}