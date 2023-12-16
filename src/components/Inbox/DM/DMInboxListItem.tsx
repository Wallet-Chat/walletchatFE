import React, { useEffect } from "react";
import { Box, Flex } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

import { formatInboxDate } from '../../../helpers/date'
import { truncateAddress } from '../../../helpers/truncateString'
import { InboxItemType } from '../../../types/InboxItem'
import { InboxItemNotificationCount, InboxItemRecipientAddress, InboxItemWrapper } from '../../../styled/InboxItem'
import Avatar from './Avatar'
import { getLocalDmDataForAccountToAddr } from '@/redux/reducers/dm'
import { log } from '@/helpers/log'
import { getJwtForAccount } from '@/helpers/jwt'
import * as ENV from '@/constants/env'
import { MdVerified } from "react-icons/md";

const DMInboxItem = ({
   data,
   account,
}: {
   data: InboxItemType
   account: string
}) => {
   let recipientAddress = ''
   if (data?.toaddr && data?.fromaddr) {
      recipientAddress =
         data.toaddr.toLocaleLowerCase() === account.toLocaleLowerCase()
            ? data.fromaddr.toLocaleLowerCase()
            : data.toaddr.toLocaleLowerCase()
   }

   let displayName = ''

   if (data?.sender_name && data?.sender_name !== '') {
      displayName = data.sender_name
   } else if (data?.name && data?.name !== '') {
      displayName = data.name
   } else {
      displayName = truncateAddress(recipientAddress) || ''
   }
   const [isVerifiedUser, setIsVerifiedUser] = React.useState<boolean>()
   const localDmData = getLocalDmDataForAccountToAddr(account, recipientAddress) || []

   useEffect(() => {
      isVerified();
   }, [account])

   const isVerified = async () => {
      if (!account) {
        log('No account connected')
        return
      }
      
      try {
        await fetch(
          `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/is_moderator/gooddollar/${recipientAddress}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getJwtForAccount(account)}`,
            }
        })
        .then((response) => response.json())
        .then((data) => {
          setIsVerifiedUser(data);
        })
      } catch (error) {
        console.error('🚨[GET][isVerified User]::', error)
      }
    }

   return (
      <Link
         to={
            data.context_type === 'community'
               ? `/community/${data.nftaddr}`
               : `/dm/${recipientAddress}`
         }
         style={{ textDecoration: 'none' }}
      >
         <InboxItemWrapper>
            <Flex justifyContent="space-between">
               <Flex>
                  <Box mr={2} flexShrink={0}>
                     <Avatar account={recipientAddress} />
                  </Box>
                  <Box minWidth="0">
                     <Flex alignItems='center'>
                        <InboxItemRecipientAddress>{displayName}</InboxItemRecipientAddress>
                        {isVerifiedUser && <MdVerified size={15} color='#63b3ed' stroke='1.5' /> }
                     </Flex>
                     {data.message && localDmData.length > 0 && (
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
                     <InboxItemNotificationCount>{data.unread}</InboxItemNotificationCount>
                  ) : (
                     ''
                  )}
               </Box>
            </Flex>
         </InboxItemWrapper>
      </Link>
   )
}

export default DMInboxItem
