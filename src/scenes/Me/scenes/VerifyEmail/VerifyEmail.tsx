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
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'
import { getCommunity } from '@/helpers/widget'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'
import { log } from '@/helpers/log'
import storage from '@/utils/extension-storage'

const VerifyEmail = () => {
  let account = useAppSelector((state) => selectAccount(state))
  let delegate = storage.get('delegate')
  if (delegate != null) {
    account = delegate
  }

  const location = useLocation()
  let verificationcode: string | null = null
  let verificationemail: string | null = null

  useEffect(() => {
    const currentPath = location.pathname
    log(`Verify Email CurrentPath: ${currentPath}`)
    const urlParams = new URLSearchParams(location.search)
    log('test: ', urlParams.get('code'))
    verificationcode = urlParams.get('code')
    verificationemail = urlParams.get('email')
  }, [location])

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()

   let navigate = useNavigate()
  const toast = useToast()
  const { email: _email, setEmail: globalSetEmail } = useWallet()
   const { telegramCode: _telegramcode, setTelegramCode } = useWallet()
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [emailVerified, setEmailVerified] = useState("")
  const [isVerifySuccess, setIsVerifySuccess] = useState(false)
  const callVerifyEmail = () => {
    fetch(
      `${ENV.REACT_APP_REST_API}/verify_email/${verificationemail}/${verificationcode}`,
      {
        method: 'GET',
      }
    )
      .then((response) => response.json())
      .then((response) => {
        log('✅[Get][VerifyEmail From Email Link]:', response)
        setFetchError(false)
        setIsVerifySuccess(true)
        navigate('/me/verify-success')
      })
      .catch((error) => {
        console.error('🚨[GET][Verify Email From Email Link]:', error)
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
  }

  useEffect(() => {
    const interval = setInterval(() => {
      getSettings()
      // getTweetCount()
    }, 5000) // every 5s

    return () => {
      clearInterval(interval)
    }
  }, [account])

  const onSubmit = (values: any) => {
    if (values?.code) {
      setIsFetching(true)
      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/verify_email/${_email}/${values.code}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
        }
      )
        .then((response) => response.json())
        .then((response) => {
          log('✅[GET][Verify Email]:', response)
          setFetchError(false)
          setIsVerifySuccess(true)
          toast({
            title: 'Success',
            description: `Notifications updated!`,
            status: 'success',
            position: 'top',
            duration: 2000,
            isClosable: true,
          })
          navigate(`/community/${getCommunity()}`)
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

   const getSettings = () => {
      if (!ENV.REACT_APP_REST_API) {
         log('REST API url not in .env', process.env)
         return
      }
      if (!account) {
         log('No account connected')
         return
      }
      fetch(` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_settings/${account}`, {
         method: 'GET',
         credentials: "include",
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
         },
      })
         .then((response) => response.json())
         .then((data) => {
            log('✅[GET][Settings In Verify Email]:', data)
            if (data[0]?.verified) {
               log('-[Verified]:', data[0].verified)
               setEmailVerified(data[0].verified)
            }
            if (data[0]?.telegramcode) {
               log('-[telegramcode]:', data[0].telegramcode)
               setTelegramCode(data[0].telegramcode)
            }

            if ((data[0]?.verified == "true" || data[0]?.verified == '') && data[0]?.telegramcode == '') {
              navigate(`/community/${getCommunity()}`)
            }
         })
         .catch((error) => {
            console.error('🚨[GET][Setting]:', error)
         })
   }
   const urlParams = new URLSearchParams(location.search);
  verificationcode = urlParams.get('code')
  verificationemail = urlParams.get('email')
  if (isVerifySuccess) {
    return (
      <Box p={6} pt={16} background='white' width='100%'>
        <form>
          <Text fontSize='3xl' fontWeight='bold' maxWidth='280px' mb={4}>
            Verify Email Success
            <br />
          </Text>
        </form>
        <Alert status='success' variant='solid' mt={4}>
          Email verification succeeded! You are now eligible to recieve
          notifications.
        </Alert>
        <Alert status='success' variant='solid' mt={4}>
          You may close this page or continue to chat here in the full web app.
        </Alert>
      </Box>
    )
  } else if (verificationcode === null) {
    getSettings()

    return (
      <Box p={6} pt={16} background='white' width='100%'>
        <form onSubmit={handleSubmit(onSubmit)}>    
            <FormControl>
            {emailVerified != "true" && emailVerified != "" && (              
              <>
            <Text fontSize='3xl' fontWeight='bold' maxWidth='280px' mb={4}>
              Verify Email
              <br />
            </Text>
            <Text color='darkgray.300' fontSize='md' mb={1}>
                Current email: <b>{_email}</b>
              </Text><FormLabel fontSize='2xl'>Enter code to verify email</FormLabel><Flex>
                  <Input
                    type='text'
                    size='lg'
                    placeholder='<10-character code from email>'
                    borderColor='black'
                    {...register('code', {
                      required: true,
                    })} />
                  <Button
                    variant='black'
                    height='auto'
                    type='submit'
                    isLoading={isFetching}
                  >
                    <IconSend size='20' />
                  </Button>
                </Flex>
              {errors.email && errors.email.type === 'required' && (
                <FormErrorMessage>No blank code please</FormErrorMessage>
              )}
              </>
            )}
            <br />
            {_telegramcode && (
                <div>
                <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
                      Verify Telegram
                      <br />
                  </Text>
                  <Text fontSize="xl" mb={1}>Message <a href="https://t.me/Wallet_Chat_Bot" target="_blank">@Wallet_Chat_Bot</a> the code to verify: <b>{_telegramcode}</b>
                  </Text>
                  <br />
                  <Text fontSize="lg" mb={1}>You should receive a confirmation TG message in less than 1 minute after messaging the verification code.               
                </Text>
                </div>
            )}
          </FormControl>
        </form>
        {fetchError && (
          <Alert status='error' variant='solid' mt={4}>
            Email Verification Failed! Please Change email again to re-verify!
          </Alert>
        )}
      </Box>
    )
  } else {
    return (
      <Box p={6} pt={16} background='white' width='100%'>
        <form>
          <Text fontSize='3xl' fontWeight='bold' maxWidth='280px' mb={4}>
            Verify Email
            <br />
          </Text>
          <FormControl>
            <Text color='darkgray.300' fontSize='md' mb={1}>
              Verifying email: <b>{_email}</b>
            </Text>
            {callVerifyEmail()}
          </FormControl>
        </form>
        {fetchError && (
          <Alert status='error' variant='solid' mt={4}>
            Email Verification Failed! Please change email again to re-verify!
          </Alert>
        )}
      </Box>
    )
  }
}

export default VerifyEmail
