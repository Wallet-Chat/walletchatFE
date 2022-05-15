import { Box, Flex } from '@chakra-ui/react'
import styled from 'styled-components'
import Blockies from 'react-blockies'

import MessageUIType from '../../../../types/MessageUI'
import { formatMessageDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'
import { Link } from 'react-router-dom'

const ConversationItem = ({
   data,
   account,
}: {
   data: MessageUIType
   account: string
}) => {
   const Wrapper = styled.button`
      display: block;
      width: 100%;
      padding: var(--chakra-space-3) var(--chakra-space-5);
      background: #fff;
      text-align: left;
      color: var(--chakra-colors-darkgray-900);

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
   const RecipientAddress = styled.div`
      font-size: var(--chakra-fontSizes-lg);
      font-weight: bold;
   `
   const BlockieWrapper = styled.div`
      border-radius: 0.3rem;
      overflow: hidden;
   `

   let recipientAddress = ""
   if (data && data.toAddr && data.fromAddr) {
      recipientAddress =
         data.toAddr.toLocaleLowerCase() === account
            ? data.fromAddr.toLocaleLowerCase()
            : data.toAddr.toLocaleLowerCase()
   }

   return (
      <Link to={`/chat/${recipientAddress}`} style={{ textDecoration: 'none' }}>
         <Wrapper>
            <Flex justifyContent="space-between">
               <Flex>
                  <Box mr={2}>
                     <BlockieWrapper>
                        <Blockies seed={recipientAddress} scale={5} />
                     </BlockieWrapper>
                  </Box>
                  <Box>
                     {recipientAddress && (
                        <RecipientAddress>
                           {truncateAddress(recipientAddress)}
                        </RecipientAddress>
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
