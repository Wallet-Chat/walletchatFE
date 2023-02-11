import TweetType from '../../../../../../types/Tweet'
import Tweet from './components/Tweet'
import { Box, Divider } from '@chakra-ui/react'

const CommunityTweets = ({ tweets }: { tweets: TweetType[] }) => {
	return (
		<Box borderRadius='md' p={4}>
			{tweets ? (
				tweets.map((tweet: TweetType, i) => (
					<>
						<Tweet data={tweet} key={i} />
						{i + 1 !== tweets.length && <Divider mb={4} />}
					</>
				))
			) : (
				<></>
			)}
		</Box>
	)
}

export default CommunityTweets
