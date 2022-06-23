import { Avatar, Box, Flex, Image, Link, Text } from '@chakra-ui/react'
import { timeSince } from '../../../../helpers/date'
import TweetType from '../../../../types/Tweet'

const Tweet = ({ data }: { data: TweetType }) => {
   const date = data.created_at
   const formattedDate = timeSince(date)

   return (
      <Box mb={3}>
         <Flex alignItems="flex-start" mb="1">
            {data.user && data.user.profile_image_url && (
               <Box>
                  <Avatar
                     name={data.user.name}
                     src={data.user.profile_image_url}
                  />
               </Box>
            )}
            {data.user && (
               <Box ml={3}>
                  <Flex alignItems="center" flexFlow="row wrap">
                     <Text fontWeight="bold" fontSize="lg" color="darkgray.800">
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
                  <Text fontSize="md">{data.text}</Text>
                  {data.media && (
                     <Box mt={3}>
                        {data.media.map((url) => (
                           <Image
                              src={url}
                              key={url}
                              borderRadius="lg"
                              mb={3}
                           />
                        ))}
                     </Box>
                  )}
               </Box>
            )}
         </Flex>
      </Box>
   )
}

export default Tweet
