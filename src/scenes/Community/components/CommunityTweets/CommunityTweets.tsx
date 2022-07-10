import TweetType from '../../../../types/Tweet'
import Tweet from './components/Tweet'
import { Box, Divider } from '@chakra-ui/react'

const NFTTweets = ({ tweets }: { tweets: TweetType[] }) => {
   return (
      <Box>
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

export default NFTTweets
