import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'
import { log } from '@/helpers/log'
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import ReactGA from "react-ga4";
import { useWallet } from '@/context/WalletProvider'

interface Props {
  referralInput: string;
}

const EnterReferral = ({ referralInput }: Props) => {
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

  const [referralCode, setReferralCode] = useState('')
  const { setReferredUserStatus: globalSetReferredUserStatus } = useWallet()
  const account = useAppSelector((state) => selectAccount(state))
  const toast = useToast()
  const [isFetching, setIsFetching] = useState(false)
  //const bypassReferral = useRef()

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

    if (values?.referralCode) {
      setIsFetching(true)

      console.log("its here....: ", referralCode)

      fetch(` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/redeem_referral_code/${referralCode}`, {
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
            globalSetReferredUserStatus("existinguser", account)

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
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl className={referralInput}>
          <FormLabel fontSize='2xl'>Please Enter the Referral Code:</FormLabel>
          <Flex>
            <Input
              type='text'
              size='lg'
              value={referralCode}
              placeholder='wc-xxxxxxxxx'
              borderColor='black'
              {...register('referralCode', {
                required: true,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  setReferralCode(e.target.value)
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
                log(referralCode)
              }}
            >
              <IconSend size='20' />
            </Button>
          </Flex>
          <FormLabel fontSize="l">
            If you do not have a code please&nbsp;       
            <a
              href="https://twitter.com/intent/tweet?text=LFC%20is%20the%20new%20LFG!%20(I%20need%20a%20code!)%20%40wallet_chat%20%23chat2earn"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
                Tweet @wallet_chat!
            </a>
            <br></br>
            <br></br>
            No Twitter?  No problem, proceed without referral chat points by using: <b>wc-test</b>
            <br></br>
          </FormLabel>
          {errors.referralCode &&
            errors.referralCode.type === 'required' &&
            // <FormErrorMessage>No blank code please</FormErrorMessage>
            toast({
              title: 'FAILED',
              description: `No blank/invalid code please ${errors.referralCode}`,
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
