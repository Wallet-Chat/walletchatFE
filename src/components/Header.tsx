import { Image, Flex } from '@chakra-ui/react'

import logo from '../images/logo.svg'
import { Link } from 'react-router-dom'

const Header = () => {

   return (
      <Flex
         justifyContent="space-between"
         alignItems="stretch"
         borderBottom="1px solid #DD4237"
         px={8}
         py={1}
         background="#FEE72E"
      >
         <Link to="/" style={{ display: "flex" }}><Image src={logo} alt="" /></Link>
      </Flex>
   )
}

export default Header
