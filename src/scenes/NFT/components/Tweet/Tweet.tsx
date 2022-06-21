import { Box, Flex, Text } from '@chakra-ui/react'

import TweetType from '../../../../types/Tweet'
const Tweet = ({ data }: { data: TweetType }) => {

   return (
      <Box mb={3}>
         <Flex alignItems="center" mb="1">
             <Box mr={3}>
            </Box>
            <Box>
        </Box>
        </Flex>
         <Text fontSize="md">{data.text}</Text>
      </Box>
   )
}

export default Tweet
