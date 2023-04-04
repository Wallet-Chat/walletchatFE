import React from 'react'
import * as wagmi from '@wagmi/core'
import { Box, Flex, Spinner, Tag, Button, Alert } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getIsWidgetContext } from '@/utils/context'
import { useWallet } from '@/context/WalletProvider'

const isWidget = getIsWidgetContext()

const ConnectWalletButton = () => {
  const {
    account,
    siweLastFailure,
    setSiweLastFailure,
    siwePending,
    connectConfig,
    isAuthenticated,
    requestSIWEandFetchJWT,
    connect,
    resetWidgetDataWithSignature,
    widgetWalletData,
    isConnected,
    widgetWalletDataRef,
    didDisconnect,
    pendingConnect,
  } = useWallet()

  const canUseWidgetConnection = isWidget && (connectConfig || widgetWalletData)
  const siweFailed = Boolean(siweLastFailure)

  const hasPendingAuth = siwePending || isAuthenticated === undefined
  const [pending, setPending] = React.useState(
    siwePending || isAuthenticated === undefined
  )
  const pendingModal = React.useRef<boolean>(false)

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

    if (!isConnected) {
      pendingConnect.current = true
      connect(connectConfig)
      resetWidgetDataWithSignature()
      requestSIWEandFetchJWT()
      return
    }

    if (!account && widgetWalletData?.requestSignature) {
      return resetWidgetDataWithSignature()
    }

    if (didDisconnect.current) {
      await wagmi.disconnect()
      connect(connectConfig)
    }

    resetWidgetDataWithSignature()
    requestSIWEandFetchJWT()
  }

  // TODO: allow changing sign-in method after already selected wallet
  // switch wallet button
  return (
    <ConnectButton.Custom>
      {({ openConnectModal, connectModalOpen }) => {
        React.useEffect(() => {
          if (pending && pendingModal.current && !isConnected) {
            openConnectModal()
          }
        }, [isConnected, openConnectModal, pending])

        React.useEffect(() => {
          if (connectModalOpen && pending && pendingModal.current) {
            pendingModal.current = false
            setPending(false)
          }
        }, [connectModalOpen, pending])

        return (() => {
          if (pending) {
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
                <Button
                  variant='black'
                  size='lg'
                  onClick={() => {
                    if (isConnected) {
                      setSiweLastFailure(null)
                      setPending(true)
                      pendingModal.current = true

                      widgetWalletDataRef.current = undefined

                      wagmi.disconnect()
                      didDisconnect.current = true
                    } else {
                      openConnectModal()
                    }
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
