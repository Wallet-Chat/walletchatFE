import React from 'react'
import { Box, Flex, Spinner, Tag, Button, Alert } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getIsWidgetContext } from '@/utils/context'
import { useWallet } from '@/context/WalletProvider'

const isWidget = getIsWidgetContext()

const ConnectWalletButton = () => {
  const {
    account,
    siweLastFailure,
    siwePending,
    connectConfig,
    isAuthenticated,
    requestSIWEandFetchJWT,
    resetWidgetDataWithSignature,
    widgetWalletData,
    isConnected,
    pendingConnect,
  } = useWallet()

  const canUseWidgetConnection = isWidget && (connectConfig || widgetWalletData)
  const siweFailed = Boolean(siweLastFailure)

  const hasPendingAuth = siwePending || isAuthenticated === undefined
  const [pending, setPending] = React.useState(
    siwePending || isAuthenticated === undefined
  )

  React.useEffect(() => {
    if (hasPendingAuth) {
      setPending(true)
    }
  }, [hasPendingAuth])

  React.useEffect(() => {
    if (siweLastFailure) {
      setPending(false)
    }
  }, [siweLastFailure])

  const handleLogin = async () => {
    setPending(true)
    pendingConnect.current = true

    resetWidgetDataWithSignature()
    requestSIWEandFetchJWT()
  }

  // TODO: allow changing sign-in method after already selected wallet
  // switch wallet button
  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => {
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
                  <Tag variant='solid' colorScheme='green' mr={2}>
                    Connected
                  </Tag>
                  <Box>Use the App to Log in</Box>
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
                <Button variant='black' size='lg' onClick={openConnectModal}>
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
