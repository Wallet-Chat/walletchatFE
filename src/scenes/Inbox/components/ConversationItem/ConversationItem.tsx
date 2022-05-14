import { Box, Flex } from '@chakra-ui/react'
import styled from 'styled-components'
import Blockies from 'react-blockies'

import MessageType from '../../../../types/Message'
import { formatMessageDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'
import { Link } from 'react-router-dom'

const ConversationItem = ({ data }: { data: MessageType }) => {
   const Wrapper = styled.button`
      display: block;
      width: 100%;
      padding: var(--chakra-space-3) var(--chakra-space-5);
      background: #fff;
      text-align: left;

      &:not(:last-child) {
         border-bottom: 1px solid var(--chakra-colors-lightgray-300);
      }

      &:hover {
         background: var(--chakra-colors-lightgray-300);
      }

      .timestamp {
         display: block;
         color: var(--chakra-colors-darkgray-300);
         font-size: var(--chakra-fontSizes-md);
         user-select: none;
         line-height: 1.7;
      }
   `
   const FromAddress = styled.div`
      font-size: var(--chakra-fontSizes-lg);
      font-weight: bold;
   `
   const BlockieWrapper = styled.div`
      border-radius: 0.3rem;
      overflow: hidden;
   `
   return (
      <Link to={`/chat/${data.toAddr}`} style={{ textDecoration: 'none' }}>
         <Wrapper>
            <Flex justifyContent="space-between">
               <Flex>
                  <Box mr={2}>
                     <BlockieWrapper>
                        <Blockies
                           seed={data.toAddr.toLocaleLowerCase()}
                           scale={5}
                        />
                     </BlockieWrapper>
                  </Box>
                  <Box>
                     {data.fromAddr && (
                        <FromAddress>
                           {truncateAddress(data.fromAddr)}
                        </FromAddress>
                     )}
                     {data.message && (
                        <Box fontSize="md" color="darkgray.100">
                           {data.message.substring(0, 25)}
                           {data.message.length > 25 && '...'}
                        </Box>
                     )}
                  </Box>
               </Flex>
               <Box>
                  <Box className="timestamp">
                     {formatMessageDate(new Date(data.timestamp))}
                  </Box>
               </Box>
            </Flex>
         </Wrapper>
      </Link>
   )
}

export default ConversationItem
