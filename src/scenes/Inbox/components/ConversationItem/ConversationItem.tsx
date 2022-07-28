import { Box, Flex, Image } from '@chakra-ui/react'
import styled from 'styled-components'
import Blockies from 'react-blockies'
import { Link } from 'react-router-dom'

import { MessageUIType } from '../../../../types/Message'
import { formatInboxDate } from '../../../../helpers/date'
import { truncateAddress } from '../../../../helpers/truncateString'

const Wrapper = styled.button`
   display: block;
   width: 100%;
   padding: var(--chakra-space-3) var(--chakra-space-5);
   background: ##FFCC00;
   text-align: left;
   color: var(--chakra-colors-herogold);

   &:not(:last-child) {
      border-bottom: 1px solid var(--chakra-colors-red-300);
   }

   &:hover {
      background: var(--chakra-colors-red-300);
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
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
`
const BlockieWrapper = styled.div`
   border-radius: 0.3rem;
   overflow: hidden;
   width: 40px;
   height: 40px;
`
const NotificationCount = styled.div`
   display: inline-block;
   background: var(--chakra-colors-information-400);
   border-radius: var(--chakra-radii-md);
   height: 18px;
   color: #fff;
   font-weight: 700;
   font-size: 90%;
   text-align: center;
   margin-left: auto;
   padding: 0 var(--chakra-space-2);
`

const ConversationItem = ({
   data,
   account,
}: {
   data: MessageUIType
   account: string
}) => {
   let recipientAddress = ''
   if (data?.toAddr && data?.fromAddr) {
      recipientAddress =
         data.toAddr.toLocaleLowerCase() === account.toLocaleLowerCase()
            ? data.fromAddr.toLocaleLowerCase()
            : data.toAddr.toLocaleLowerCase()
   }

   let displayName = ''

   if (data?.sender_name && data?.sender_name !== '') {
      displayName = data.sender_name
   } else if (data?.name && data?.name !== '') {
      displayName = data.name
   } else {
      displayName = truncateAddress(recipientAddress) || ''
   }

   return (
      <Link
         to={
            data.context_type === 'community'
               ? `/community/${data.nftAddr}`
               : `/chat/${recipientAddress}`
         }
         style={{ textDecoration: 'none' }}
      >
         <Wrapper>
            <Flex justifyContent="space-between">
               <Flex>
                  <Box mr={2} flexShrink={0}>
                     {data?.logo ? (
                        <Image
                           src={data.logo}
                           alt=""
                           maxWidth="40px"
                           maxHeight="40px"
                           borderRadius="md"
                        />
                     ) : (
                        <BlockieWrapper>
                           <Blockies seed={recipientAddress} scale={5} />
                        </BlockieWrapper>
                     )}
                  </Box>
                  <Box minWidth="0">
                     <RecipientAddress>{displayName}</RecipientAddress>
                     {data.message && (
                        <Box fontSize="md" color="darkgray.100" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                           {data.message.substring(0, 25)}{data.message.length > 25 && '...'}
                        </Box>
                     )}
                  </Box>
               </Flex>
               <Box textAlign="right" flexShrink={0}>
                  <Box className="timestamp">
                     {formatInboxDate(data.timestamp)}
                  </Box>
                  {data.unread && data.unread !== 0 ? (
                     <NotificationCount>{data.unread}</NotificationCount>
                  ) : (
                     ''
                  )}
               </Box>
            </Flex>
         </Wrapper>
      </Link>
   )
}

export default ConversationItem
