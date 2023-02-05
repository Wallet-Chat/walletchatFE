import RawTweetsType from '../types/RawTweets'
import TweetType from '../types/Tweet'

export const transformTweets = (data: RawTweetsType): TweetType[] => {
	console.log('transformTweet function()', data)
	if (data.data) {
		let user
		if (data.includes?.users && data.includes?.users[0]) {
			user = data.includes.users[0]
		}

		let tweets = JSON.parse(JSON.stringify(data.data))
		for (let i = 0; i < tweets.length; i++) {
			tweets[i]['user'] = user

			if (tweets[i]?.attachments?.media_keys?.length > 0) {
				let attachments = []
				for (let j = 0; j < tweets[i].attachments.media_keys.length; j++) {
					let mediaKey = tweets[i].attachments.media_keys[j]
					if (data.includes?.media && data.includes.media.length > 0) {
						let matched = data.includes.media.find(
							(item) => item.media_key === mediaKey
						)
						if (matched !== undefined) {
							attachments.push(matched.url)
						}
					}
				}
				if (attachments.length > 0) {
					tweets[i]['media'] = attachments
				}
			}
		}
		return tweets
	}
	return []
}
