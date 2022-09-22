import { useEffect, useState } from 'react'
import equal from 'fast-deep-equal/es6'

import TweetType from '../../../../types/Tweet'
import Tweet from './components/Tweet'
import { Box, Divider, Flex, Spinner } from '@chakra-ui/react'


const NFTTweets = ({
   account,
   nftContractAddr,
}: {
   account: string
   nftContractAddr: string
}) => {
   // Twitter
   //    const [twitterId, setTwitterId] = useState<string>()
   const [tweets, setTweets] = useState<TweetType[]>()
   const [isFetchingTweets, setIsFetchingTweets] = useState<boolean>(false)

   useEffect(() => {
      if (nftContractAddr) {
         getTwitterInfo(nftContractAddr)
      }
   }, [nftContractAddr])

   const getTwitterInfo = async (nftContractAddr: string) => {
      setIsFetchingTweets(true)
      fetch(
         ` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/get_twitter/${nftContractAddr}`,
         {
            method: 'GET',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               //Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
            },
         }
      )
         .then((response) => response.json())
         .then((data) => {
            if (equal(data, tweets) === false) {
               console.log('✅[GET][NFT][Tweets]:', data)
               setTweets(data)
            }
         })
         .catch((error) => {
            console.error('🚨[GET][NFT][Tweets]:', error)
         })
         .finally(() => setIsFetchingTweets(false))
   }

   if (isFetchingTweets) {
      return (
         <Flex justifyContent="center" alignItems="center">
            <Spinner />
         </Flex>
      )
   }
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
