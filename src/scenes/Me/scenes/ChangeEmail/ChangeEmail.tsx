import {
   Alert,
   Box,
   Button,
   Checkbox,
   Divider,
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
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'
import { useWallet } from '../../../../context/WalletProvider'

const ChangeEmail = ({ account }: { account: string }) => {
   const {
      handleSubmit,
      register,
      formState: { errors },
   } = useForm()

   let navigate = useNavigate()
   const toast = useToast()

   const { email: _email, setEmail: globalSetEmail } = useWallet()
   const { notifyDM: _notifyDM, setNotifyDM: globalSetNotifyDM } = useWallet()
   const { notify24: _notify24, setNotify24: globalSetNotify24 } = useWallet()
   var dmBool = (_notifyDM === 'true')
   var dailyBool = (_notify24 === 'true')
   const [email, setEmail] = useState('')
   const [isFetching, setIsFetching] = useState(false)

   const handleChangeOne = (checked: boolean) => {
      //setCheckedItems([checked, checkedItems[1]])
      globalSetNotifyDM(checked.toString())

      fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/update_settings`, {
         method: 'POST',
         credentials: "include",
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt_' + account)}`,
         },
         body: JSON.stringify({
            notifydm: checked.toString(), 
            walletaddr: account,
         }),
      })
         .then((response) => response.json())
         .then((response) => {
            console.log('✅[POST][NotifyDM]:', response)
            toast({
               title: 'Success',
               description: `Notifications updated!`,
               status: 'success',
               position: 'top',
               duration: 2000,
               isClosable: true,
             })
         })
         .catch((error) => {
            console.error('🚨[POST][NotifyDM]:', error)
         })
   };

   const handleChangeTwo = (checked: boolean) => {
      //setCheckedItems([checkedItems[0], checked])
      globalSetNotify24(checked.toString())

      fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/update_settings`, {
         method: 'POST',
         credentials: "include",
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt_' + account)}`,
         },
         body: JSON.stringify({
            notify24: checked.toString(), 
            walletaddr: account,
         }),
      })
         .then((response) => response.json())
         .then((response) => {
            console.log('✅[POST][Notify24]:', response)
            toast({
               title: 'Success',
               description: `Notifications updated!`,
               status: 'success',
               position: 'top',
               duration: 2000,
               isClosable: true,
             })
         })
         .catch((error) => {
            console.error('🚨[POST][Notify24]:', error)
         })
   };

   const onSubmit = (values: any) => {
      if (values?.email) {

         setIsFetching(true)

         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/update_settings`, {
            method: 'POST',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt_' + account)}`,
            },
            body: JSON.stringify({
               email: values.email, 
               walletaddr: account,
               signupsite: document.referrer,
               domain: document.domain
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
               globalSetEmail(values.email)
               navigate('/me/verify-email')
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
            <Stack pl={0} mt={6} spacing={2}>
            <Checkbox
               size="lg"
               isChecked={dmBool}
               onChange={(e) => handleChangeOne(e.target.checked)}
            >
               Receive an email for every incoming DM 
            </Checkbox>
            <Checkbox
               size="lg"
               isChecked={dailyBool}
               onChange={(e) => handleChangeTwo(e.target.checked)}
            >
               Receive notifications summary email every 24 hours (DM, NFT, Community)
            </Checkbox>
            </Stack>
            <Divider
               orientation="horizontal"
               height="15px"
               d="inline-block"
               verticalAlign="middle"
          />
            <FormControl>
               <FormLabel fontSize="2xl">Enter email to receive notifications for new messages</FormLabel>
               <Text color="darkgray.300" fontSize="md" mb={1}>Current email: <b>{_email}</b></Text>
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
               <Alert status="info" variant="solid" mt={4}>
                  You must verify your email again if changed here
               </Alert>
               {errors.email && errors.email.type === 'required' && (
                  <FormErrorMessage>No blank email please</FormErrorMessage>
               )}
            </FormControl>
         </form>
      </Box>
   )
}

export default ChangeEmail
