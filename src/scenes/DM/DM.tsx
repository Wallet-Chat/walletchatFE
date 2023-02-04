import { Flex, Tag } from '@chakra-ui/react'
import { Route, Routes } from 'react-router'
import { useIsMobileView } from '../../context/IsMobileViewProvider'
import CreateNewDM from './scenes/CreateNewDM'
import DMByAddress from './scenes/DMByAddress'
import DMInboxList from './scenes/DMInboxList'

const DM = () => {
   const { isMobileView } = useIsMobileView()

   return (
      <Routes>
         <Route
            index
            element={
               <Flex>
                  <DMInboxList />
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
                  <CreateNewDM />
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
            path=":address"
            element={
               <Flex>
                  {!isMobileView && <DMInboxList />}
                  <DMByAddress />
               </Flex>
            }
         />
      </Routes>
   )
}

export default DM
