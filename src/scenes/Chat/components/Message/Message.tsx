import { Box, Button, Flex, Image, Spinner, Text } from '@chakra-ui/react'
import { IconCheck, IconChecks, IconExternalLink } from '@tabler/icons'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useInView } from 'react-intersection-observer'

import { formatMessageDate } from '../../../../helpers/date'
import { MessageUIType } from '../../../../types/Message'
import NFTMetadataType from '../../../../types/NFTMetadata'
import { useUnreadCount } from '../../../../context/UnreadCountProvider'
import { Link } from 'react-router-dom'

const MessageBox = styled.div`
   position: relative;
   width: auto;
   min-width: 75px;
   max-width: 80%;
   height: auto;
   background: #fff;
   background: #DD4237;
   border-radius: var(--chakra-radii-md);
   padding: var(--chakra-space-2) var(--chakra-space-3) var(--chakra-space-5);
   margin: var(--chakra-space-3) var(--chakra-space-4);
   margin-bottom: 0px;
   font-size: var(--chakra-fontSizes-md);
   clear: both;
   word-break: break-word;

   .name {
      color: var(--chakra-colors-information-600);
   }

   &:nth-last-child(1) {
      margin-bottom: 20px;
   }

   &.left {
      float: left;
      background: #DD4237;
   }
   &.right {
      float: right;
      background: var(--chakra-colors-darkgray-800);
      color: #DD4237;

      .nft-context-btn {
         background: var(--chakra-colors-darkgray-600);
         color: #DD4237;

         &:hover {
            background: var(--chakra-colors-darkgray-500);
            color: #DD4237;
         }
      }
      .chakra-menu__menu-list {
         color: #000;
      }

      .name {
         color: var(--chakra-colors-white);
      }
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
         stroke: var(--chakra-colors-red-800);
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
   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [imageUrl, setImageUrl] = useState<string>()

   const { metadata } = nftData?.nft || {}

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

   useEffect(() => {
      getNftMetadata()
   }, [msg])

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

   const getNftMetadata = () => {
      if (msg.nftAddr && msg.nftId) {
         if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
            console.log('Missing NFT Port API Key')
            return
         }
         fetch(
            `https://api.nftport.xyz/v0/nfts/${msg.nftAddr}/${msg.nftId}?chain=ethereum`,
            {
               method: 'GET',
               headers: {
                  Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
               },
            }
         )
            .then((response) => response.json())
            .then((result: NFTMetadataType) => {
               console.log('✅[GET][NFT Metadata]:', result)

               setNftData(result)

               let url = result.nft?.cached_file_url
               if (url?.includes('ipfs://')) {
                  let parts = url.split('ipfs://')
                  let cid = parts[parts.length - 1]
                  url = `https://ipfs.io/ipfs/${cid}`
                  setImageUrl(url)
               } else if (url !== null) {
                  setImageUrl(url)
               }
            })
            .catch((error) => console.log('error', error))
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
            {msg?.sender_name && (
               <Text fontSize="md" className="name">
                  {msg.sender_name}
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
         {msg.nftAddr && msg.nftId && (
            <Box mb={1}>
               {metadata && (
                  <Link
                     to={`/nft/${msg.nftAddr}/${msg.nftId}?recipient=${
                        msg.toAddr === account ? msg.fromAddr : msg.toAddr
                     }`}
                     style={{ textDecoration: 'none' }}
                  >
                     <Button p={2} height="auto" className="nft-context-btn">
                        <Flex alignItems="center">
                           {imageUrl && (
                              <Image
                                 src={imageUrl}
                                 alt=""
                                 height="15px"
                                 borderRadius="var(--chakra-radii-sm)"
                                 mr={1}
                              />
                           )}
                           {metadata.name && (
                              <Text mr={1} fontSize="sm">
                                 {metadata.name}
                              </Text>
                           )}
                           <IconExternalLink
                              size="13"
                              color="var(--chakra-colors-red-900)"
                           />
                        </Flex>
                     </Button>
                  </Link>
               )}
            </Box>
         )}
      </MessageBox>
   )
}

export default Message
