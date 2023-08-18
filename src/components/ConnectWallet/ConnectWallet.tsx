import React, { useState } from 'react'
import { Box, Flex, Spinner, Tag, Button, Alert } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getIsWidgetContext } from '@/utils/context'
import { useWallet } from '@/context/WalletProvider'
import { getWidgetOriginName } from '@/helpers/widget'
import { log } from '@/helpers/log'
import { getJwtForAccount } from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import storage from '@/utils/extension-storage'
import {
  selectAccount,
  selectIsAuthenticated,
  setAccount,
} from '@/redux/reducers/account'
import { useAppDispatch } from '@/hooks/useDispatch'
import { getWidgetUrl, postMessage } from '@/helpers/widget'

const AlertBubble = ({
  children,
  color,
}: {
  children: string
  color: 'green' | 'red'
}) => (
  <Flex
    justifyContent='center'
    alignItems='center'
    borderRadius='lg'
    background={color === 'green' ? 'green.200' : 'red.200'}
    p={4}
    position='sticky'
    top={0}
    right={0}
    zIndex={1}
  >
    <Box fontSize='md'>{children}</Box>
  </Flex>
)

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
  const [isClicked, setIsClicked] = useState<boolean>(false);

  const account = useAppSelector((state) => selectAccount(state))
  const isAuthenticated = useAppSelector((state) =>
    selectIsAuthenticated(state)
  )

  const canUseWidgetConnection = isWidget
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
    setIsClicked(true);
    
    // setPending(true)
    pendingConnect.current = true

    //TODO: check for existing JWT (account is usually null here though)
    postMessage({ target: 'do_parent_sign_in' })

    // resetWidgetDataWithSignature()
    // const canSignIn = await requestSIWEandFetchJWT()
    // if (canSignIn && account) {
    //   signIn(account, getJwtForAccount(account) || '')
    // }
  }

  // TODO: allow changing sign-in method after already selected wallet
  // switch wallet button
  return (
    <ConnectButton.Custom>
      {({ account: connectedAccount, openConnectModal }) => {
        React.useEffect(() => {
          if (connectedAccount) {
            // setNonce(null)
            //storage.set('current-address', connectedAccount.address)
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
                <div>
                  <Button variant='black' size='lg' onClick={handleLogin}>
                    <Tag
                      variant='solid'
                      colorScheme='green'
                      mr={2}
                      minWidth='unset'
                    >
                      Sign In
                    </Tag>
                    <Box whiteSpace='break-spaces'>
                      Sign Into {getWidgetOriginName() || 'WalletChat'}
                    </Box>
                  </Button>
                  {isClicked && (
                    <AlertBubble color='green'>
                      Please approve sign-in in your wallet
                    </AlertBubble>
                  )}
                </div>
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

              {/* {(siweFailed || canUseWidgetConnection) && (
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
              )} */}
{/* 
              {siweFailed && (
                <Tag variant='solid' colorScheme='red'>
                  Signature failed or rejected, please try again
                </Tag>
              )} */}
            </Flex>
          )
        })()
      }}
    </ConnectButton.Custom>
  )
}

export default ConnectWalletButton
