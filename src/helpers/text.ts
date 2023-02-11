import Web3 from 'web3'

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export const addressIsValid = async (web3: Web3, address: string) => {
	return web3.utils.isAddress(address) || address.includes('.eth')
}

export function slugify(text: string) {
	return text
		.toString() // Cast to string (optional)
		.normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
		.toLowerCase() // Convert the string to lowercase letters
		.trim() // Remove whitespace from both sides of a string (optional)
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\_/g, '-') // Replace _ with -
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/\-$/g, '') // Remove trailing -
}

export function truncateString(str: string, num: number) {
	if (str.length <= num) {
		return str
	}
	return str.slice(0, num) + '...'
}

export function truncateAddress(str: string | undefined | null) {
	if (str === undefined || str === null) return str
	if (str.length <= 12) {
		return str
	}
	return str.slice(0, 7) + '...' + str.slice(str.length - 5, str.length)
}

export function truncateAddressMore(str: string | undefined | null) {
	if (str === undefined || str === null) return str
	if (str.length <= 5) {
		return str
	}
	return str.slice(0, 5)
}

export const prettyJSON = (message: string, obj: string) => {
	console.log(message, JSON.stringify(obj, null, 2))
}

export function convertIpfsUriToUrl(uri: string) {
	let parts = uri.split('ipfs://')
	let cid = parts[parts.length - 1]
	return `https://ipfs.io/ipfs/${cid}`
}
