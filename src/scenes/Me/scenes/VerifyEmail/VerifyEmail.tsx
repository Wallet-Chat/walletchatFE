import {
   Alert,
   Box,
   Button,
   Checkbox,
   Flex,
   FormControl,
   FormErrorMessage,
   FormHelperText,
   FormLabel,
   Input,
   Stack,
   Text,
   toast,
   useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'
import { useWallet } from '../../../../context/WalletProvider'

const VerifyEmail = ({ account }: { account: string }) => {
   const location = useLocation();
   let verificationcode: string | null = null;
   let verificationemail: string | null = null;
   
   useEffect(() => {
      const currentPath = location.pathname;
      console.log(`Verify Email CurrentPath: ${currentPath}`)
      const urlParams = new URLSearchParams(location.search);
      console.log("test: ", urlParams.get('code'))
      verificationcode = urlParams.get('code')
      verificationemail = urlParams.get('email')
   }, [location]);

   const {
      handleSubmit,
      register,
      formState: { errors },
   } = useForm()

   let navigate = useNavigate()
   const toast = useToast()
   const { email: _email, setEmail: globalSetEmail } = useWallet()
   const [isFetching, setIsFetching] = useState(false)
   const [fetchError, setFetchError] = useState(false)
   const [isVerifySuccess, setIsVerifySuccess] = useState(false)
   const callVerifyEmail = () => {
      fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/verify_email/${verificationemail}/${verificationcode}`, {
         method: 'GET',
         credentials: "include",
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
         },
      })
         .then((response) => response.json())
         .then((response) => {
            console.log('✅[Get][VerifyEmail]:', response)
             setFetchError(false)
             setIsVerifySuccess(true)
             navigate('/me/verify-email')
         })
         .catch((error) => {
            console.error('🚨[GET][Verify Email]:', error)
            setFetchError(true)
            setIsVerifySuccess(false)
            navigate('/me/verify-email')
            // toast({
            //    title: 'Error',
            //    description: `Verification Failed!`,
            //    status: 'error',
            //    position: 'top',
            //    duration: 2000,
            //    isClosable: true,
            //  })
         })
   };


   const onSubmit = (values: any) => {
      if (values?.code) {
         setIsFetching(true)
         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/verify_email/${_email}/${values.code}`, {
            method: 'GET',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
         })
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[GET][Verify Email]:', response)
                setFetchError(false)
                setIsVerifySuccess(true)
                navigate('/community/walletchat')
            })
            .catch((error) => {
               console.error('🚨[GET][Verify Email]:', error)
               // toast({
               //    title: 'Error',
               //    description: `Verification Failed!`,
               //    status: 'error',
               //    position: 'top',
               //    duration: 2000,
               //    isClosable: true,
               //  })
               setFetchError(true)
               setIsVerifySuccess(false)
               navigate('/me/verify-email')
            })
            .then(() => {
               setIsFetching(false)
            })
      }
   }

   const urlParams = new URLSearchParams(location.search);
   verificationcode = urlParams.get('code')
   verificationemail = urlParams.get('email')
   if (isVerifySuccess) {
      return (
      <Box p={6} pt={16} background="white" width="100%">
            <form>
               <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
                  Verify Email Success
                  <br />
               </Text>
            </form>
               <Alert status="success" variant="solid" mt={4}>
                  Email verification succeeded!  You are now eligible to recieve notifications.  
               </Alert>
               <Alert status="success" variant="solid" mt={4}>
                  You may close this page or continue to chat here in the full web app.
               </Alert>        
         </Box>  
      )
   } else if (verificationcode === null) {
      return (
         <Box p={6} pt={16} background="white" width="100%">
            <form onSubmit={handleSubmit(onSubmit)}>
               <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
                  Verify Email
                  <br />
               </Text>
               <FormControl>
                  <Text color="darkgray.300" fontSize="md" mb={1}>Current email: <b>{_email}</b></Text>
                  <FormLabel fontSize="2xl">Enter code to verify email</FormLabel>
                  <Flex>
                     <Input
                        type="text"
                        size="lg"
                        placeholder="<10-character code from email>"
                        borderColor="black"
                        {...register('code', {
                           required: true,
                        })}
                     />
                     <Button variant="black" height="auto" type="submit" isLoading={isFetching}>
                        <IconSend size="20" />
                     </Button>
                  </Flex>
                  {errors.email && errors.email.type === 'required' && (
                     <FormErrorMessage>No blank code please</FormErrorMessage>
                  )}
               </FormControl>
            </form>
            {fetchError && (
               <Alert status="error" variant="solid" mt={4}>
                  Email Verification Failed!  Please Change email again to re-verify!
               </Alert>
            )}
         </Box>
      )
   } else {
      return (
      <Box p={6} pt={16} background="white" width="100%">
            <form>
               <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
                  Verify Email
                  <br />
               </Text>
               <FormControl>
                  <Text color="darkgray.300" fontSize="md" mb={1}>Verifying email: <b>{_email}</b></Text>
                  {callVerifyEmail()}
               </FormControl>
            </form>
            {fetchError && (
               <Alert status="error" variant="solid" mt={4}>
                  Email Verification Failed!  Please Change email again to re-verify!
               </Alert>
            )}
         </Box>  
      )
   }
}

export default VerifyEmail
