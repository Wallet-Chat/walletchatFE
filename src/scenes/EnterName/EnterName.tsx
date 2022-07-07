import {
   Box,
   Button,
   Flex,
   FormControl,
   FormErrorMessage,
   FormHelperText,
   FormLabel,
   Input,
   Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'
import { useWallet } from '../../context/WalletProvider'

const EnterName = ({ account }: { account: string }) => {
   const {
      handleSubmit,
      register,
      formState: { errors },
   } = useForm()

   const {
      setName: globalSetName
   } = useWallet()

   const [name, setName] = useState('')

   const onSubmit = (values: any) => {
      if (values?.name) {
      fetch(` ${process.env.REACT_APP_REST_API}/name`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            name: values.name,
            address: account
         }),
      })
         .then((response) => response.json())
         .then((response) => {
            console.log('✅[POST][Name]:', response)
            globalSetName(name)
         })
         .catch((error) => {
            console.error('🚨[POST][Name]:', error)
         })
      }
   }

   return (
      <Box p={6} pt={16} background="white" width="100%">
         <form onSubmit={handleSubmit(onSubmit)}>
            <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
               Hey there!
               <br />A warm welcome to the WalletChat Community!
            </Text>
            <FormControl>
               <FormLabel fontSize="2xl">What's your name?</FormLabel>
               <Flex>
                  <Input
                     type="text"
                     size="lg"
                     value={name}
                     placeholder="Real or anon name"
                     {...register('name', {
                        required: true,
                     })}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setName(e.target.value)
                     }
                  />
                  <Button variant="black" height="auto" type="submit">
               
               <IconSend size="20" />
            </Button>
            </Flex>
               <FormHelperText>
                  You can change it anytime in your settings
               </FormHelperText>
               {errors.name && errors.name.type === 'required' && (
                <FormErrorMessage>No blank name please</FormErrorMessage>
                )}
            </FormControl>
            
         </form>
      </Box>
   )
}

export default EnterName
