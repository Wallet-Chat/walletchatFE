import { Avatar, Box, Flex, Image, Link, Text } from '@chakra-ui/react'
import { timeSince } from '../../../../../../helpers/date'
import TweetType from '../../../../../../types/Tweet'

const Tweet = ({ data }: { data: TweetType }) => {
   const date = data.created_at
   const formattedDate = timeSince(date)
   console.log(data)
   return (
      <Box mb={3}>
         <Flex alignItems="flex-start" mb="1">
            {data.user && data.user.profile_image_url && (
               <Box>
                  <Link
                     href={`https://twitter.com/${data.user.username}`}
                     target="_blank"
                     color="darkgray.800"
                  >
                     <Avatar
                        name={data.user.name}
                        src={data.user.profile_image_url}
                     />
                  </Link>
               </Box>
            )}
            <Box ml={3}>
               {data.user && (
                  <Box mb={1}>
                     <Flex alignItems="center" flexFlow="row wrap">
                        <Text
                           fontWeight="bold"
                           fontSize="lg"
                           color="darkgray.800"
                        >
                           <Link
                              href={`https://twitter.com/${data.user.username}`}
                              target="_blank"
                              color="darkgray.800"
                           >
                              {data.user.name}
                           </Link>
                        </Text>
                        {data.user.username && (
                           <>
                              <Text
                                 fontSize="md"
                                 ml={1}
                                 mr={1}
                                 color="darkgray.200"
                              >
                                 ·
                              </Text>
                              <Link
                                 href={`https://twitter.com/${data.user.username}`}
                                 target="_blank"
                              >
                                 <Text fontSize="md" color="darkgray.200">
                                    @{data.user.username}
                                 </Text>
                              </Link>
                           </>
                        )}
                        {formattedDate && (
                           <>
                              <Text
                                 fontSize="md"
                                 ml={1}
                                 mr={1}
                                 color="darkgray.200"
                              >
                                 ·
                              </Text>
                              <Text fontSize="md" color="darkgray.200">
                                 {formattedDate}
                              </Text>
                           </>
                        )}
                     </Flex>
                  </Box>
               )}

               {data.text && <Text fontSize="md">{data.text}</Text>}

               {data.media &&
                  data.media.media_keys &&
                  data.media.media_keys.length > 0 && (
                     <Box mt={3}>
                        {data.media.media_keys.map((url, i) => (
                           <Image
                              src={url}
                              key={`${url}-${i}`}
                              borderRadius="lg"
                              mb={3}
                           />
                        ))}
                     </Box>
                  )}
            </Box>
         </Flex>
      </Box>
   )
}

export default Tweet
