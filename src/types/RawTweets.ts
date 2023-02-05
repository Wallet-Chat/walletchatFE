export default interface RawTweetsType {
	data: Array<{
		author_id: string
		attachments?: {
			media_keys: string[]
		}
		text: string
		id: string
		created_at: string
	}>
	includes?: {
		media?: Array<{
			url: string
			media_key: string
			height: number
			width: number
			type: string
		}>
		users?: Array<{
			username: string
			profile_image_url: string
			id: string
			name: string
		}>
	}
}

// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
