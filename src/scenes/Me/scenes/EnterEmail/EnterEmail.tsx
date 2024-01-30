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
  Heading,
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
import { getCommunity } from '@/helpers/widget'
import { selectAccount } from '@/redux/reducers/account'
import { useAppSelector } from '@/hooks/useSelector'
import { log } from '@/helpers/log'
import { isMobile } from 'react-device-detect'
import Joyride from "react-joyride";

const emailInput = "email";
const metamaskSnap = "metamaskSnap";

const EnterEmail = () => {
  const account = useAppSelector((state) => selectAccount(state))

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm()

  const navigate = useNavigate()
  const toast = useToast()

  const { setEmail: globalSetEmail } = useWallet()
  const { notifyDM: _notifyDM, setNotifyDM: globalSetNotifyDM } = useWallet()
  const { notify24: _notify24, setNotify24: globalSetNotify24 } = useWallet()
   const { setTelegramHandle } = useWallet()
  const dmBool = _notifyDM === 'true'
  const dailyBool = _notify24 === 'true'
  const [email, setEmail] = useState('')
  const [tgHandle, setTgHandle] = useState('')
  const [twitterUsername, setTwitterUsername] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [isDialogOn, setIsDialogOn] = useState(false)
  const [{ thirdTour, thirdStep }] = useState({
    thirdTour: true,
    thirdStep: [
      {
        content: "Please enter your Email or Telegram handle to receive notifications.",
        locale: { skip: <strong>SKIP</strong> },
        placement: "bottom",
        target: `.${emailInput}`,
        disableBeacon: true,
        title: <h2><b>Notifications!</b></h2>
      },
      {
        content: "Install Metamask Snap to Use WalletChat in the Metamask Browser Extension.",
        placement: "right",
        target: `.${metamaskSnap}`,
        disableBeacon: true,
        title: <h2><b>Metamask Snap!</b></h2>
      },
    ]
  });

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

    if(!isMobile) {
      const result = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: "npm:walletchat-metamask-snap", //"local:http://localhost:8080",
          snapVersion: ENV.REACT_APP_SNAP_VERSION,
          request: { method: method, params: { apiKey: getJwtForAccount(account), address: account } },
        },
      });
      log('✅[SNAPS][Update Dialog On]:', result)
    }
  }

  const handleCancel = () => {
    navigate(`/community/${getCommunity()}`)
  }

  const onSubmit = (values: any) => {
      if (values?.email || values?.telegramhandle || values?.twitterusername) {
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
            notify24: _notify24,
            notifyDM: _notifyDM,
            signupsite: document.referrer,
            domain: document.domain,
            twitteruser: values.twitterusername
          }),
        }
      )
        .then((response) => response.json())
        .then((response) => {
          log('✅[POST][Update Settings]:', response)
          toast({
            title: 'Success',
            description: `Settings Updated Successfully`,
            status: 'success',
            position: 'top',
            duration: 2000,
            isClosable: true,
          })
          if (values?.email) {
            globalSetEmail(values.email)
          }
          if (values?.telegramhandle) {
            setTelegramHandle(values.telegramhandle)
          }
          if (values?.twitterusername) {
            setTwitterUsername(values.twitterusername)
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

  return (
    <Box p={6} background='white' width='100%'>
      <Joyride
        continuous
        run={thirdTour}
        steps={thirdStep}
        hideCloseButton
        scrollToFirstStep
        showSkipButton
        showProgress
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        {!isMobile && (
          <>
            {/* <Heading size='lg'>Use WalletChat in the Metamask Browser Extension:</Heading> */}
              <Button
                  className={metamaskSnap}
                  variant='black'
                  size='lg'
                  mb={10}
                  onClick={() => {
                    window.ethereum.request({
                      method: 'wallet_requestSnaps',
                      params: {
                        ["npm:walletchat-metamask-snap"]: { "version": ENV.REACT_APP_SNAP_VERSION },
                      },
                    });
                  }}
                  style={{ maxWidth: 'fit-content' }}
                >
                  Install WalletChat Metamask Snap
              </Button> 
          </>
        )}

        <Text fontSize='3xl' fontWeight='bold' maxWidth='280px'>
          Optional Notifications
          <br />
        </Text>
        <FormControl>
          <Stack pl={0} mt={3} spacing={2}>
            <Checkbox
              size='md'
              isChecked={dmBool}
              onChange={(e) => handleChangeOne(e.target.checked)}
            >
              Receive an email for every incoming DM
            </Checkbox>
            <Checkbox
              size='md'
              isChecked={dailyBool}
              onChange={(e) => handleChangeTwo(e.target.checked)}
            >
              Receive notifications summary email every 24 hours (DM, NFT,
              Community)
            </Checkbox>
            {/* <Checkbox
            size='lg'
            isChecked={isDialogOn}
            onChange={(e) => handleChangeMM(e.target.checked)}
          >
            Receive New Message Pop-Ups/Respond to New Messages In Metamask
          </Checkbox> */}
          </Stack>
          <Divider
            orientation='horizontal'
            height='15px'
            d='inline-block'
            verticalAlign='middle'
          />
          <FormLabel fontSize='md'>
            Enter email/TG to receive notifications (optional)
          </FormLabel>
          <Flex mb={5}>
            <Input
              type='text'
              size='lg'
              variant='outline'
              value={email}
              placeholder='somone@somewhere.com'
              {...register('email', {
                        required: false,
              })}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className={emailInput}
            />
          </Flex>
            <Flex mb={5}>
              <Input
                  type="text"
                  size="lg"
                  variant='outline'
                  value={tgHandle}
                  placeholder="myFunTelegramHandle"
                  {...register('telegramhandle', {
                    required: false,
                  })}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTgHandle(e.target.value)
                  }
              />
            </Flex>
            <Flex mb={5}>
              <Input
                  type="text"
                  size="lg"
                  variant='outline'
                  value={twitterUsername}
                  placeholder="@funTwitterUsername"
                  {...register('twitterusername', {
                    required: false,
                  })}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTwitterUsername(e.target.value)
                  }
              />
            </Flex>
            <Stack spacing={4} direction='row'>
              <Button
                variant='black'
                height='10'
                size="lg"
                type='submit'
                isLoading={isFetching}
              >
                <IconSend size='20' />
              </Button>
              <Button
                variant='black'
                height='10'
                size="lg"
                type='submit'
                onClick={handleCancel}
              >
                <IconX size="20" color="red"/>
              </Button>
          </Stack>
          <FormHelperText>
            You can change it anytime in your settings
          </FormHelperText>
          <Alert status='info' variant='solid' mt={4}>
            You must verify your email before you will receive notifications,
            please check your inbox
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
