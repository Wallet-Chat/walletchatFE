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
import * as ENV from '@/constants/env'

const EnterEmail = ({ account }: { account: string }) => {
   const {
      handleSubmit,
      register,
      formState: { errors },
   } = useForm()

   let navigate = useNavigate()
   const toast = useToast()

   const {setEmail: globalSetEmail} = useWallet()
   const { notifyDM: _notifyDM, setNotifyDM: globalSetNotifyDM } = useWallet()
   const { notify24: _notify24, setNotify24: globalSetNotify24 } = useWallet()
   var dmBool = (_notifyDM === 'true')
   var dailyBool = (_notify24 === 'true')
   const [email, setEmail] = useState('')
   const [isFetching, setIsFetching] = useState(false)

   const handleChangeOne = (checked: boolean) => {
      //setCheckedItems([checked, checkedItems[1]])
      globalSetNotifyDM(checked.toString())

      fetch(` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/update_settings`, {
         method: 'POST',
         credentials: "include",
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
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

      fetch(` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/update_settings`, {
         method: 'POST',
         credentials: "include",
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
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
   
   const handleCancel = () => {
      let communityChat = process.env.REACT_APP_DEFAULT_COMMUNITY || "walletchat"
      navigate(`/community/${communityChat}`)
  };

   const onSubmit = (values: any) => {
      if (values?.email) {

         setIsFetching(true)

         fetch(` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/update_settings`, {
            method: 'POST',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
            body: JSON.stringify({
               email: values.email,
               walletaddr: account,
               notify24: _notify24,
               notifyDM: _notifyDM,
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
               globalSetEmail(email)
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
                Optional Notifications
               <br />
            </Text>
            <FormControl>
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
               <FormLabel fontSize="2xl">Enter email to receive notifications (optional)</FormLabel>
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
                  <Button variant="black" height="auto" type="submit" onClick={handleCancel}>
                     ❌
                  </Button>
               </Flex>
               <FormHelperText>
                  You can change it anytime in your settings
               </FormHelperText>
               <Alert status="info" variant="solid" mt={4}>
                  You must verify your email before you will receive notifications, please check your inbox
               </Alert>
               {errors.email && errors.email.type === 'required' && (
                  <FormErrorMessage>No blank email please</FormErrorMessage>
               )}
            </FormControl>
         </form>
      </Box>
   )
}

export default EnterEmail
