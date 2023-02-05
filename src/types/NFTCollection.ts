export default interface NFTCollection {
	name?: string
	slug?: string
	created_date?: string
	description?: string

	image_url?: string
	large_image_url?: string
	banner_image_url?: string

	chat_url?: string
	discord_url?: string
	external_url?: string
	medium_username?: string
	telegram_url?: string
	twitter_username?: string
	instagram_username?: string
	wiki_url?: string

	contract_address?: string
	total_supply?: string
}
