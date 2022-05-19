import { Box, Flex, Text } from '@chakra-ui/react'
import { IconExternalLink } from '@tabler/icons'
import { Link } from 'react-router-dom'
import Blockies from 'react-blockies'
import styled from 'styled-components'

import CommentType from '../../../../types/Comment'
import { truncateAddress } from '../../../../helpers/truncateString'
import { timeSince } from '../../../../helpers/date'

const BlockieWrapper = styled.div`
   border-radius: var(--chakra-radii-md);
   overflow: hidden;
`

const Comment = ({ data }: { data: CommentType }) => {
   console.log(data)
   return (
      <Box mb={3}>
         <Flex alignItems="center" mb="1">
             <Box mr={3}>
            <BlockieWrapper>
               <Blockies seed={data.fromAddr && data.fromAddr.toLocaleLowerCase()} scale={4} />
            </BlockieWrapper>
            </Box>
            <Box>
               <Flex alignItems="center">
                  {truncateAddress(data.fromAddr)}
                  <Link
                     to={`https://etherscan.io/address/${data.fromAddr}`}
                     target="_blank"
                     style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        marginLeft: '.3rem'
                     }}
                  >
                     <IconExternalLink
                        size={16}
                        color="var(--chakra-colors-darkgray-200)"
                        stroke="1.5"
                     />
                  </Link>
               </Flex>
               {data.timestamp && (
                  <Text color="lightgray.900" fontSize="md">{timeSince(data.timestamp)}</Text>
               )}
            </Box>
         </Flex>
         <Text fontSize="md">{data.message}</Text>
      </Box>
   )
}

export default Comment
