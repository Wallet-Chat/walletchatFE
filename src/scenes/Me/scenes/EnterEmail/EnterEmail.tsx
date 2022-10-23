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
   toast,
   useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'

const EnterEmail = ({ account }: { account: string }) => {
   const {
      handleSubmit,
      register,
      formState: { errors },
   } = useForm()

   let navigate = useNavigate()
   const toast = useToast()

   const [email, setEmail] = useState('')
   const [isFetching, setIsFetching] = useState(false)

   const onSubmit = (values: any) => {
      if (values?.email) {

         setIsFetching(true)

         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/update_settings`, {
            method: 'POST',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
            body: JSON.stringify({
               email: values.email,
               walletaddr: account,
            }),
         })
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[POST][Email]:', response)
               toast({
                  title: 'Success',
                  description: `Email updated to ${email}`,
                  status: 'success',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
                })
               //navigate('/dm')
            })
            .catch((error) => {
               console.error('🚨[POST][Email]:', error)
            })
            .then(() => {
               setIsFetching(false)
            })
      }
   }

   return (
      <Box p={6} pt={16} background="white" width="100%">
         <form onSubmit={handleSubmit(onSubmit)}>
            <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
                Notification Settings
               <br />
            </Text>
            <FormControl>
               <FormLabel fontSize="2xl">Enter email to receive notifications for new messages</FormLabel>
               <Flex>
                  <Input
                     type="text"
                     size="lg"
                     value={email}
                     placeholder="somone@somewhere.com"
                     borderColor="black"
                     {...register('email', {
                        required: true,
                     })}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                     }
                  />
                  <Button variant="black" height="auto" type="submit" isLoading={isFetching}>
                     <IconSend size="20" />
                  </Button>
               </Flex>
               <FormHelperText>
                  You can change it anytime in your settings
               </FormHelperText>
               {errors.email && errors.email.type === 'required' && (
                  <FormErrorMessage>No blank email please</FormErrorMessage>
               )}
            </FormControl>
         </form>
      </Box>
   )
}

export default EnterEmail
