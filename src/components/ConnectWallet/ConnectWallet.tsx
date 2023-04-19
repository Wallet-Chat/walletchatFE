import React from 'react'
import { Box, Flex, Spinner, Tag, Button, Alert } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getIsWidgetContext } from '@/utils/context'
import { useWallet } from '@/context/WalletProvider'
import { getWidgetOriginName } from '@/helpers/widget'
import { getJwtForAccount } from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import {
  selectAccount,
  selectIsAuthenticated,
  setAccount,
} from '@/redux/reducers/account'
import { useAppDispatch } from '@/hooks/useDispatch'

const isWidget = getIsWidgetContext()

const ConnectWalletButton = () => {
  const {
    siweLastFailure,
    siwePending,
    requestSIWEandFetchJWT,
    signIn,
    resetWidgetDataWithSignature,
    pendingConnect,
    clearWidgetData,
    previousWidgetData,
  } = useWallet()
  const dispatch = useAppDispatch()

  const account = useAppSelector((state) => selectAccount(state))
  const isAuthenticated = useAppSelector((state) =>
    selectIsAuthenticated(state)
  )

  const canUseWidgetConnection = isWidget && previousWidgetData?.current
  const siweFailed = Boolean(siweLastFailure)

  const hasPendingAuth = siwePending || isAuthenticated === undefined

  // React.useEffect(() => {
  //   if (hasPendingAuth) {
  //     setPending(true)
  //   }
  // }, [hasPendingAuth])

  // React.useEffect(() => {
  //   if (siweLastFailure) {
  //     setPending(false)
  //   }
  // }, [siweLastFailure])

  const handleLogin = async () => {
    // setPending(true)
    pendingConnect.current = true

    resetWidgetDataWithSignature()
    const canSignIn = await requestSIWEandFetchJWT()
    if (canSignIn && account) {
      signIn(account, getJwtForAccount(account) || '')
    }
  }

  // TODO: allow changing sign-in method after already selected wallet
  // switch wallet button
  return (
    <ConnectButton.Custom>
      {({ account: connectedAccount, openConnectModal }) => {
        React.useEffect(() => {
          if (connectedAccount) {
            // setNonce(null)
            dispatch(setAccount(connectedAccount.address))
          }
        }, [connectedAccount])

        return (() => {
          if (hasPendingAuth) {
            return (
              <>
                <Spinner />

                {hasPendingAuth && (
                  <Alert status='success' variant='solid' mt={4}>
                    You must sign the pending message in your connected wallet
                  </Alert>
                )}
              </>
            )
          }

          return (
            <Flex direction='column' gap={2} alignItems='start'>
              {canUseWidgetConnection ? (
                <Button variant='black' size='lg' onClick={handleLogin}>
                  <Tag
                    variant='solid'
                    colorScheme='green'
                    mr={2}
                    minWidth='unset'
                  >
                    Connected
                  </Tag>
                  <Box whiteSpace='break-spaces'>
                    Connect with {getWidgetOriginName() || 'App'}
                  </Box>
                </Button>
              ) : (
                <Button
                  variant='black'
                  size='lg'
                  onClick={
                    siweFailed ? requestSIWEandFetchJWT : openConnectModal
                  }
                >
                  {siweFailed ? 'Retry signature' : 'Sign in using wallet'}
                </Button>
              )}

              {(siweFailed || canUseWidgetConnection) && (
                <Button
                  variant='black'
                  size='lg'
                  onClick={() => {
                    if (canUseWidgetConnection) clearWidgetData()
                    openConnectModal()
                  }}
                >
                  Sign in with another wallet
                </Button>
              )}

              {siweFailed && (
                <Tag variant='solid' colorScheme='red'>
                  Signature failed or rejected, please try again
                </Tag>
              )}
            </Flex>
          )
        })()
      }}
    </ConnectButton.Custom>
  )
}

export default ConnectWalletButton
