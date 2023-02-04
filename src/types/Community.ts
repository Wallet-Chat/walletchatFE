import { GroupMessageType } from './Message';
import TweetType from './Tweet';

export default interface CommunityType {
	name: string;
	members: number;
	logo: string;
	is_verified: boolean;
	joined: boolean;
	has_messaged: boolean;
	messages?: Array<GroupMessageType>;
	tweets?: Array<TweetType>;
	social?: Array<{
		type: string;
		username: string;
	}>;
	discord?: string;
	twitter?: string;
}
