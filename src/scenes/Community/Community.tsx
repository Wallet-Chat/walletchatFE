import { Flex, Tag } from '@chakra-ui/react'
import { Route, Routes } from 'react-router-dom'

import CreateCommunity from './scenes/CreateCommunity'
import { useIsMobileView } from '../../context/IsMobileViewProvider'
import CommunityInboxList from './scenes/CommunityInboxList'
import CommunityByName from './scenes/CommunityByName'

const Community = () => {
   const { isMobileView } = useIsMobileView()

   return (
      <Routes>
         <Route
            index
            element={
               <Flex>
                  <CommunityInboxList />
                  {!isMobileView && (
                     <Flex
                        background="lightgray.200"
                        flex="1"
                        alignItems="center"
                        justifyContent="center"
                     >
                        <Tag background="white">
                           Select a chat to start messaging
                        </Tag>
                     </Flex>
                  )}
               </Flex>
            }
         />
         <Route
            path="new"
            element={
               <Flex>
                  <CreateCommunity />
                  {!isMobileView && (
                     <Flex
                        background="lightgray.200"
                        flex="1"
                        alignItems="center"
                        justifyContent="center"
                     ></Flex>
                  )}
               </Flex>
            }
         />
         <Route
            path=":community/:contentType?"
            element={
               <Flex>
                  <CommunityInboxList />
                  <CommunityByName />
               </Flex>
            }
         />
      </Routes>
   )
}

export default Community
