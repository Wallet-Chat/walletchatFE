import React from 'react'
import { AnalyticsBrowser } from '@segment/analytics-next'
import { IconSend } from '@tabler/icons'
import { Textarea, Button, Flex } from '@chakra-ui/react'
import { postFetchOptions } from '@/helpers/fetch'
import lit from '../../../../utils/lit'
import { useWallet } from '@/context/WalletProvider'
import * as ENV from '@/constants/env'
import {
  updateQueryData,
  updateLocalDmDataForAccountToAddr,
  addLocalDmDataForAccountToAddr,
} from '@/redux/reducers/dm'
import { useAppDispatch } from '@/hooks/useDispatch'
import { ChatMessageType, CreateChatMessageType } from '@/types/Message'
import { getAccessControlConditions } from '@/helpers/lit'

function Submit({ toAddr, account }: { toAddr: string; account: string }) {
  const { name } = useWallet()

  const dispatch = useAppDispatch()

  const textAreaRef = React.useRef<HTMLTextAreaElement>(null)
  const msgInput = React.useRef<string>('')
  const analytics = AnalyticsBrowser.load({
    writeKey: ENV.REACT_APP_SEGMENT_KEY as string,
  })

  const addPendingMessageToUI = (newMessage: ChatMessageType) =>
    dispatch(
      updateQueryData('getChatData', { account, toAddr }, (chatData) => {
        const chatDataValue = JSON.parse(chatData)?.messages || []
        chatDataValue.push(newMessage)
        addLocalDmDataForAccountToAddr(account, toAddr, [newMessage])
        return JSON.stringify({ messages: chatDataValue })
      })
    )

  const updateSentMessage = (message: ChatMessageType, timestamp: string) =>
    dispatch(
      updateQueryData('getChatData', { account, toAddr }, (chatData) => {
        const chatDataValue = JSON.parse(chatData)?.messages || []

        const index = chatDataValue.findIndex(
          (chat: ChatMessageType) => chat.timestamp === timestamp
        )
        chatDataValue[index] = {
          ...message,
          message: chatDataValue[index].message,
        }

        updateLocalDmDataForAccountToAddr(account, toAddr, chatDataValue)
        return JSON.stringify({ messages: chatDataValue })
      })
    )

  const sendMessage = async () => {
    const value = msgInput.current

    if (value.length <= 0) return

    analytics.track('SendMessage', {
      site: document.referrer,
      account,
    })

    // clear input field
    if (textAreaRef.current) textAreaRef.current.value = ''

    const createMessageData: CreateChatMessageType = {
      message: value,
      fromaddr: account.toLocaleLowerCase(),
      toaddr: toAddr.toLocaleLowerCase(),
      nftid: '0',
      lit_access_conditions: '',
      encrypted_sym_lit_key: '',
    }

    const timestamp = new Date().toString()

    const newMessage: ChatMessageType = {
      ...createMessageData,
      Id: -1,
      timestamp,
      timestamp_dtm: timestamp,
      sender_name: name,
      read: false,
      nftaddr: '',
    }

    // Already show message on the UI with the spinner as Loading
    // because it will begin to encrypt the message and only confirm
    // it was sent after a successful response
    addPendingMessageToUI(newMessage)

    const accessControlConditions = getAccessControlConditions(
      createMessageData.fromaddr,
      createMessageData.toaddr
    )

    console.log('ℹ️[POST][Encrypting Message]', value, accessControlConditions)

    const encrypted = await lit.encryptString(
      account,
      value,
      accessControlConditions
    )
    createMessageData.message = await lit.blobToB64(encrypted.encryptedFile)
    createMessageData.encrypted_sym_lit_key = encrypted.encryptedSymmetricKey
    createMessageData.lit_access_conditions = JSON.stringify(
      accessControlConditions
    )

    console.log('✅[POST][Encrypted Message]:', createMessageData)

    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/create_chatitem`,
      postFetchOptions(createMessageData, account)
    )
      .then((response) => response.json())
      .then((responseData) => {
        console.log('✅[POST][Send Message]:', responseData)
        updateSentMessage(responseData, timestamp)
      })
      .catch((error) => {
        console.error('🚨[POST][Send message]:', error, createMessageData)
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
            description: value,
            user: 347112,
          }),
        })
          .then((response) => response.json())
          .then((responseData) => {
            console.log('✅[POST][Feedback]:', responseData)
          })
          .catch((error) => {
            console.error(
              '🚨[POST][Feedback]:',
              error,
              JSON.stringify(createMessageData)
            )
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
    <Flex p='4' alignItems='center' justifyContent='center' gap='4'>
      <Textarea
        placeholder='Write a message...'
        ref={textAreaRef}
        onChange={(e) => {
          msgInput.current = e.target.value
        }}
        onKeyPress={handleKeyPress}
        minH='full'
        resize='none'
        px='3'
        py='3'
        w='100%'
        fontSize='md'
        background='lightgray.400'
        borderRadius='xl'
      />

      <Flex alignItems='flex-end'>
        <Button
          variant='black'
          onClick={sendMessage}
          borderRadius='full'
          minH='full'
          px='0'
          py='0'
          w='12'
          h='12'
        >
          <IconSend size='22' />
        </Button>
      </Flex>
    </Flex>
  )
}

export default Submit
