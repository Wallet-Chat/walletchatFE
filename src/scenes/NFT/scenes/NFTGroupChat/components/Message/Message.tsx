import {
   Box,
   Button,
   Spinner,
   Flex,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Image,
   Text,
   Divider,
   Link
} from '@chakra-ui/react'
import styled from 'styled-components'
import Blockies from 'react-blockies'
import { IconExternalLink } from '@tabler/icons'

import { formatMessageDate } from '../../../../../../helpers/date'
import { MessageUIType } from '../../../../../../types/Message'
import IconOpenSea from '../../../../../../images/icon-opensea.svg'
import IconLooksRare from '../../../../../../images/icon-looksrare.svg'
import IconX2Y2 from '../../../../../../images/icon-x2y2.svg'
import IconEtherscan from '../../../../../../images/icon-etherscan.svg'
import { truncateAddress } from '../../../../../../helpers/truncateString'

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
   font-size: var(--chakra-fontSizes-md);
   clear: both;

   .msg-img {
      display: inline-block;
   }

   .msg-bubble {
      display: inline-block;
   }

   &.left {
      float: left;
      background: #fff;
   }
   &.right {
      float: left;
      background: var(--chakra-colors-darkgray-800);
      color: var(--chakra-colors-lightgray-100);
   }
   .timestamp {
      display: block;
      position: absolute;
      /* right: var(--chakra-space-7); */
      right: var(--chakra-space-2);
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
const BlockieWrapper = styled.div`
   border-radius: 0.3rem;
   overflow: hidden;
`

const Message = ({ msg }: { msg: MessageUIType }) => {
   return (
      <Flex
         alignItems="flex-start"
         margin="var(--chakra-space-3) var(--chakra-space-4)"
      >
         <Box
            className="msg-img"
            style={{ backgroundImage: `url(${msg.img})` }}
            padding="var(--chakra-space-2) var(--chakra-space-3)"
         >
            {msg.fromAddr && (
               <Menu>
                  <MenuButton as={Button} p={0} height="auto" minWidth="unset">
                     <BlockieWrapper>
                        <Blockies
                           seed={msg.fromAddr.toLocaleLowerCase()}
                           scale={4}
                        />
                     </BlockieWrapper>
                  </MenuButton>
                  <MenuList>
                     
                     <Link href={`https://etherscan.io/address/${msg.fromAddr}`} target="_blank" _hover={{ textDecoration: 'none', background: 'var(--chakra-colors-lightgray-400)'}}>
                        <MenuItem icon={<Image src={IconEtherscan} width="20px" height="20px" alt="" />}>
                           <Flex alignItems="center">
                              <Text>{truncateAddress(msg.fromAddr)}</Text>
                              <IconExternalLink stroke="1.5" size="20" />
                           </Flex>
                        </MenuItem>
                     </Link>
                     
                     <Divider />
                     <Link href={`https://opensea.io/accounts/${msg.fromAddr}`} target="_blank" _hover={{ textDecoration: 'none', background: 'var(--chakra-colors-lightgray-400)'}}>
                        <MenuItem icon={<Image src={IconOpenSea} width="20px" height="20px" alt="" />}>
                           View in OpenSea
                        </MenuItem>
                     </Link>
                     <Link href={`https://looksrare.org/accounts/${msg.fromAddr}`} target="_blank" _hover={{ textDecoration: 'none', background: 'var(--chakra-colors-lightgray-400)'}}>
                        <MenuItem icon={<Image src={IconLooksRare} width="20px" height="20px" alt="" />}>
                           View in LooksRare
                        </MenuItem>
                     </Link>
                     <Link href={`https://x2y2.io/user/${msg.fromAddr}`} target="_blank" _hover={{ textDecoration: 'none', background: 'var(--chakra-colors-lightgray-400)'}}>
                        <MenuItem icon={<Image src={IconX2Y2} width="20px" height="20px" alt="" />}>
                           View in X2Y2
                        </MenuItem>
                     </Link>
                  </MenuList>
               </Menu>
            )}
         </Box>

         <MessageBox className={`msg ${msg.position} ${msg.read && 'read'}`}>
            <Box className="msg-bubble">
               {msg.message}
               <span className="timestamp">
                  {formatMessageDate(new Date(msg.timestamp))}
               </span>

               {msg.position === 'right' && msg.isFetching && (
                  <span className="read-status">
                     <Spinner size="xs" />
                  </span>
               )}
            </Box>
         </MessageBox>
      </Flex>
   )
}

export default Message
