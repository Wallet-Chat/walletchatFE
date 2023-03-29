import { Box, Flex, Spinner, Tag, Button, Alert } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getIsWidgetContext } from '@/utils/context'
import { useWallet } from '@/context/WalletProvider'

const isWidget = getIsWidgetContext()

const ConnectWalletButton = () => {
  const {
    siweFailed,
    siwePending,
    connectConfig,
    isAuthenticated,
    doRequestSiwe,
    connect,
  } = useWallet()

  // TODO: allow changing sign-in method after already selected wallet
  // switch wallet button
  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => {
        return (() => {
          if (siwePending || isAuthenticated === undefined) {
            return (
              <>
                <Spinner />

                <Alert status='success' variant='solid' mt={4}>
                  You must sign the pending message in your connected wallet
                </Alert>
              </>
            )
          }

          if (siweFailed || (isWidget && connectConfig)) {
            return (
              <Flex direction='column' gap={2} alignItems='start'>
                <Button
                  variant='black'
                  size='lg'
                  onClick={() =>
                    siweFailed ? doRequestSiwe() : connect(connectConfig)
                  }
                >
                  <Tag variant='solid' colorScheme='green' mr={2}>
                    Connected
                  </Tag>
                  <Box>Log in</Box>
                </Button>

                <Button variant='black' size='lg' onClick={openConnectModal}>
                  Sign in with another wallet
                </Button>

                {siweFailed && (
                  <Tag variant='solid' colorScheme='red'>
                    Signature failed or rejected, please try again
                  </Tag>
                )}
              </Flex>
            )
          }

          return (
            <Button variant='black' size='lg' onClick={openConnectModal}>
              Sign in using wallet
            </Button>
          )
        })()
      }}
    </ConnectButton.Custom>
  )
}

export default ConnectWalletButton
