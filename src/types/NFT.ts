export default interface NFT {
	name?: string
	image?: string
	description?: string
	attributes?: Array<{
		trait_type?: string
		value?: string
	}>
	token_id?: string
	collection?: {
		name?: string
		image?: string
		contract_address?: string
	}
	chain_id?: string
}
