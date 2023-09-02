import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'
import OpenSeaNFT from '../../../../types/OpenSea/NFT'
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'
import { log } from '@/helpers/log'
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import ReactGA from "react-ga4";
import { useWallet } from '@/context/WalletProvider'
import { endpoints } from '@/redux/reducers/dm'
import { useAppDispatch } from '@/hooks/useDispatch'

const EnterReferral = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm()

  /* Initialize analytics instance */
  const analyticsGA4 = Analytics({
    app: 'WalletChatApp',
    plugins: [
      /* Load Google Analytics v4 */
      googleAnalyticsPlugin({
        measurementIds: [ENV.REACT_APP_GOOGLE_GA4_KEY],
      }),
    ],
  })
  ReactGA.initialize(ENV.REACT_APP_GOOGLE_GA4_KEY);

  const { setReferredUserStatus } = useWallet()
  const account = useAppSelector((state) => selectAccount(state))
  const toast = useToast()

  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    log(errors)
  }, [errors])

  const onSubmit = (values: any) => {
    log('onSubmit')
    log('Values are: ', values)
    if (!getJwtForAccount(account)) {
      toast({
        title: 'Error',
        description: `You must sign the message pending in your wallet before entering the code!`,
        status: 'error',
        position: 'top',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    if (values?.code) {
      setIsFetching(true)

      fetch(` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/redeem_referral_code/${code}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${getJwtForAccount(account)}`,
        }
      })
        .then((response) => response.json())
        .then((response) => {
            log('✅[POST][ReferralCode Valid!]:', response)

            //update client side global variable referral_code
            setReferredUserStatus(account)

            ReactGA.event({
              category: "EnteredReferralCode",
              action: "EnteredReferralCode",
              label: "EnteredReferralCode", // optional
            });
        })
        .catch((error) => {
          toast({
            title: 'Error',
            description: `Referral Code Already Used or Invalid`,
            status: 'error',
            position: 'top',
            duration: 2500,
            isClosable: true,
          })
          console.error('🚨[POST][Name]:', error)
        })
        .then(() => {
          setIsFetching(false)
        })
    }
  }

  return (
    <Box flexGrow={1} p={6} pt={16} background='white' width='100%'>
      <Text fontSize='3xl' fontWeight='bold' maxWidth='280px' mb={4}>
        Welcome to the WalletChat Community!
      </Text>
      <Divider
        orientation='horizontal'
        height='15px'
        d='inline-block'
        verticalAlign='middle'
      />
      <Divider
        orientation='horizontal'
        height='15px'
        d='inline-block'
        verticalAlign='middle'
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <FormLabel fontSize='2xl'>Please Enter the Referral Code:</FormLabel>
          <Flex>
            <Input
              type='text'
              size='lg'
              value={code}
              placeholder='wc-xxxxxxxxx'
              borderColor='black'
              {...register('code', {
                required: true,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  setCode(e.target.value)
                },
              })}
            />
            <Button
              variant='black'
              height='auto'
              type='submit'
              isLoading={isFetching}
              onClick={() => {
                log('SUBMIT BTN')
                log(errors)
                log(code)
              }}
            >
              <IconSend size='20' />
            </Button>
          </Flex>
          {/* <FormHelperText>
            format is wc-xxxxxxxxxx
          </FormHelperText> */}
          {errors.code &&
            errors.code.type === 'required' &&
            // <FormErrorMessage>No blank code please</FormErrorMessage>
            toast({
              title: 'FAILED',
              description: `No blank/invalid code please ${errors.code}`,
              status: 'error',
              position: 'top',
              duration: 2000,
              isClosable: true,
            })}
        </FormControl>
      </form>
    </Box>
  )
}

export default EnterReferral
