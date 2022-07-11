import { Box, Spinner, Text } from '@chakra-ui/react'
import { IconCheck, IconChecks } from '@tabler/icons'
import { useEffect } from 'react'
import styled from 'styled-components'
import { useInView } from 'react-intersection-observer'

import { formatMessageDate } from '../../../../../../helpers/date'
import { MessageUIType } from '../../../../../../types/Message'
import { useUnreadCount } from '../../../../../../context/UnreadCountProvider'

const MessageBox = styled.div`
   position: relative;
   width: auto;
   min-width: 75px;
   max-width: 80%;
   height: auto;
   background: #fff;
   background: var(--chakra-colors-lightgray-300);
   border-radius: var(--chakra-radii-md);
   padding: var(--chakra-space-2) var(--chakra-space-3) var(--chakra-space-5);
   margin: var(--chakra-space-3) var(--chakra-space-4);
   margin-bottom: 0px;
   font-size: var(--chakra-fontSizes-md);
   clear: both;
   word-break: break-word;

   &:nth-last-child(1) {
      margin-bottom: 20px;
   }

   &.left {
      float: left;
      background: #fff;
   }
   &.right {
      float: right;
      background: var(--chakra-colors-darkgray-800);
      color: var(--chakra-colors-lightgray-100);
   }
   .timestamp {
      display: block;
      position: absolute;
      right: var(--chakra-space-7);
      bottom: var(--chakra-space-2);
      color: #aaa;
      font-size: var(--chakra-fontSizes-sm);
      user-select: none;
      line-height: 1.2;
   }
   &.left {
      .timestamp {
         right: var(--chakra-space-2);
      }
   }
   .read-status {
      position: absolute;
      right: var(--chakra-space-2);
      bottom: var(--chakra-space-2);
      svg {
         stroke: var(--chakra-colors-lightgray-800);
      }
   }
   &.read:not(.left) {
      .timestamp {
         color: darkgreen;
         user-select: none;
      }
      .read-status {
         svg {
            stroke: darkgreen;
         }
      }
   }
   &.right {
      &.read {
         .timestamp {
            color: var(--chakra-colors-success-500);
            user-select: none;
         }
         .read-status {
            svg {
               stroke: var(--chakra-colors-success-500);
            }
         }
      }
   }
`

const Message = ({
   account,
   msg,
   updateRead,
}: {
   account: string
   msg: MessageUIType
   updateRead: (data: MessageUIType) => void
}) => {
   let { unreadCount, setUnreadCount } = useUnreadCount()

   const { ref, inView } = useInView({
      triggerOnce: true,
   })

   useEffect(() => {
      if (
         msg.toAddr &&
         inView &&
         msg.read === false &&
         msg.toAddr.toLocaleLowerCase() === account.toLocaleLowerCase()
      ) {
         setMessageAsRead()
      }
   }, [inView])

   const setMessageAsRead = () => {
      if (msg.toAddr && msg.fromAddr && msg.timestamp) {
         fetch(
            ` ${process.env.REACT_APP_REST_API}/update_chatitem/${msg.fromAddr}/${msg.toAddr}}`,
            {
               method: 'PUT',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  ...msg,
                  read: true,
               }),
            }
         )
            .then((response) => response.json())
            .then((data) => {
               console.log('✅[PUT][Message]:', data)
               setUnreadCount(unreadCount - 1)
               updateRead(data)
            })
            .catch((error) => {
               console.error('🚨[PUT][Message]:', error)
            })
      }
   }

   return (
      <MessageBox
         className={`msg ${msg.position} ${msg.read && 'read'}`}
         ref={ref}
      >
         <Box
            className="msg-img"
            style={{ backgroundImage: `url(${msg.img})` }}
         ></Box>
         <Box className="msg-bubble">
            {msg?.name && (
               <Text fontSize="md" color="information.600">
                  {msg.name}
               </Text>
            )}
            {msg.message}
            <span className="timestamp">
               {formatMessageDate(new Date(msg.timestamp))}
            </span>

            {msg.position === 'right' && (
               <span className="read-status">
                  {msg.isFetching ? (
                     <Spinner size="xs" />
                  ) : msg.read ? (
                     <IconChecks size={15} />
                  ) : (
                     <IconCheck size={15} />
                  )}
               </span>
            )}
         </Box>
      </MessageBox>
   )
}

export default Message
