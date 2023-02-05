import { default as GeneralNFT } from '../NFT'

export default interface AlchemyNFT {
	contract: {
		address: string
	}
	id: {
		tokenId: string
		tokenMetadata: {
			tokenType: string
		}
	}
	title: string
	description: string
	tokenUri: {
		raw: string
		gateway: string
	}
	media: [
		{
			raw: string
			gateway: string
		}
	]
	metadata: {
		name: string
		image: string
		description: string
		external_url: string
		attributes: Array<{
			trait_type: string
			value: string
		}>
	}
	timeLastUpdated: string
}

export function alchemyToGeneralNFTType(data: AlchemyNFT): GeneralNFT {
	return {
		name: data?.title,
		image: data?.metadata?.image,
		description: data?.metadata?.description,
		attributes: data?.metadata?.attributes,
		token_id: data?.id?.tokenId,
		collection: {
			name: data?.title,
			image: data?.metadata?.image,
			contract_address: data?.contract?.address,
		},
	}
}
