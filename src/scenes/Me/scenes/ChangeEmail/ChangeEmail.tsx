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
import { IconX, IconSend } from '@tabler/icons'
import { useWallet } from '../../../../context/WalletProvider'
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'
import { log } from '@/helpers/log'

const ChangeEmail = () => {
  const account = useAppSelector((state) => selectAccount(state))

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()

  const navigate = useNavigate()
  const toast = useToast()

  const { email: _email, setEmail: globalSetEmail } = useWallet()
  const { notifyDM: _notifyDM, setNotifyDM: globalSetNotifyDM } = useWallet()
  const { notify24: _notify24, setNotify24: globalSetNotify24 } = useWallet()
  const { telegramHandle, setTelegramHandle } = useWallet()
  const { telegramCode, setTelegramCode } = useWallet()
  const dmBool = _notifyDM === 'true'
  const dailyBool = _notify24 === 'true'
  const [email, setEmail] = useState('')
  const [telegramhandle, setTgHandle] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [isDialogOn, setIsDialogOn] = useState(false)

   const getSettings = async () => {
    // try {
    //   const snapState = await window.ethereum.request({
    //     method: 'wallet_invokeSnap',
    //     params: {
    //       snapId: "npm:walletchat-metamask-snap", //"local:http://localhost:8080",
    //       request: { method: 'get_snap_state', params: { apiKey: getJwtForAccount(account), address: account } },
    //     },
    //   });
    //   //log('-[snap state]:', snapState)
    //   setIsDialogOn(snapState?.isDialogOn)
    // } catch(error) {
    //   console.error('🚨[GET][Snap State]:', error)
    // }   

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
            log('✅[GET][Settings In Change Email]:', data)
            // if (data[0]?.email) {
            //    log('-[Email]:', data[0].email)
            //    setEmail(data[0].email)
            // }
            if (data[0]?.telegramcode) {
               log('-[telegramcode]:', data[0].telegramcode)
               setTelegramCode(data[0].telegramcode)
            }
            else {
               setTelegramCode("")
            }
         })
         .catch((error) => {
            console.error('🚨[GET][Setting]:', error)
         })
   }
  const handleChangeOne = (checked: boolean) => {
    //setCheckedItems([checked, checkedItems[1]])
    globalSetNotifyDM(checked.toString())

    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/update_settings`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getJwtForAccount(account)}`,
        },
        body: JSON.stringify({
          notifydm: checked.toString(),
          walletaddr: account,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        log('✅[POST][NotifyDM]:', response)
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
  }

  const handleChangeTwo = (checked: boolean) => {
    //setCheckedItems([checkedItems[0], checked])
    globalSetNotify24(checked.toString())

    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/update_settings`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getJwtForAccount(account)}`,
        },
        body: JSON.stringify({
          notify24: checked.toString(),
          walletaddr: account,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        log('✅[POST][Notify24]:', response)
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
  }

  const handleChangeMM = async (checked: boolean) => {
    setIsDialogOn(checked)
    const method = checked ? 'set_dialog_on' : 'set_dialog_off'

    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: "npm:walletchat-metamask-snap", //"local:http://localhost:8080",
        request: { method: method, params: { apiKey: getJwtForAccount(account), address: account } },
      },
    });
    log('✅[SNAPS][Update Dialog On]:', result)
  }

  const onSubmit = (values: any) => {
      if (values?.email || values?.telegramhandle) {
      setIsFetching(true)

      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/update_settings`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
          body: JSON.stringify({
            email: values.email,
            telegramhandle: values.telegramhandle,
            walletaddr: account,
            signupsite: document.referrer,
            domain: document.domain,
          }),
        }
      )
        .then((response) => response.json())
        .then((response) => {
          log('✅[POST][Email]:', response)

          if (values?.email) {
            globalSetEmail(values.email)
          }
          if (values?.telegramhandle) {
            setTelegramHandle(values.telegramhandle)
          }
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

  getSettings()
  return (
    <Box p={6} pt={16} background='white' width='100%'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Text fontSize='3xl' fontWeight='bold' maxWidth='280px' mb={4}>
          Notification Settings
          <br />
        </Text>
        <Stack pl={0} mt={6} spacing={2}>
          <Checkbox
            size='lg'
            isChecked={dmBool}
            onChange={(e) => handleChangeOne(e.target.checked)}
          >
            Receive an email for every incoming DM
          </Checkbox>
          <Checkbox
            size='lg'
            isChecked={dailyBool}
            onChange={(e) => handleChangeTwo(e.target.checked)}
          >
            Receive notifications summary email every 24 hours
          </Checkbox>
          <Checkbox
            size='lg'
            isChecked={isDialogOn}
            onChange={(e) => handleChangeMM(e.target.checked)}
          >
            Receive New Message Pop-Ups/Respond to New Messages In Metmask
          </Checkbox>
        </Stack>
        <Divider
          orientation='horizontal'
          height='15px'
          d='inline-block'
          verticalAlign='middle'
        />
        <FormControl>
          <FormLabel fontSize='2xl'>
            Enter email to receive notifications for new messages
          </FormLabel>
          <Text color='darkgray.300' fontSize='md' mb={1}>
            Current email: <b>{_email}</b>
          </Text>
          <Flex>
            <Input
              type='text'
              size='lg'
              value={email}
              placeholder='somone@somewhere.com'
              borderColor='black'
              {...register('email', {
                required: false,
              })}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            </Flex>
            <Text color="darkgray.300" fontSize="md" mb={1}>Current TG Handle: <b>{telegramHandle}</b></Text>
            <Flex>
              <Input
                  type="text"
                  size="lg"
                  value={telegramhandle}
                  placeholder="myFunTelegramHandle"
                  borderColor="black"
                  {...register('telegramhandle', {
                    required: false,
                  })}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTgHandle(e.target.value)
                  }
              />
            </Flex>
            <Flex>
              <Button
                variant='black'
                height='10'
                type='submit'
                isLoading={isFetching}
              >
                <IconSend size='20' />
              </Button>
            </Flex>
               <Alert status="info" variant="solid" mt={4}>
                  Changed accounts must re-verify
               </Alert>
               {telegramCode && (
                  <div>
                     <br />
                     <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
                           Verify Telegram
                           <br />
                        </Text>
                        <Text fontSize="xl" mb={1}>Message <a href="https://t.me/Wallet_Chat_Bot" target="_blank">@Wallet_Chat_Bot</a> the code to verify: <b>{telegramCode}</b>
                     </Text>
                  </div>
               )}
          {errors.email && errors.email.type === 'required' && (
            <FormErrorMessage>No blank email please</FormErrorMessage>
          )}
        </FormControl>
      </form>
    </Box>
  )
}

export default ChangeEmail
