import {
   Box,
   Image,
   Flex,
   MenuButton,
   MenuList,
   MenuItem,
   Menu,
} from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import {
   IconChevronDown,
   IconCirclePlus,
   IconMessageCircle2,
} from '@tabler/icons'
import Blockies from 'react-blockies'

import logoThumb from '../images/logo-thumb.svg'
import coolcat2356 from '../images/coolcat2356.png'
import styled from 'styled-components'

const LinkElem = styled(NavLink)`
   position: relative;
   display: flex;
   flex-direction: column;
   align-items: center;
   width: 60px;
   height: 60px;
   padding: 0.8rem;
   border-radius: 0.5rem;
   text-align: center;
   box-sizing: border-box;
   background: #fff;

   &::before {
      content: '';
      width: 5px;
      height: 35%;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      background: transparent;
      border-top-right-radius: 0.2rem;
      border-bottom-right-radius: 0.2rem;
   }

   &:hover,
   &.active {
      background: var(--chakra-colors-lightgray-400);

      &::before {
         background: var(--chakra-colors-darkgray-900);
      }

      svg {
         stroke: var(--chakra-colors-darkgray-900);
      }
   }
`
const NotificationCount = styled.div`
   position: absolute;
   top: 5px;
   right: 5px;
   background: var(--chakra-colors-darkgray-800);
   border-radius: 50%;
   width: 22px;
   height: 22px;
   color: #fff;
   font-weight: 700;
`
const AccountInfo = styled.button`
   display: flex;
   flex-flow: column nowrap;
   align-items: center;
   padding: 0.6rem 0.8rem;
   border-radius: 0.5rem;
   text-align: center;
   background: var(--chakra-colors-lightgray-400);
`
const Divider = styled.div`
   display: block;
   width: 100%;
   height: 1px;
   &::before {
      content: '';
      display: block;
      margin: 0 auto;
      width: 40px;
      height: 1px;
      border-bottom: 1px solid #cbcbcb;
   }
`

const Sidebar = ({
   currAccountAddress,
   disconnectWallet,
}: {
   currAccountAddress: string
   disconnectWallet: () => void
}) => {
   const inboxNotificationCount = 3
   const nftNotificationCount = 0

   return (
      <Flex
         justifyContent="space-between"
         alignItems="center"
         flexFlow="column nowrap"
         borderRight="1px solid var(--chakra-colors-gray-200)"
         background="white"
         height="100vh"
         padding="0.2rem"
      >
         <Flex flexDirection="column" alignItems="center">
            <Box padding="0.8rem">
               <Image src={logoThumb} alt="" width="40px" />
            </Box>
            <Box mt={2}></Box>
            <Divider />
            <Box mb={5}></Box>
            <LinkElem to={'/chat'}>
               <IconMessageCircle2 size="30" stroke={1.5} />
               {inboxNotificationCount > 0 && (
                  <NotificationCount>
                     {inboxNotificationCount}
                  </NotificationCount>
               )}
            </LinkElem>
            <LinkElem to={`/nft/`}>
               <Image src={coolcat2356} alt="" width="40px" />
               {nftNotificationCount > 0 && (
                  <NotificationCount>{nftNotificationCount}</NotificationCount>
               )}
            </LinkElem>
         </Flex>
         <Flex flexDirection="column" alignItems="center">
            <LinkElem to={`/new`}>
               <IconCirclePlus size="30" stroke={1.5} />
            </LinkElem>
            <Menu>
               <MenuButton as={AccountInfo}>
                  {currAccountAddress && (
                     <>
                        <Blockies
                           seed={currAccountAddress.toLocaleLowerCase()}
                           scale={4}
                        />
                        <span
                           style={{
                              fontSize: '80%',
                              color: 'var(--chakra-colors-darkgray-500)',
                           }}
                        >
                           {currAccountAddress.substring(0, 5)}
                        </span>
                     </>
                  )}
                  <Box marginTop="0.1rem"></Box>
                  <IconChevronDown
                     size={18}
                     stroke={1.5}
                     style={{ margin: '0 auto' }}
                  />
               </MenuButton>
               <MenuList>
                  <MenuItem onClick={() => disconnectWallet()}>
                     Sign out
                  </MenuItem>
               </MenuList>
            </Menu>
         </Flex>
      </Flex>
   )
}

export default Sidebar
