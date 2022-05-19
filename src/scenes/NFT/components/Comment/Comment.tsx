import { Box, Flex, Text } from '@chakra-ui/react'
import { IconExternalLink } from '@tabler/icons'
import { Link } from 'react-router-dom'
import Blockies from 'react-blockies'
import styled from 'styled-components'

import CommentType from '../../../../types/Comment'
import { truncateAddress } from '../../../../helpers/truncateString'
import { getFormattedDate, timeSince } from '../../../../helpers/date'

const BlockieWrapper = styled.div`
   border-radius: var(--chakra-radii-md);
   overflow: hidden;
`

const Comment = ({ data }: { data: CommentType }) => {
   return (
      <Box>
         <Flex alignItems="center">
            <BlockieWrapper>
               <Blockies seed={data.fromAddr.toLocaleLowerCase()} scale={4} />
            </BlockieWrapper>
            <Box>
               <Text>
                  {truncateAddress(data.fromAddr)}
                  <Link
                     to={`https://etherscan.io/address/${data.fromAddr}`}
                     target="_blank"
                     style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                     }}
                  >
                     <IconExternalLink
                        size={16}
                        color="var(--chakra-colors-lightgray-900)"
                        stroke="1.5"
                     />
                  </Link>
               </Text>
               {data.timestamp && (
                  <Text color="lightgray.900" fontSize="md">{timeSince(data.timestamp)}</Text>
               )}
            </Box>
         </Flex>
         <Text>{data.message}</Text>
      </Box>
   )
}

export default Comment
