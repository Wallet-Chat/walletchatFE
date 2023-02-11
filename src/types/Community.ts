import { GroupMessageType } from './Message'
import TweetType from './Tweet'
import User from './User'

export default interface CommunityType {
	name: string
	members: Array<User>
	member_count: number
	logo: string
	is_verified: boolean
	joined: boolean
	has_messaged: boolean
	messages?: Array<GroupMessageType>
	tweets?: Array<TweetType>
	social?: Array<{
		type: string
		username: string
	}>
	discord?: string
	twitter?: string
}
