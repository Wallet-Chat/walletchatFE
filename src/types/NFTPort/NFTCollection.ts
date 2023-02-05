import GeneralNFTCollection from '../NFTCollection'

export default interface NFTPortNFTCollection {
	response: string
	nfts?: Array<{
		chain?: string
		contract_address?: string
		token_id?: string
		metadata?: {
			attributes?: Array<{
				trait_type?: string
				value?: string
			}>
			description?: string
			external_url?: string
			image?: string
			name?: string
		}
		metadata_url?: string
		file_url?: string
		animation_url?: string
		cached_file_url?: string
		cached_animation_url?: string
		mint_date?: string
		file_information?: string
		updated_date?: string
		contract?: {
			name?: string
			symbol?: string
			type?: string
			metadata?: {
				description?: string
				thumbnail_url?: string
				cached_thumbnail_url?: string
				banner_url?: string
				cached_banner_url?: string
			}
		}
	}>

	total?: number
}

export function nftPortToGeneralNFTCollectionType(
	data: NFTPortNFTCollection
): GeneralNFTCollection {
	return {
		name: data?.nfts?.[0]?.contract?.name,
		description: data?.nfts?.[0]?.contract?.metadata?.description,

		image_url:
			data?.nfts?.[0]?.contract?.metadata?.cached_thumbnail_url ||
			data?.nfts?.[0]?.cached_file_url ||
			data?.nfts?.[0]?.file_url,
		banner_image_url: data?.nfts?.[0]?.contract?.metadata?.cached_banner_url,

		contract_address: data?.nfts?.[0]?.contract_address,
		total_supply: data?.total?.toString(),
	}
}
