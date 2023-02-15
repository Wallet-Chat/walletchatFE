import React from 'react'
import { IconSend } from '@tabler/icons'
import TextareaAutosize from 'react-textarea-autosize'
import { FormControl, Button, Flex } from '@chakra-ui/react'
import { postFetchOptions } from '@/helpers/fetch'
import { MessageUIType } from '../../../../types/Message'
import lit from '../../../../utils/lit'
import * as ENV from '@/constants/env'

function Submit({
  delegate,
  loadedMsgs,
  toAddr,
  setLoadedMsgs,
  account,
  scrollToBottomRef,
}: {
  delegate: string
  loadedMsgs: any
  toAddr: string
  setLoadedMsgs: any
  account: string
  scrollToBottomRef: any
}) {
  const [isSendingMessage, setIsSendingMessage] = React.useState(false)
  const [msgInput, setMsgInput] = React.useState<string>('')

  const addMessageToUI = React.useCallback(
    (
      message: string,
      fromAddr: string,
      timestamp: string,
      read: boolean,
      position: string,
      isFetching: boolean,
      nftAddr: string | null,
      nftId: string | null
    ) => {
      console.log(`Add message to UI: ${message}`)

      const newMsg: MessageUIType = {
        message,
        fromAddr,
        toAddr,
        timestamp,
        read,
        position,
        isFetching,
        nftAddr,
        nftId,
      }
      const newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
      newLoadedMsgs.push(newMsg)
      setLoadedMsgs(newLoadedMsgs)
    },
    [loadedMsgs]
  )

  const sendMessage = async () => {
    if (msgInput.length <= 0) return

    // Make a copy and clear input field
    const msgInputCopy = ` ${msgInput}`.slice(1)
    setMsgInput('')

    const timestamp = new Date()

    const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs))

    const data = {
      message: msgInputCopy,
      fromAddr: account.toLocaleLowerCase(),
      toAddr: toAddr.toLocaleLowerCase(),
      timestamp,
      nftid: '0',
      encrypted_sym_lit_key: '',
      lit_access_conditions: '',
      read: false,
    }

    addMessageToUI(
      msgInputCopy,
      account,
      timestamp.toString(),
      false,
      'right',
      true,
      null,
      null
    )

    scrollToBottomRef.current?.scrollIntoView()

    // data.message = msgInputCopy
    const accessControlConditions = [
      {
        conditionType: 'evmBasic',
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: data.toAddr,
        },
      },
      { operator: 'or' },
      {
        conditionType: 'evmBasic',
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: data.fromAddr,
        },
      },
      { operator: 'or' }, // delegate.cash full wallet delegation
      {
        conditionType: 'evmContract',
        contractAddress: '0x00000000000076A84feF008CDAbe6409d2FE638B',
        functionName: 'checkDelegateForAll',
        functionParams: [':userAddress', data.toAddr],
        functionAbi: {
          inputs: [
            {
              name: 'delegate',
              type: 'address',
              internalType: 'address',
            },
            {
              name: 'vault',
              type: 'address',
              internalType: 'address',
            },
          ],
          name: 'checkDelegateForAll',
          outputs: [
            {
              name: '',
              type: 'bool',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
        chain: 'ethereum',
        returnValueTest: {
          key: '',
          comparator: '=',
          value: 'true',
        },
      },
      { operator: 'or' }, // delegate.cash full wallet delegation
      {
        conditionType: 'evmContract',
        contractAddress: '0x00000000000076A84feF008CDAbe6409d2FE638B',
        functionName: 'checkDelegateForAll',
        functionParams: [':userAddress', data.fromAddr],
        functionAbi: {
          inputs: [
            {
              name: 'delegate',
              type: 'address',
              internalType: 'address',
            },
            {
              name: 'vault',
              type: 'address',
              internalType: 'address',
            },
          ],
          name: 'checkDelegateForAll',
          outputs: [
            {
              name: '',
              type: 'bool',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
        chain: 'ethereum',
        returnValueTest: {
          key: '',
          comparator: '=',
          value: 'true',
        },
      },
    ]

    console.log('✅[TEST][Delegate Wallet]:', delegate)

    console.log(
      '✅[POST][Encrypting Message]:',
      msgInputCopy,
      accessControlConditions
    )
    const encrypted = await lit.encryptString(
      msgInputCopy,
      accessControlConditions
    )
    data.message = await lit.blobToB64(encrypted.encryptedFile)
    data.encrypted_sym_lit_key = encrypted.encryptedSymmetricKey
    data.lit_access_conditions = JSON.stringify(accessControlConditions)
    console.log('✅[POST][Encrypted Message]:', data)

    setIsSendingMessage(true)
    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/create_chatitem`,
      postFetchOptions()
    )
      .then((response) => response.json())
      .then((responseData) => {
        console.log('✅[POST][Send Message]:', responseData, latestLoadedMsgs)
        // getChatData()
      })
      .catch((error) => {
        console.error('🚨[POST][Send message]:', error, JSON.stringify(data))
      })
      .finally(() => {
        setIsSendingMessage(false)
      })

    if (
      toAddr.toLocaleLowerCase() ===
      '0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase()
    ) {
      if (!ENV.REACT_APP_SLEEKPLAN_API_KEY) {
        console.log('Missing REACT_APP_SLEEKPLAN_API_KEY')
      } else {
        fetch(`https://api.sleekplan.com/v1/post`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ENV.REACT_APP_SLEEKPLAN_API_KEY}`,
          },
          body: JSON.stringify({
            title: account,
            type: 'feedback',
            description: msgInputCopy,
            user: 347112,
          }),
        })
          .then((response) => response.json())
          .then((responseData) => {
            console.log('✅[POST][Feedback]:', responseData)
          })
          .catch((error) => {
            console.error('🚨[POST][Feedback]:', error, JSON.stringify(data))
          })
      }
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Flex>
      <FormControl style={{ flexGrow: 1 }}>
        <TextareaAutosize
          placeholder='Write a message...'
          value={msgInput}
          onChange={(e) => setMsgInput(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e)}
          className='custom-scrollbar'
          style={{
            resize: 'none',
            padding: '.5rem 1rem',
            width: '100%',
            fontSize: 'var(--chakra-fontSizes-md)',
            background: 'var(--chakra-colors-lightgray-400)',
            borderRadius: '0.3rem',
            marginBottom: '-6px',
          }}
          maxRows={8}
        />
      </FormControl>
      <Flex alignItems='flex-end'>
        <Button
          variant='black'
          height='100%'
          onClick={() => sendMessage()}
          isLoading={isSendingMessage}
        >
          <IconSend size='20' />
        </Button>
      </Flex>
    </Flex>
  )
}

export default Submit
