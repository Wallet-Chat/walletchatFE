import { Avatar, Box, Flex, Image, Link, Text } from '@chakra-ui/react'
import TweetType from '../../../../types/Tweet'

const Tweet = ({ data }: { data: TweetType }) => {
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
                  <Flex alignItems="center">
                     <Text fontWeight="bold">{data.user.name}</Text>
                     {data.user.username && (
                        <Link
                           href={`https://twitter.com/${data.user.username}`}
                        >
                           <Text fontSize="md" color="darkgray.200" ml={2}>
                              @{data.user.username}
                           </Text>
                        </Link>
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
