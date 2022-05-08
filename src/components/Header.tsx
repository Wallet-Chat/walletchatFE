import { Box, Button, Image, Flex } from '@chakra-ui/react'

import logo from '../images/logo.svg'
import { Link } from 'react-router-dom'

const Header = () => {

   return (
      <Flex
         justifyContent="space-between"
         alignItems="stretch"
         borderBottom="1px solid var(--chakra-colors-gray-200)"
         px={8}
         py={1}
         background="white"
      >
         <Link to="/" style={{ display: "flex" }}><Image src={logo} alt="" /></Link>

         {/* <Box p={2}>
            <Button variant="black" borderRadius="1.5rem">
               <Flex alignItems="center">
                  <Box mr={1}>Sign in</Box>
               </Flex>
            </Button>
         </Box> */}
      </Flex>
   )
}

export default Header
