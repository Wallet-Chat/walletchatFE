import { useEffect, useState } from 'react'

// import { transformTweets } from '../../../../../../helpers/transformTweets'
import TweetType from '../../../../types/Tweet'
import Tweet from './components/Tweet'
import { Divider } from '@chakra-ui/react'

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

   const getTwitterInfo = async (nftContractAddr: string) => {
      setIsFetchingTweets(true)
      fetch(
         ` ${process.env.REACT_APP_REST_API}/get_twitter/${nftContractAddr}`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[GET][Twitter Tweets]:', data)
            setTweets(data)
            // let transformed = transformTweets(data)
            // console.log('Transformed data:', transformed)
            // if (transformed) {
            //    setTweets(transformed)
            // }
         })
         .catch((error) => {
            console.error('🚨🚨[GET][NFT][Twitter Info]:', error)
         })
         .finally(() => setIsFetchingTweets(false))
   }

   //    const getTwitterHandle = async (slug: string): Promise<string | null> => {
   //       return fetch(`https://opensea.io/collection/${slug}`, {
   //          method: 'GET',
   //          // headers: {
   //          //    'Content-Type': 'application/json',
   //          // },
   //       })
   //          .then((response) => response.text())
   //          .then((data) => {
   //             let twitter = data
   //                .split('twitterUsername')[1]
   //                .split(',')[0]
   //                .replace(':', '')
   //                .replace(/"/g, '')
   //             if (twitter === 'null' || twitter === null) {
   //                twitter = data
   //                   .split('connectedTwitterUsername')[1]
   //                   .split(',')[0]
   //                   .replace(':', '')
   //                   .replace(/"/g, '')
   //             }
   //             console.log('✅[GET][Twitter Handle]:', twitter)
   //             return Promise.resolve(twitter)
   //          })
   //          .catch((error) => {
   //             console.error('🚨[GET][Twitter Handle]:', error)
   //             return Promise.resolve(null)
   //          })
   //    }

   //    const getTwitterId = async (
   //       _twitterHandle: string
   //    ): Promise<string | null> => {
   //       return fetch(
   //          `https://api.twitter.com/2/users/by/username/${_twitterHandle}`,
   //          {
   //             method: 'GET',
   //             headers: {
   //                'Content-Type': 'application/json',
   //                Authorization:
   //                   'Bearer AAAAAAAAAAAAAAAAAAAAAAjRdgEAAAAAK2TFwi%2FmA5pzy1PWRkx8OJQcuko%3DH6G3XZWbJUpYZOW0FUmQvwFAPANhINMFi94UEMdaVwIiw9ne0e',
   //             },
   //          }
   //       )
   //          .then((response) => response.json())
   //          .then((data) => {
   //             let id = null
   //             if (data.data) {
   //                id = data.data['id']
   //                setTwitterId(id)
   //                console.log('✅[GET][Twitter ID]:', id)
   //             }
   //             return Promise.resolve(id)
   //          })
   //          .catch((error) => {
   //             console.error('🚨[GET][Twitter ID]:', error)
   //             return Promise.resolve(null)
   //          })
   //    }

   //    const getTweetsFromAPI = (_twitterId: string) => {
   //       fetch(
   //          `https://api.twitter.com/2/users/${_twitterId}/tweets?media.fields=height,width,url,preview_image_url,type&tweet.fields=attachments,created_at&user.fields=profile_image_url,username&expansions=author_id,attachments.media_keys`,
   //          {
   //             method: 'GET',
   //             headers: {
   //                'Content-Type': 'application/json',
   //                Authorization:
   //                   'Bearer AAAAAAAAAAAAAAAAAAAAAAjRdgEAAAAAK2TFwi%2FmA5pzy1PWRkx8OJQcuko%3DH6G3XZWbJUpYZOW0FUmQvwFAPANhINMFi94UEMdaVwIiw9ne0e',
   //             },
   //          }
   //       )
   //          .then((response) => response.json())
   //          .then((data) => {
   //             console.log('✅[GET][Twitter Tweets]:', data)
   //             let transformed = transformTweets(data)
   //             console.log('Transformed data:', transformed)
   //             if (transformed) {
   //                setTweets(transformed)
   //             }
   //          })
   //          .catch((error) => {
   //             console.error('🚨[GET][Twitter Tweets]:', error)
   //          })
   //    }

   //    const getTwitterInfoClientSide = async (nftContractAddr: string) => {
   //       if (!twitterId) {
   //          fetch(
   //             `https://api.opensea.io/api/v1/asset_contract/${nftContractAddr}`,
   //             {
   //                method: 'GET',
   //                headers: {
   //                   'Content-Type': 'application/json',
   //                },
   //             }
   //          )
   //             .then((response) => response.json())
   //             .then(async (data) => {
   //                let collectionSlug = data['collection']
   //                let slug = collectionSlug['slug']
   //                console.log('✅[GET][Slug Info]:', slug)
   //                const handle = await getTwitterHandle(slug)
   //                if (handle) {
   //                   const id = await getTwitterId(handle)
   //                   if (id) getTweetsFromAPI(id)
   //                }
   //             })
   //             .catch((error) => {
   //                console.error('🚨[GET][Slug Info]:', error)
   //             })
   //       } else {
   //          getTweetsFromAPI(twitterId)
   //       }
   //    }

   useEffect(() => {
      if (nftContractAddr) getTwitterInfo(nftContractAddr)

      const interval = setInterval(() => {
         if (nftContractAddr) {
            getTwitterInfo(nftContractAddr)
         }
      }, 30000) // every 30s

      return () => {
         clearInterval(interval)
      }
   }, [account])

   return (
      <>
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
      </>
   )
}

export default NFTTweets
