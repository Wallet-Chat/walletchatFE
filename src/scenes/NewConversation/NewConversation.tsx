import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import {
   Button,
   Flex,
   FormControl,
   FormErrorMessage,
   Heading,
   Input,
   Text,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import Blockies from 'react-blockies'
import { truncateAddress } from '../../helpers/truncateString'

const NewConversation = ({ web3 }: { web3: any }) => {
   const [toAddr, setToAddr] = useState<string>('')
   const {
      handleSubmit,
      register,
      formState: { errors },
   } = useForm()
   let navigate = useNavigate()

   const onSubmit = (values: any) => {
        navigate(`/chat/${toAddr}`)
   }

   const addressIsValid = async (address: string) => {
      return web3.utils.isAddress(address)
   }

   return (
      <Flex
         px={5}
         py={10}
         background="white"
         minHeight="100vh"
         justifyContent="center"
         alignItems="center"
      >
         <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl mb={5}>
               <Heading size="lg" mb={3}>
                  Start a conversation with...
               </Heading>
               <Input
                  type="text"
                  value={toAddr}
                  placeholder="Enter address (0x939...) here"
                  {...register('toAddr', {
                     validate: addressIsValid,
                  })}
                  onChange={(e) => setToAddr(e.target.value)}
               />
               {web3.utils.isAddress(toAddr) && (
                  <Flex
                     alignItems="center"
                     p={3}
                     background="lightGray.300"
                     borderRadius="md"
                     mt={2}
                  >
                     <Blockies seed={toAddr.toLocaleLowerCase()} scale={3} />
                     <Text fontWeight="bold" fontSize="md" ml={2}>
                        {truncateAddress(toAddr)}
                     </Text>
                  </Flex>
               )}
               {errors.toAddr && errors.toAddr.type === 'validate' && (
                  <FormErrorMessage>Address is not valid</FormErrorMessage>
               )}
            </FormControl>
            <Button variant="black" type="submit">
               Start chat
            </Button>
         </form>
      </Flex>
   )
}

export default NewConversation
